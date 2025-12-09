// src/routes/finance.routes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const financeController = require('../controllers/financeController');

// FS, PM, GM, ADMIN can view summaries
const ALLOWED_ROLES = ['FS', 'PM', 'GM', 'ADMIN'];

router.get(
  '/lease/:leaseId/summary',
  auth(ALLOWED_ROLES),
  financeController.getLeaseSummary
);

module.exports = router;
