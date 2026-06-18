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

// Middleware
app.use(cors()); // Allows your React frontend to communicate with this backend
app.use(express.json()); // Allows the server to accept JSON data

app.use('/api/auth',authRoutes);
app.use('/api/dashboard',dashboardRoutes);
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