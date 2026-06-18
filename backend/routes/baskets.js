const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/baskets/analysis
router.get('/analysis', verifyIITGN, async (req, res) => {
  try {
    // 1. Fetch user records including course and basket definitions
    const records = await prisma.academicRecord.findMany({
      where: { userId: req.user.uid },
      include: {
        course: {
          include: { baskets: true }
        }
      }
    });

    // 2. Define standard total credit targets per basket type
    const targets = {
      'Basic Science': 20,
      'Engineering Science': 24,
      'Institute Core': 15,
      'Discipline Core': 48,
      'Humanities (HSS)': 20,
      'Electives': 28
    };

    // 3. Initialize analysis structure
    const analysis = {};
    Object.keys(targets).forEach(basket => {
      analysis[basket] = { completed: 0, planned: 0, required: targets[basket], courses: [] };
    });

    // 4. Group credits dynamically
    records.forEach(record => {
      const courseBaskets = record.course?.baskets || [];
      const credits = record.course?.credits || 0;

      // Find which basket this course belongs to, default to Electives if unmapped
      const basketName = courseBaskets.length > 0 ? courseBaskets[0].basketName : 'Electives';

      if (analysis[basketName]) {
        if (record.status === 'COMPLETED') {
          analysis[basketName].completed += credits;
        } else if (record.status === 'PLANNED') {
          analysis[basketName].planned += credits;
        }
        analysis[basketName].courses.push({
          id: record.courseId,
          title: record.course.title,
          credits: credits,
          status: record.status
        });
      }
    });

    res.json(analysis);
  } catch (error) {
    console.error("Basket analysis error:", error);
    res.status(500).json({ error: 'Failed to generate basket analysis' });
  }
});

module.exports = router;