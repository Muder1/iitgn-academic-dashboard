const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// Helper to convert abbreviation to Full Name (Needed for Curriculum lookup)
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
  return branchMap[abbreviation?.toUpperCase()] || abbreviation;
};

// NEW HELPER: Convert Full Name to abbreviation (Needed for the Open Elective logic)
const getBranchAbbrev = (name) => {
  const reverseMap = {
    'Computer Science & Engineering': 'CSE',
    'Mechanical Engineering': 'ME',
    'Civil Engineering': 'CE',
    'Electrical Engineering': 'EE',
    'Chemical Engineering': 'CL',
    'Materials Engineering': 'MSE',
    'Artificial Intelligence': 'AI',
    'Integrated Circuit Design': 'ICDT'
  };
  // If it's already an abbreviation, the map returns undefined, so we just uppercase it
  return reverseMap[name] || name?.toUpperCase();
};

// Helper to get the true absolute total graduation requirement
const getAbsoluteTotal = (year, branchName) => {
  if (year >= 2025) {
    return branchName === 'Civil Engineering' ? 171 : 173;
  } else {
    if (['Electrical Engineering', 'Artificial Intelligence', 'Mechanical Engineering', 'Integrated Circuit Design'].includes(branchName)) {
      return 172; 
    }
    return 170;
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

    // 1. Get the FULL name to query the curriculum targets accurately
    const fullBranchName = getFullBranchName(user.discipline);
    
    // 2. Get the ABBREVIATION to check against the course.branches array
    const userAbbrev = getBranchAbbrev(user.discipline);

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
      let basketName = record.course?.basket?.name || 'Uncategorized';
      const credits = record.course?.credits || 0;
      
      const courseBranches = record.course?.branches || [];

      // --- FIX: CROSS-BRANCH INTERCEPTION RULE ---
      // Compare the abbreviation array against the user's abbreviation
      if (basketName === 'Discipline Core' && courseBranches.length > 0 && !courseBranches.includes(userAbbrev)) {
        basketName = 'Open Elective';
      }
      // -------------------------------------------

      // Ensure the bucket exists
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

    const trueTotalTarget = getAbsoluteTotal(user.admissionYear, fullBranchName);

    res.json({ analysis, totalTarget: trueTotalTarget });

  } catch (error) {
    console.error("Basket analysis error:", error);
    res.status(500).json({ error: 'Failed to generate basket analysis' });
  }
});

module.exports = router;