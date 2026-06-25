const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth');

const prisma = new PrismaClient();

// CUSTOM MIDDLEWARE: Check if user is an Admin
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.uid } });
    if (user && user.isAdmin) {
      next(); // Pass the gate
    } else {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error checking permissions.' });
  }
};

// POST /api/admin/courses - Add a new course
router.post('/courses', verifyIITGN, verifyAdmin, async (req, res) => {
  try {
    const { code, title, credits, basket, branch } = req.body;
    
    // Create the course once with all 5 required fields
    const newCourse = await prisma.course.create({
      data: { 
        code: code.toUpperCase(), // Ensure the code is consistently uppercase
        title, 
        credits: parseInt(credits), 
        basket, 
        branch 
      }
    });
    
    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Database error:", error); // Helpful for debugging
    if (error.code === 'P2002') return res.status(400).json({ error: 'Course code already exists.' });
    res.status(500).json({ error: 'Failed to create course.' });
  }
});

// DELETE /api/admin/courses/:id - Remove a course
router.delete('/courses/:id', verifyIITGN, verifyAdmin, async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Deleting a course might fail if students already have it in their history
    // We must delete associated CourseBasket mappings first
    await prisma.courseBasket.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });
    
    res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Cannot delete course. It may be linked to student records.' });
  }
});

module.exports = router;