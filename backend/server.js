// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectDB } from './src/config/db.js';        // fixed named import
import errorHandler from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import financeRoutes from './src/routes/finance.routes.js';
import leaseRoutes from './src/routes/lease.routes.js';
import unitRoutes from './src/routes/unit.routes.js';
import propertyRoutes from './src/routes/property.routes.js';
import maintenanceRoutes from './src/routes/maintenanceRoutes.js';
import { applyHelmet, rateLimiter } from './src/middleware/security.js';

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS – allow your Vite dev origin
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global security middleware
app.use(applyHelmet);
app.use(rateLimiter);

// Common middleware
app.use(express.json());

// DB
// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/test-helmet', (req, res) => {
  res.send('helmet headers test');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Error handler after routes
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
