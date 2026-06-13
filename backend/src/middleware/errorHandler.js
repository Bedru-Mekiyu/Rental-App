import { logAction } from "../utils/auditLogger.js"
import { trackError } from "../services/errorTrackingService.js"

export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  console.error("[ERROR]", err)

  const isDevelopment = process.env.NODE_ENV === "development"
  const correlationId = req.correlationId
  const status = err.message === "CORS origin not allowed" ? 403 : err.statusCode || 500
  const errorCode = err.message === "CORS origin not allowed" ? "CORS_NOT_ALLOWED" : err.code

  // Don't expose stack traces or sensitive info in production
  const errorResponse = {
    message: isDevelopment ? err.message : "An error occurred. Please try again later.",
    errorCode: errorCode || "INTERNAL_ERROR",
    correlationId,
    status,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack }),
  }

  // Log to audit trail
  if (req.user?._id) {
    logAction({
      userId: req.user._id,
      action: "ERROR_OCCURRED",
      entityType: "ERROR",
      entityId: null,
      details: {
        message: err.message,
        errorCode: err.code,
        path: req.path,
        method: req.method,
        correlationId,
      },
    }).catch((logErr) => console.error("Failed to log error:", logErr))
  }

  trackError(err, req).catch((logErr) => console.error("Failed to track error:", logErr))

  res.status(status).json(errorResponse)
}
