// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes (no auth middleware here)
router.post('/register-admin', authController.registerAdmin);
router.post('/login', authController.login);

module.exports = router;
