import User from "../models/User-Enhanced.js"
import TwoFactorAuth from "../models/TwoFactorAuth.js"
import Session from "../models/Session.js"
import PasswordService from "../services/passwordService.js"
import TwoFactorService from "../services/twoFactorService.js"
import SessionService from "../services/sessionService.js"
import jwt from "jsonwebtoken"
import { logAction } from "../utils/auditLogger.js"
import EncryptionService from "../services/encryptionService.js" // Declared the EncryptionService

function buildJwtSignOptions(expiresIn) {
  const options = { expiresIn }
  if (process.env.JWT_ISSUER) {
    options.issuer = process.env.JWT_ISSUER
  }
  if (process.env.JWT_AUDIENCE) {
    options.audience = process.env.JWT_AUDIENCE
  }
  return options
}

function buildJwtVerifyOptions() {
  const options = { algorithms: ["HS256"] }
  if (process.env.JWT_ISSUER) {
    options.issuer = process.env.JWT_ISSUER
  }
  if (process.env.JWT_AUDIENCE) {
    options.audience = process.env.JWT_AUDIENCE
  }
  return options
}

/**
 * Register admin with security requirements
 */
export async function registerAdmin(req, res) {
  try {
    const { email, password, name, phone } = req.body

    // Validate password complexity
    const passwordValidation = PasswordService.validatePasswordComplexity(password)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: "Password does not meet requirements",
        errors: passwordValidation.errors,
      })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(password)

    // Create user with encrypted phone
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
      phoneNumber_encrypted: phone ? EncryptionService.encrypt(phone) : null,
      forcePasswordChangeOnLogin: false,
    })

    // Initialize 2FA
    await TwoFactorAuth.create({
      userId: user._id,
      emailOtpEnabled: true,
      totpEnabled: false,
    })

    // Log action
    await logAction({
      userId: req.user?._id,
      action: "ADMIN_CREATED",
      entityType: "User",
      entityId: user._id,
      details: { email, name },
    })

    res.status(201).json({
      message: "Admin created successfully",
      userId: user._id,
      email: user.email,
    })
  } catch (error) {
    console.error("Register admin error:", error)
    res.status(500).json({ message: "Failed to create admin" })
  }
}

/**
 * Login with 2FA support
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email, isDeleted: false })
    if (!user) {
      await logAction({
        userId: null,
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: null,
        details: { email, reason: "User not found" },
      })

      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if account locked
    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      return res.status(429).json({
        message: "Account locked due to too many failed attempts. Try again later.",
      })
    }

    // Verify password
    const passwordMatch = await PasswordService.comparePassword(password, user.password)
    if (!passwordMatch) {
      user.failedLoginAttempts += 1

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }

      await user.save()

      await logAction({
        userId: user._id,
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: user._id,
        details: { email, attempts: user.failedLoginAttempts },
      })

      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0
    user.accountLockedUntil = null
    await user.save()

    // Check if 2FA required
    const twoFactor = await TwoFactorAuth.findOne({ userId: user._id })
    const requiresTwoFactor = twoFactor && (twoFactor.emailOtpEnabled || twoFactor.totpEnabled)

    if (requiresTwoFactor) {
      // Send OTP email
      const otp = await TwoFactorService.generateEmailOTP(user.email, user._id)
      await TwoFactorAuth.updateOne(
        { userId: user._id },
        {
          emailOtpCode: otp.codeHash,
          emailOtpExpiresAt: otp.expiresAt,
          verifyAttempts: 0,
          lockoutUntil: null,
        },
      )

      return res.status(200).json({
        message: "2FA code sent to email",
        requiresTwoFactor: true,
        tempSessionId: jwt.sign(
          { userId: user._id, stage: "2fa" },
          process.env.JWT_SECRET,
          buildJwtSignOptions("10m"),
        ),
      })
    }

    // Create session
    const session = await SessionService.createSession(user._id, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    })

    // Generate access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role, sessionId: session.sessionId },
      process.env.JWT_SECRET,
      buildJwtSignOptions("15m"),
    )

    user.lastLoginAt = new Date()
    await user.save()

    await logAction({
      userId: user._id,
      action: "LOGIN_SUCCESS",
      entityType: "User",
      entityId: user._id,
      details: { email },
    })

    res.json({
      message: "Login successful",
      accessToken,
      token: accessToken,
      sessionId: session.sessionId,
      refreshToken: session.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        forcePasswordChange: user.forcePasswordChangeOnLogin,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Login failed" })
  }
}

/**
 * Verify 2FA code
 */
export async function verifyTwoFactor(req, res) {
  try {
    const { tempSessionId, code, method } = req.body // method: "TOTP" | "EMAIL"

    const decoded = jwt.verify(tempSessionId, process.env.JWT_SECRET, buildJwtVerifyOptions())
    if (decoded.stage !== "2fa") {
      return res.status(401).json({ message: "Invalid 2FA session" })
    }

    const user = await User.findById(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid 2FA session" })
    }

    const twoFactor = await TwoFactorAuth.findOne({ userId: user._id })
    if (!twoFactor) {
      return res.status(401).json({ message: "2FA configuration not found" })
    }

    // Check lockout
    if (twoFactor.lockoutUntil && new Date() < twoFactor.lockoutUntil) {
      return res.status(429).json({ message: "2FA attempts locked. Try again later." })
    }

    let isValid = false

    if (method === "TOTP") {
      isValid = TwoFactorService.verifyTOTPToken(twoFactor.totpSecret, code)
    } else if (method === "EMAIL") {
      isValid = TwoFactorService.verifyEmailOTP(code, twoFactor.emailOtpCode, twoFactor.emailOtpExpiresAt)
    } else if (method === "BACKUP") {
      isValid = TwoFactorService.verifyBackupCode(code, twoFactor.usedBackupCodes)
      if (isValid) {
        twoFactor.usedBackupCodes.push(code)
      }
    }

    if (!isValid) {
      twoFactor.verifyAttempts += 1

      if (twoFactor.verifyAttempts >= 5) {
        twoFactor.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000)
      }

      await twoFactor.save()

      await logAction({
        userId: user._id,
        action: "2FA_FAILED",
        entityType: "User",
        entityId: user._id,
        details: { method, attempts: twoFactor.verifyAttempts },
      })

      return res.status(401).json({ message: "Invalid 2FA code" })
    }

    // Reset attempts
    twoFactor.verifyAttempts = 0
    twoFactor.lastVerifiedAt = new Date()
    twoFactor.emailOtpCode = null
    twoFactor.emailOtpExpiresAt = null
    await twoFactor.save()

    // Create session and tokens
    const session = await SessionService.createSession(user._id, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    })

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role, sessionId: session.sessionId },
      process.env.JWT_SECRET,
      buildJwtSignOptions("15m"),
    )

    user.lastLoginAt = new Date()
    await user.save()

    await logAction({
      userId: user._id,
      action: "2FA_SUCCESS",
      entityType: "User",
      entityId: user._id,
      details: { method },
    })

    res.json({
      message: "2FA verified successfully",
      accessToken,
      token: accessToken,
      sessionId: session.sessionId,
      refreshToken: session.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("2FA verification error:", error)
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired 2FA session" })
    }

    res.status(500).json({ message: "2FA verification failed" })
  }
}

/**
 * Refresh access token with rotation
 */
export async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" })
    }

    const rotation = await SessionService.rotateRefreshToken(refreshToken, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    })

    if (rotation?.reuseDetected) {
      await logAction({
        userId: rotation.session?.userId || null,
        action: "REFRESH_TOKEN_REUSE_DETECTED",
        entityType: "Session",
        entityId: rotation.session?.sessionId || null,
        details: {
          sessionId: rotation.session?.sessionId,
        },
        statusCode: 401,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        correlationId: req.correlationId,
      })

      return res.status(401).json({ message: "Refresh token reuse detected" })
    }

    if (rotation?.revoked) {
      await logAction({
        userId: rotation.session?.userId || null,
        action: "SESSION_REVOKED",
        entityType: "Session",
        entityId: rotation.session?.sessionId || null,
        details: {
          reason: rotation.reason,
          sessionId: rotation.session?.sessionId,
        },
        statusCode: 401,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        correlationId: req.correlationId,
      })
      return res.status(401).json({ message: "Session revoked" })
    }

    if (!rotation?.session) {
      return res.status(401).json({ message: "Invalid or expired refresh token" })
    }

    const user = await User.findById(rotation.session.userId)
    if (!user || !user.isActive) {
      await SessionService.invalidateSession(rotation.session.sessionId)
      return res.status(401).json({ message: "User not found or inactive" })
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role, sessionId: rotation.session.sessionId },
      process.env.JWT_SECRET,
      buildJwtSignOptions("15m"),
    )

    return res.json({
      message: "Token refreshed",
      accessToken,
      token: accessToken,
      refreshToken: rotation.refreshToken,
      sessionId: rotation.session.sessionId,
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(500).json({ message: "Token refresh failed" })
  }
}

/**
 * Logout (revoke session)
 */
export async function logout(req, res) {
  try {
    const sessionId = req.session?.sessionId || req.headers["x-session-id"]

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" })
    }

    await SessionService.invalidateSession(sessionId)

    await logAction({
      userId: req.user._id,
      action: "LOGOUT",
      entityType: "User",
      entityId: req.user._id,
      details: {},
    })

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ message: "Logout failed" })
  }
}
