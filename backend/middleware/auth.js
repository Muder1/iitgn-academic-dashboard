const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('../config/firebase-service-account.json');

// Initialize Firebase Admin properly with the new modular API
try {
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  // Ignore the "default app already exists" error that sometimes happens with Nodemon restarts
  if (!/already exists/.test(error.message)) {
    console.error('Firebase initialization error', error.stack);
  }
}

const verifyIITGN = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 1. Verify the token with the new getAuth() method
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // 2. Enforce the IITGN domain rule
    if (!decodedToken.email || !decodedToken.email.endsWith('@iitgn.ac.in')) {
      return res.status(403).json({ error: 'Forbidden: Must use an @iitgn.ac.in email address' });
    }

    // 3. Attach the user data to the request for the next route to use
    req.user = decodedToken;
    next();

  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyIITGN;