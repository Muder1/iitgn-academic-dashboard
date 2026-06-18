const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyIITGN = require('../middleware/auth'); // Our gatekeeper

const prisma = new PrismaClient();

// POST /api/auth/sync
// Syncs a Firebase user to our PostgreSQL database
router.post('/sync', verifyIITGN, async (req, res) => {
  try {
    const { email, uid, name } = req.user; 
    const { admissionYear, discipline } = req.body; // Sent from frontend during first login

    // Check if the user already exists in our database
    let user = await prisma.user.findUnique({
      where: { id: uid }
    });

    // If they don't exist, create them
    if (!user) {
      if (!admissionYear || !discipline) {
        return res.status(400).json({ error: 'Admission Year and Discipline are required for new users.' });
      }

      user = await prisma.user.create({
        data: {
          id: uid,
          email: email,
          name: name || 'IITGN Student',
          admissionYear: parseInt(admissionYear),
          discipline: discipline
        }
      });
    }

    res.status(200).json({ message: 'User synced successfully', user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;