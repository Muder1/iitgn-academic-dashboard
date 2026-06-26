const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/baskets/analysis
router.get('/analysis', verifyIITGN, async (req, res) => {
  try {
    // 1. Fetch user records including course and the SINGLE basket definition
    const records = await prisma.academicRecord.findMany({
      where: { userId: req.user.uid },
      include: {
        course: {
          // FIX 1: Changed 'baskets' to singular 'basket' to match new schema
          include: { basket: true } 
        }
      }
    });

    // 2. Define standard total credit targets per basket type
    // FIX 2: Updated these keys to match the actual Baskets we seeded in the database
    const targets = {
      'Institute Core': 34, 
      'Discipline Core': 48,
      'Discipline Elective': 12,
      'Open Elective': 12,
      'Humanities': 12,
      'Math': 8,
      'Science': 6
    };

    // 3. Initialize analysis structure
    const analysis = {};
    Object.keys(targets).forEach(basket => {
      analysis[basket] = { completed: 0, planned: 0, required: targets[basket], courses: [] };
    });

    // 4. Group credits dynamically
    records.forEach(record => {
      const credits = record.course?.credits || 0;

      // FIX 3: Pull the name directly from the single linked basket object
      const basketName = record.course?.basket?.name || 'Open Elective';

      // Safety check: If a course has a new basket not in our targets list, create a bucket for it dynamically
      if (!analysis[basketName]) {
        analysis[basketName] = { completed: 0, planned: 0, required: 0, courses: [] };
      }

      if (record.status === 'COMPLETED') {
        analysis[basketName].completed += credits;
      } else if (record.status === 'PLANNED') {
        analysis[basketName].planned += credits;
      }
      
      analysis[basketName].courses.push({
        id: record.courseId,
        code: record.course?.code, // Added code so the frontend bullet points render properly!
        title: record.course?.title,
        credits: credits,
        status: record.status
      });
    });

    res.json(analysis);
  } catch (error) {
    console.error("Basket analysis error:", error);
    res.status(500).json({ error: 'Failed to generate basket analysis' });
  }
});

module.exports = router;