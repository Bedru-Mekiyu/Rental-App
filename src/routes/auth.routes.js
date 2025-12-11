const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const {rateLimiter, applyHelmet} = require('../middleware/security')
const {validateLogin, validateRegisterAdmin} = require('../middleware/validators')

// security
router.use(applyHelmet)
router.use(rateLimiter)

// Public routes 
router.post('/register-admin', validateRegisterAdmin, authController.registerAdmin);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
