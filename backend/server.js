const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const recordsRoutes = require('./routes/records');
const basketsRoutes = require('./routes/baskets');
const specializationsRoutes = require('./routes/specializations');
const adminRoutes = require('./routes/admin');

// Load environment variables
dotenv.config();

const app = express();

// --- UPDATED CORS CONFIGURATION ---
const corsOptions = {
  origin: [
    'http://localhost:5173', // Keeps your local laptop development working
    'http://localhost:3000', // Alternative local port
    'https://iitgn-academic-dashboard-frontend.vercel.app' // CRITICAL: Replace this string with your exact Vercel URL!
  ],
  credentials: true, // Required if you are passing cookies or Firebase auth headers
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Allows your React frontend to communicate with this backend securely
app.use(express.json()); // Allows the server to accept JSON data

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/baskets', basketsRoutes);
app.use('/api/specializations', specializationsRoutes);
app.use('/api/admin', adminRoutes);

// A simple test route to ensure the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running beautifully!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});