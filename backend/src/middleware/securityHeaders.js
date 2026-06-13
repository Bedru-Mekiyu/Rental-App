import { rateLimit } from "express-rate-limit"

/**
 * Advanced Security Headers Middleware
 * Protects against: XSS, Clickjacking, MIME sniffing, Injection attacks
 */

export function securityHeadersMiddleware() {
  return (req, res, next) => {
    // Reduce server fingerprinting
    res.setHeader("X-DNS-Prefetch-Control", "off")
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none")
    res.setHeader("X-Download-Options", "noopen")
    res.setHeader("Origin-Agent-Cluster", "?1")
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")

    // Prevent Clickjacking attacks
    res.setHeader("X-Frame-Options", "DENY")

    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff")

    // XSS Protection (legacy browsers)
    res.setHeader("X-XSS-Protection", "1; mode=block")

    // Referrer Policy - Don't leak referrer to external sites
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")

    // Cross-origin protections
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")

    // Permissions Policy - Control browser features
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    )

    const cspHeader = process.env.CSP_REPORT_ONLY === "true"
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy"

    const cspReportUri = process.env.CSP_REPORT_URI
    const reportDirective = cspReportUri ? `; report-uri ${cspReportUri}` : ""

    // Content Security Policy - Strict XSS and injection prevention
    res.setHeader(
      cspHeader,
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; " + // Allow inline for auth/MFA scripts
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
        "font-src 'self' fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' api.github.com; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'" +
        reportDirective,
    )

    // HSTS - Force HTTPS (only on production)
    if (process.env.NODE_ENV === "production") {
      const maxAge = Number(process.env.HSTS_MAX_AGE || 31536000)
      res.setHeader(
        "Strict-Transport-Security",
        `max-age=${Number.isNaN(maxAge) ? 31536000 : maxAge}; includeSubDomains; preload`,
      )
    }

    next()
  }
}

/**
 * Enhanced rate limiting middleware
 */
export const securityRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
})

/**
 * Strict authentication rate limiting
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 authentication attempts
  skipSuccessfulRequests: true,
  message: {
    error: "Too many authentication attempts, account temporarily locked",
  },
})

/**
 * API endpoint rate limiting
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 API requests
  skipSuccessfulRequests: true,
  message: {
    error: "API rate limit exceeded",
  },
})

/**
 * Content Security Policy reporting endpoint
 */
export function cspReportViolation(req, res) {
  const violation = req.body
  console.error("[CSP VIOLATION]", {
    timestamp: new Date().toISOString(),
    userAgent: req.get("user-agent"),
    ip: req.ip,
    violation,
  })

  res.status(204).end()
}
