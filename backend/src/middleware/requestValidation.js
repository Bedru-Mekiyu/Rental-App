// Validate all requests to prevent injection attacks
import { validationResult } from "express-validator"

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      correlationId: req.correlationId,
      errors: errors.array(),
      timestamp: new Date().toISOString(),
    })
  }
  next()
}

// Prevent large payload attacks
export const payloadLimiter = (maxSize = "10mb") => {
  return (req, res, next) => {
    const sizeMatch = /^\s*(\d+)\s*(b|kb|mb|gb)?\s*$/i.exec(String(maxSize))
    const base = sizeMatch ? Number.parseInt(sizeMatch[1], 10) : 10
    const unit = sizeMatch?.[2]?.toLowerCase() || "mb"
    const multipliers = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 }
    const maxBytes = base * (multipliers[unit] || multipliers.mb)

    const contentLength = Number.parseInt(req.headers["content-length"] || "0", 10)
    if (contentLength > maxBytes) {
      return res.status(413).json({
        status: 413,
        message: "Payload too large",
        errorCode: "PAYLOAD_TOO_LARGE",
        correlationId: req.correlationId,
        timestamp: new Date().toISOString(),
      })
    }
    next()
  }
}

// Validate API headers
export const validateHeaders = (req, res, next) => {
  const requiredHeaders = ["user-agent"]
  const missingHeaders = requiredHeaders.filter((header) => !req.headers[header])

  const methodHasBody = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  const contentLength = Number.parseInt(req.headers["content-length"] || "0", 10)
  const hasBody = methodHasBody && (contentLength > 0 || !!req.headers["transfer-encoding"])
  const contentType = String(req.headers["content-type"] || "").toLowerCase()
  const allowedContentTypes = [
    "application/json",
    "application/x-www-form-urlencoded",
    "multipart/form-data",
  ]

  if (
    missingHeaders.length > 0 &&
    req.path !== "/health" &&
    req.path !== "/ready" &&
    req.path !== "/"
  ) {
    return res.status(400).json({
      status: 400,
      message: "Missing required headers",
      errorCode: "MISSING_HEADERS",
      correlationId: req.correlationId,
      missing: missingHeaders,
      timestamp: new Date().toISOString(),
    })
  }

  if (hasBody && !allowedContentTypes.some((type) => contentType.includes(type))) {
    return res.status(415).json({
      status: 415,
      message: "Unsupported content type",
      errorCode: "UNSUPPORTED_MEDIA_TYPE",
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    })
  }
  next()
}

export default {
  validateRequest,
  payloadLimiter,
  validateHeaders,
}
