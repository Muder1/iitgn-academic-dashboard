const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// Your specific grading scale mapped to 10-point numbers
const gradePoints = {
  'A+': 11,
  'A': 10,
  'A-': 9,
  'B': 8,
  'B-': 7,
  'C': 6,
  'C-': 5,
  'D': 4,
  'F': 0
};

router.get('/', verifyIITGN, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      include: {
        records: {
          include: { course: true }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const completedRecords = user.records.filter(r => r.status === 'COMPLETED');
    const plannedRecords = user.records.filter(r => r.status === 'PLANNED');

    const completedCredits = completedRecords.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
    const plannedCredits = plannedRecords.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
    const targetCredits = 172; 

    // --- NEW: CGPA CALCULATION ENGINE ---
    let totalQualityPoints = 0;
    let totalGradedCredits = 0;

    completedRecords.forEach(record => {
      // Only calculate if the grade exists in our mapping system
      if (record.grade && gradePoints[record.grade] !== undefined) {
        const credits = record.course?.credits || 0;
        const points = gradePoints[record.grade];
        
        totalQualityPoints += (credits * points);
        totalGradedCredits += credits;
      }
    });

    // Calculate up to 2 decimal places, default to 0.00 if no courses taken yet
    const currentCGPA = totalGradedCredits > 0 
      ? (totalQualityPoints / totalGradedCredits).toFixed(2) 
      : "0.00";

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        admissionYear: user.admissionYear,
        discipline: user.discipline
      },
      stats: {
        completedCredits,
        plannedCredits,
        targetCredits,
        coursesTaken: completedRecords.length,
        cgpa: currentCGPA // Sending the new CGPA to the frontend!
      },
      records: user.records
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;