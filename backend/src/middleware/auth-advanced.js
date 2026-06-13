// src/middleware/auth-advanced.js (ESM)
// Enhanced authentication with role checking and JWT validation

import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Session from "../models/Session.js"
import SessionService from "../services/sessionService.js"

const JWT_ALGORITHMS = ["HS256"]
const SESSION_ID_REGEX = /^[a-f0-9]{64}$/i

function normalizeIpAddress(value) {
  if (!value || typeof value !== "string") {
    return null
  }

  const first = value.split(",")[0]?.trim()
  if (!first) {
    return null
  }

  return first.startsWith("::ffff:") ? first.slice(7) : first
}

function buildJwtVerifyOptions() {
  const options = { algorithms: JWT_ALGORITHMS }
  if (process.env.JWT_ISSUER) {
    options.issuer = process.env.JWT_ISSUER
  }
  if (process.env.JWT_AUDIENCE) {
    options.audience = process.env.JWT_AUDIENCE
  }
  return options
}

/**
 * Verify JWT and load user
 * Enhanced to validate JWT_SECRET exists
 */
export function auth(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      // Validate JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error("[SECURITY] JWT_SECRET not configured")
        return res.status(500).json({ status: 500, message: "Server configuration error" })
      }

      const authHeader = req.headers.authorization || ""
      if (!authHeader.toLowerCase().startsWith("bearer ")) {
        return res.status(401).json({ status: 401, message: "Authorization header missing Bearer token" })
      }

      const token = authHeader.slice(7).trim()
      if (!token) {
        return res.status(401).json({ status: 401, message: "No token provided" })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, buildJwtVerifyOptions())
      if (!decoded || typeof decoded !== "object" || !decoded.sessionId || !decoded.id) {
        return res.status(401).json({ status: 401, message: "Invalid token" })
      }
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return res.status(401).json({ status: 401, message: "User not found" })
      }

      if (!user.isActive) {
        return res.status(403).json({ status: 403, message: "User account is disabled" })
      }

      req.user = user

      const sessionId = req.headers["x-session-id"]
      if (!sessionId) {
        return res.status(401).json({ status: 401, message: "Session ID required" })
      }

      if (Array.isArray(sessionId)) {
        return res.status(401).json({ status: 401, message: "Invalid Session ID" })
      }

      if (typeof sessionId !== "string" || sessionId.length > 128 || !SESSION_ID_REGEX.test(sessionId)) {
        return res.status(401).json({ status: 401, message: "Invalid Session ID" })
      }

      if (decoded.sessionId !== sessionId) {
        return res.status(401).json({ status: 401, message: "Session mismatch" })
      }

      const session = await Session.findOne({
        sessionId,
        userId: user._id,
        isActive: true,
        revokedAt: null,
      })

      if (!session) {
        return res.status(401).json({ status: 401, message: "Session invalid or revoked" })
      }

      const requestUserAgent = req.get("user-agent")
      if (
        session.deviceInfo?.userAgent &&
        requestUserAgent &&
        session.deviceInfo.userAgent !== requestUserAgent
      ) {
        return res.status(401).json({ status: 401, message: "Session device mismatch" })
      }

      const storedIp = normalizeIpAddress(session.deviceInfo?.ipAddress)
      const requestIp = normalizeIpAddress(req.ip)
      if (storedIp && requestIp && storedIp !== requestIp) {
        return res.status(401).json({ status: 401, message: "Session IP mismatch" })
      }

      if (new Date() > new Date(session.refreshTokenExpiry)) {
        session.isActive = false
        session.revokedAt = new Date()
        session.refreshTokenHash = null
        await session.save()
        return res.status(401).json({ status: 401, message: "Session expired" })
      }

      if (SessionService.isSessionExpiredByInactivity(session.lastActivityAt)) {
        session.isActive = false
        session.revokedAt = new Date()
        session.refreshTokenHash = null
        await session.save()
        return res.status(401).json({ status: 401, message: "Session expired due to inactivity" })
      }

      await SessionService.updateSessionActivity(sessionId)
      req.session = session

      // Check role-based access
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ status: 403, message: `Requires one of: ${allowedRoles.join(", ")}` })
      }

      next()
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ status: 401, message: "Token expired" })
      }
      res.status(401).json({ status: 401, message: "Invalid token" })
    }
  }
}

/**
 * Verify only ADMIN role
 */
export const requireAdmin = auth(["ADMIN"])

/**
 * Verify PM or ADMIN (property management roles)
 */
export const requireManager = auth(["PM", "ADMIN"])

/**
 * Verify PM, ADMIN (payment verification)
 */
export const requireVerifier = auth(["PM", "ADMIN"])

/**
 * Rate limit per user (prevent brute force)
 */
import rateLimit from "express-rate-limit"

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  keyGenerator: (req) => req.body.email || req.ip,
  message: "Too many login attempts, please try again later",
})

/**
 * Strict rate limit for verification operations
 */
export const verificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 operations per minute
  message: "Too many verification requests",
})

/**
 * Rate limit refresh token operations
 */
export const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 refresh attempts per 5 minutes
  message: "Too many refresh attempts, please try again later",
})
