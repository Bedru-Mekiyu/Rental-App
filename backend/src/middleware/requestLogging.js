import AuditLog from "../models/AuditLog.js"
import { v4 as uuidv4 } from "uuid"

export function correlationIdMiddleware() {
  return (req, res, next) => {
    req.correlationId = req.headers["x-correlation-id"] || uuidv4()
    res.setHeader("X-Correlation-Id", req.correlationId)
    next()
  }
}

/**
 * Middleware to log all requests for audit trail
 * Tracks: user, action, IP, timestamp, method, path, correlationId
 */
export function requestLoggingMiddleware() {
  return (req, res, next) => {
    // Skip logging for health checks and static files
    if (req.path === "/health" || req.path === "/ready" || req.path.startsWith("/public")) {
      return next()
    }

    res.on("finish", () => {
      const redactKeys = new Set([
        "password",
        "token",
        "refreshToken",
        "accessToken",
        "authorization",
        "apiKey",
        "secret",
        "creditCard",
        "cvv",
        "ssn",
      ])

      const redactObject = (value) => {
        if (!value || typeof value !== "object") {
          return value
        }
        if (Array.isArray(value)) {
          return value.map((item) => redactObject(item))
        }

        const redacted = {}
        Object.keys(value).forEach((key) => {
          if (redactKeys.has(key)) {
            redacted[key] = "[REDACTED]"
          } else {
            redacted[key] = redactObject(value[key])
          }
        })

        return redacted
      }

      const logData = {
        userId: req.user?._id || "anonymous",
        action: `${req.method} ${req.path}`,
        entityType: "REQUEST",
        entityId: req.path,
        statusCode: res.statusCode,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        correlationId: req.correlationId,
        details: {
          method: req.method,
          path: req.path,
          query: redactObject(req.query),
          params: redactObject(req.params),
        },
      }

      AuditLog.create(logData).catch((err) => console.error("Audit log error:", err.message))
    })

    next()
  }
}

export default {
  correlationIdMiddleware,
  requestLoggingMiddleware,
}
