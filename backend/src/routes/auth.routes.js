// src/routes/auth.routes.js
import { Router } from 'express';
import { login, registerAdmin, logout } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import {
  validateLogin,
  validateRegisterAdmin,
} from '../middleware/validators.js';
// You already apply helmet + rateLimiter globally in server.js
// import { rateLimiter, applyHelmet } from '../middleware/security.js';

const router = Router();

// If you want extra protection only on auth routes, uncomment:
// router.use(applyHelmet);
// router.use(rateLimiter);

router.post('/register-admin', validateRegisterAdmin, registerAdmin);
router.post('/login', validateLogin, login);
router.post('/logout', auth(), logout);

export default router;
