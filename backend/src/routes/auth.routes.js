import { Router } from "express"
import { auth, loginLimiter, refreshLimiter } from "../middleware/auth-advanced.js"
import {
	registerAdmin,
	login,
	verifyTwoFactor,
	logout,
	refreshAccessToken,
} from "../controllers/authController.js"
import {
	validateLogin,
	validateRegisterAdmin,
	validateVerifyTwoFactor,
	validateRefreshToken,
} from "../middleware/validators.js"

const router = Router()

router.post("/register-admin", auth(["ADMIN"]), validateRegisterAdmin, registerAdmin)
router.post("/login", loginLimiter, validateLogin, login)
router.post("/verify-2fa", validateVerifyTwoFactor, verifyTwoFactor)
router.post("/refresh", refreshLimiter, validateRefreshToken, refreshAccessToken)
router.post("/refresh-token", refreshLimiter, validateRefreshToken, refreshAccessToken)
router.post("/logout", auth(), logout)

export default router
