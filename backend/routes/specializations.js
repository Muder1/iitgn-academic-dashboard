const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/specializations - Fetch progress and user declarations
router.get('/', verifyIITGN, async (req, res) => {
  try {
    // Fetch the user's declared specializations
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      select: { pursuingHonors: true, pursuingMinor: true }
    });

    // Fetch the records
    const records = await prisma.academicRecord.findMany({
      where: { 
        userId: req.user.uid,
        OR: [ { isHonors: true }, { isMinor: true } ]
      },
      include: { 
        course: { include: { basket: true } } 
      }
    });

    const honorsRecords = records.filter(r => r.isHonors);
    const minorRecords = records.filter(r => r.isMinor);
    const sumCredits = (courseArray) => courseArray.reduce((sum, r) => sum + (r.course?.credits || 0), 0);

    res.json({
      declarations: {
        honors: user?.pursuingHonors || false,
        minor: user?.pursuingMinor || null
      },
      honors: {
        creditsEarned: sumCredits(honorsRecords),
        required: 20, // Standard IITGN Honors requirement
        courses: honorsRecords
      },
      minor: {
        creditsEarned: sumCredits(minorRecords),
        required: 20, // Standard IITGN Minor requirement
        courses: minorRecords
      }
    });
  } catch (error) {
    console.error("Specializations error:", error);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
});

// POST /api/specializations/declare - Update declarations
router.post('/declare', verifyIITGN, async (req, res) => {
  try {
    const { pursuingHonors, pursuingMinor } = req.body;
    
    await prisma.user.update({
      where: { id: req.user.uid },
      data: { 
        pursuingHonors, 
        // If empty string passed, convert to null for the database
        pursuingMinor: pursuingMinor === '' ? null : pursuingMinor 
      }
    });
    
    res.status(200).json({ message: 'Specializations updated successfully' });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: 'Failed to save declarations' });
  }
});

module.exports = router;