const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/specializations
router.get('/', verifyIITGN, async (req, res) => {
  try {
    // Find all records where either Honors or Minor is true
    const records = await prisma.academicRecord.findMany({
      where: { 
        userId: req.user.uid,
        OR: [ { isHonors: true }, { isMinor: true } ]
      },
      include: { course: true }
    });

    const honorsRecords = records.filter(r => r.isHonors);
    const minorRecords = records.filter(r => r.isMinor);

    // Calculate total credits for each
    const sumCredits = (courseArray) => courseArray.reduce((sum, r) => sum + (r.course?.credits || 0), 0);

    res.json({
      honors: {
        creditsEarned: sumCredits(honorsRecords),
        required: 20,
        courses: honorsRecords
      },
      minor: {
        creditsEarned: sumCredits(minorRecords),
        required: 20,
        courses: minorRecords
      }
    });
  } catch (error) {
    console.error("Specializations error:", error);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
});

module.exports = router;