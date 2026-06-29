const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/analysis', verifyIITGN, async (req, res) => {
  try {
    // 1. Fetch user and their course records
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      include: {
        records: {
          include: { course: { include: { basket: true } } }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. Fetch the requirements directly from the database based on the user's profile
    const requirements = await prisma.curriculumRequirement.findMany({
      where: {
        AND: [
          { cohortStart: { lte: user.admissionYear } },
          { cohortEnd: { gte: user.admissionYear } },
          { OR: [{ branch: user.discipline }, { branch: 'All' }] }
        ]
      },
      include: { basket: true }
    });

    // 3. Build the analysis structure using the fetched DB targets
    const analysis = {};
    let totalRequiredCredits = 0;

    requirements.forEach(req => {
      const basketName = req.basket.name;
      totalRequiredCredits += req.creditsTarget;
      
      analysis[basketName] = {
        required: req.creditsTarget,
        completed: 0,
        planned: 0,
        courses: []
      };
    });

    // 4. Fill the buckets with the user's records
    user.records.forEach(record => {
      const basketName = record.course?.basket?.name || 'Uncategorized';
      const credits = record.course?.credits || 0;

      // Create an overflow bucket if they took a course outside their strict requirements
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

    res.json({ analysis, totalTarget: totalRequiredCredits });

  } catch (error) {
    console.error("Basket analysis error:", error);
    res.status(500).json({ error: 'Failed to generate basket analysis' });
  }
});

module.exports = router;