// src/routes/lease.routes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const leaseController = require('../controllers/leaseController');

// adjust allowed roles if needed
const MANAGE_ROLES = ['PM', 'ADMIN'];
const VIEW_ROLES = ['PM', 'ADMIN', 'FS', 'GM', 'TENANT'];

// Create lease
router.post(
  '/',
  auth(MANAGE_ROLES),
  leaseController.createLease
);

// Get lease by id
router.get(
  '/:id',
  auth(VIEW_ROLES),
  leaseController.getLeaseById
);

// List leases by tenant
router.get(
  '/by-tenant/:tenantId',
  auth(VIEW_ROLES),
  leaseController.listLeasesByTenant
);

// End lease
router.patch(
  '/:id/end',
  auth(MANAGE_ROLES),
  leaseController.endLease
);

module.exports = router;
