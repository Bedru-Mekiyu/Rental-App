// src/routes/payment.routes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const ALLOWED_ROLES = ['PM', 'ADMIN'];

router.post(
  '/',
  auth(ALLOWED_ROLES),
  paymentController.createPayment
);

router.patch(
  '/:id/status',
  auth(ALLOWED_ROLES),
  paymentController.updatePaymentStatus
);

router.get(
  '/by-lease/:leaseId',
  auth(ALLOWED_ROLES),
  paymentController.listByLease
);

router.get(
  '/by-tenant/:tenantId',
  auth(ALLOWED_ROLES),
  paymentController.listByTenant
);

module.exports = router;
