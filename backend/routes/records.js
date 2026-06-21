const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/records/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// POST /api/records
router.post('/', verifyIITGN, async (req, res) => {
  try {
    const { courseId, semester, grade, status, isHonors, isMinor } = req.body;

    const newRecord = await prisma.academicRecord.create({
      data: {
        userId: req.user.uid,
        courseId: courseId,
        semester: parseInt(semester),
        grade: grade || null,
        status: status || 'COMPLETED',
        isHonors: isHonors || false,
        isMinor: isMinor || false
      }
    });

    res.status(201).json(newRecord);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This course is already in your history or planner.' });
    }
    res.status(500).json({ error: 'Failed to add record' });
  }
});

// DELETE /api/records/:id
router.delete('/:id', verifyIITGN, async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    await prisma.academicRecord.deleteMany({
      where: { id: recordId, userId: req.user.uid }
    });
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;