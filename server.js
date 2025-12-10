// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB
connectDB();

// health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/finance', require('./src/routes/finance.routes'));
app.use('/api/leases', require('./src/routes/lease.routes'));

// error handler (after routes)
app.use(errorHandler);

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
