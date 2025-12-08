// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== DB CONNECTION =====
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rms';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ===== ROUTES =====

// Auth routes (you need a routes file that uses authController)
const authController = require('./src/controllers/authController');
const router = express.Router();
router.post('/register-admin', authController.registerAdmin);
router.post('/login', authController.login);
// Auth routes
app.use('/api/auth', require('./src/routes/auth.routes'));

// Domain routes
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/finance', require('./src/routes/finance.routes'));
app.use('/api/leases', require('./src/routes/lease.routes'));

// ===== ERROR HANDLER (optional basic) =====
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
