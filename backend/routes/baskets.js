const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// Helper dictionary to convert common abbreviations to DB strings
const getFullBranchName = (abbreviation) => {
  const branchMap = {
    'CSE': 'Computer Science & Engineering',
    'ME': 'Mechanical Engineering',
    'CE': 'Civil Engineering',
    'EE': 'Electrical Engineering',
    'CL': 'Chemical Engineering',
    'MSE': 'Materials Engineering',
    'AI': 'Artificial Intelligence',
    'ICDT': 'Integrated Circuit Design'
  };
  // Return the mapped name, or the original if it's already spelled out
  return branchMap[abbreviation?.toUpperCase()] || abbreviation;
};

// Helper to get the true absolute total graduation requirement
const getAbsoluteTotal = (year, branchName) => {
  if (year >= 2025) {
    // 2025+ Cohort is 173 for everyone except Civil (171)
    return branchName === 'Civil Engineering' ? 171 : 173;
  } else {
    // 2022-2024 Cohort logic
    if (['Electrical Engineering', 'Artificial Intelligence', 'Mechanical Engineering', 'Integrated Circuit Design'].includes(branchName)) {
      // EE bumped to 172 in 2024, but we'll use 172 as standard for these branches
      return 172; 
    }
    return 170; // Standard for CS, CE, CL, MSE
  }
};

router.get('/analysis', verifyIITGN, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      include: {
        records: {
          include: { course: { include: { basket: true } } }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // FIX 1: Safely map the user's discipline string
    const fullBranchName = getFullBranchName(user.discipline);

    // Fetch the requirements
    const requirements = await prisma.curriculumRequirement.findMany({
      where: {
        AND: [
          { cohortStart: { lte: user.admissionYear } },
          { cohortEnd: { gte: user.admissionYear } },
          { OR: [{ branch: fullBranchName }, { branch: 'All' }] }
        ]
      },
      include: { basket: true }
    });

    const analysis = {};

    // Build the analysis structure
    requirements.forEach(req => {
      const basketName = req.basket.name;
      analysis[basketName] = {
        required: req.creditsTarget,
        completed: 0,
        planned: 0,
        courses: []
      };
    });

    // Fill the buckets with the user's records
    user.records.forEach(record => {
      const basketName = record.course?.basket?.name || 'Uncategorized';
      const credits = record.course?.credits || 0;

      if (!analysis[basketName]) {
        analysis[basketName] = { required: 0, completed: 0, planned: 0, courses: [] };
      }

      if (record.status === 'COMPLETED') {
        analysis[basketName].completed += credits;
      } else if (record.status === 'PLANNED') {
        analysis[basketName].planned += credits;
      }

      analysis[basketName].courses.push({
        id: record.courseId,
        code: record.course?.code,
        title: record.course?.title,
        credits: credits,
        status: record.status
      });
    });

    // FIX 2: Explicitly assign the correct true total instead of summing baskets
    const trueTotalTarget = getAbsoluteTotal(user.admissionYear, fullBranchName);

    res.json({ analysis, totalTarget: trueTotalTarget });

  } catch (error) {
    console.error("Basket analysis error:", error);
    res.status(500).json({ error: 'Failed to generate basket analysis' });
  }
});

module.exports = router;