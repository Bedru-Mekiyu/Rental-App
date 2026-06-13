import { doubleCsrf } from "csrf-csrf"

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"])

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET,
  getSessionIdentifier: (req) => req.session?.id || req.ip,
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000,
    path: "/",
  },
  getTokenFromRequest: (req) => req.headers["x-csrf-token"] || req.body?.csrfToken,
  ignoredMethods: Array.from(safeMethods),
})

/**
 * Middleware to generate and verify CSRF tokens
 * Usage:
 *   - GET requests: csrfProtection middleware generates token
 *   - POST/PUT/DELETE requests: csrfProtection middleware verifies token
 */
export function csrfMiddleware() {
  return (req, res, next) => {
    // Skip CSRF check for API authentication endpoints
    if (req.path.startsWith("/api/auth/") && req.method === "POST") {
      return next()
    }

    if (req.path.includes("/webhooks/") && req.method === "POST") {
      return next()
    }

    // Skip CSRF for bearer-token requests
    if (req.headers.authorization) {
      return next()
    }

    return doubleCsrfProtection(req, res, next)
  }
}

/**
 * Add CSRF token to response for forms
 */
export function addCSRFToken() {
  return (req, res, next) => {
    if (safeMethods.has(req.method)) {
      res.locals.csrfToken = generateToken(req, res)
    }
    next()
  }
}

/**
 * Middleware to include CSRF token in JSON responses
 */
export function addCSRFTokenToJSON() {
  return (req, res, next) => {
    const originalJson = res.json.bind(res)

    res.json = (data) => {
      const skipPaths = new Set(["/", "/health", "/ready"])
      if (
        !skipPaths.has(req.path) &&
        safeMethods.has(req.method) &&
        typeof data === "object" &&
        data !== null
      ) {
        data.csrfToken = generateToken(req, res)
      }
      return originalJson(data)
    }

    next()
  }
}
