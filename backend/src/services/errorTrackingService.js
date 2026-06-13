import mongoose from "mongoose"
import * as Sentry from "@sentry/node"

// Initialize Sentry for error tracking
export function initializeSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [new Sentry.Integrations.Mongo()],
  })
}

// Enhanced error class
export class ApplicationError extends Error {
  constructor(message, code, statusCode = 500, context = {}) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.context = context
    this.timestamp = new Date()

    Sentry.captureException(this, { extra: context })
  }
}

// Error tracking model (store locally too)
const errorSchema = new mongoose.Schema({
  errorCode: String,
  message: String,
  stack: String,
  statusCode: Number,
  userId: mongoose.Schema.Types.ObjectId,
  endpoint: String,
  method: String,
  context: mongoose.Schema.Types.Mixed,
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
  },
  isResolved: { type: Boolean, default: false },
  resolvedAt: Date,
  resolvedBy: mongoose.Schema.Types.ObjectId,
  resolution: String,
  createdAt: { type: Date, default: Date.now },
})

export const ErrorLog = mongoose.model("ErrorLog", errorSchema)

// Track errors locally
export async function trackError(error, req) {
  try {
    const severity = determineSeverity(error)

    const errorLog = new ErrorLog({
      errorCode: error.code || "UNKNOWN_ERROR",
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500,
      userId: req.user?._id,
      endpoint: req.path,
      method: req.method,
      context: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        body: req.body,
      },
      severity,
    })

    await errorLog.save()

    // Alert if critical
    if (severity === "critical") {
      // Send alert
      console.error(`[CRITICAL ERROR] ${error.message}`)
    }

    return errorLog
  } catch (trackingError) {
    console.error("Error tracking failed:", trackingError)
  }
}

function determineSeverity(error) {
  if (error.statusCode >= 500) return "high"
  if (error.statusCode >= 400) return "medium"
  return "low"
}

// Error analysis
export async function analyzeErrors(timeWindow = 3600) {
  try {
    const since = new Date(Date.now() - timeWindow * 1000)

    const errors = await ErrorLog.find({ createdAt: { $gte: since } })

    const analysis = {
      total: errors.length,
      bySeverity: {},
      byEndpoint: {},
      byCode: {},
      topErrors: [],
    }

    errors.forEach((error) => {
      analysis.bySeverity[error.severity] = (analysis.bySeverity[error.severity] || 0) + 1
      analysis.byEndpoint[error.endpoint] = (analysis.byEndpoint[error.endpoint] || 0) + 1
      analysis.byCode[error.errorCode] = (analysis.byCode[error.errorCode] || 0) + 1
    })

    // Top 5 most common errors
    analysis.topErrors = Object.entries(analysis.byCode)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({ code, count }))

    return analysis
  } catch (error) {
    console.error("Error analysis failed:", error)
    return null
  }
}

// Error patterns detection
export async function detectErrorPatterns() {
  try {
    const errors = await ErrorLog.find({ createdAt: { $gte: new Date(Date.now() - 3600000) } })

    const patterns = []

    // Detect cascading failures
    const endpoints = {}
    errors.forEach((error) => {
      endpoints[error.endpoint] = (endpoints[error.endpoint] || 0) + 1
    })

    Object.entries(endpoints).forEach(([endpoint, count]) => {
      if (count > 10) {
        patterns.push({
          type: "CASCADING_FAILURE",
          endpoint,
          count,
          severity: "high",
        })
      }
    })

    // Detect rapid errors
    const errorCounts = {}
    errors.forEach((error) => {
      const minute = Math.floor(error.createdAt / 60000)
      errorCounts[minute] = (errorCounts[minute] || 0) + 1
    })

    Object.entries(errorCounts).forEach(([minute, count]) => {
      if (count > 50) {
        patterns.push({
          type: "ERROR_SPIKE",
          count,
          severity: "critical",
        })
      }
    })

    return patterns
  } catch (error) {
    console.error("Pattern detection failed:", error)
    return []
  }
}

export default {
  initializeSentry,
  trackError,
  analyzeErrors,
  detectErrorPatterns,
  ApplicationError,
}
