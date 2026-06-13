import { securityHeadersMiddleware } from "./securityHeaders.js"
import { csrfMiddleware, addCSRFTokenToJSON } from "./csrfProtection.js"
import { sanitizeInputMiddleware } from "./inputSanitization.js"
import { secureFieldsMiddleware } from "./secureFields.js"
import { requestLoggingMiddleware } from "./requestLogging.js"
import rateLimit from "express-rate-limit"
import { globalRateLimiter, ipRateLimiter, ddosDetectionMiddleware } from "./ddosProtection.js"

/**
 * Complete security middleware chain
 * Apply in order: headers -> logging -> rate limit -> CSRF -> input sanitization -> encryption
 */
export function applySecurityChain(app) {
  // 1. Security Headers (prevent XSS, clickjacking, etc.)
  app.use(securityHeadersMiddleware())

  // 2. Request Logging (for audit trail)
  app.use(requestLoggingMiddleware())

  // 3. Global Rate Limiting
  app.use(globalRateLimiter)
  app.use(ipRateLimiter)
  app.use(ddosDetectionMiddleware)

  // 4. CSRF Protection
  app.use(csrfMiddleware())
  app.use(addCSRFTokenToJSON())

  // 5. Input Sanitization (remove XSS/injection)
  app.use(sanitizeInputMiddleware())

  // 6. Secure Fields Middleware (encryption support)
  app.use(secureFieldsMiddleware())
}

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 min
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: false, // Count all requests
  keyGenerator: (req) => req.body?.email || req.ip, // Rate limit by email
})

/**
 * Rate limiter for payment/verification operations
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: "Payment operations rate limited",
})

/**
 * Rate limiter for 2FA operations
 */
export const twoFactorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 min
  message: "Too many 2FA attempts, please try again later",
  keyGenerator: (req) => req.user?.id || req.ip,
})
