import { Router } from "express";

import { login, registerAdmin, logout } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";
import {
  validateLogin,
  validateRegisterAdmin,
} from "../middleware/validators.js";
import {
  rateLimiter,
  applyHelmet,
} from "../middleware/security.js";

const router = Router();

// security
router.use(applyHelmet);
router.use(rateLimiter);

router.post("/register-admin", validateRegisterAdmin, registerAdmin);
router.post("/login", validateLogin, login);

// optional: protect logout so only logged‑in users call it
router.post("/logout", auth(), logout);

export default router;
