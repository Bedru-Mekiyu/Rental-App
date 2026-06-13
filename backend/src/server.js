import "dotenv/config"
import { pathToFileURL } from "url"
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"
import {
  applySecurityChain,
  authRateLimiter,
  paymentRateLimiter,
  twoFactorRateLimiter,
} from "./middleware/securityChain.js"
import { payloadLimiter, validateHeaders } from "./middleware/requestValidation.js"
import { connectDatabase } from "./config/connect-db.js"
import JobScheduler from "./services/jobScheduler.js"
import { logAction } from "./utils/auditLogger.js"
import errorHandler from "./middleware/errorHandler.js"
import { correlationIdMiddleware } from "./middleware/requestLogging.js"
import { initializeSentry } from "./services/errorTrackingService.js"
import { closeRedisClient } from "./middleware/ddosProtection.js"

// Import routes
import authRoutes from "./routes/auth.routes.js"
import propertyRoutes from "./routes/property.routes.js"
import unitRoutes from "./routes/unit.routes.js"
import leaseRoutes from "./routes/lease.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import maintenanceRoutes from "./routes/maintenance.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import apiKeyRoutes from "./routes/apiKey.routes.js"
import advancedFeaturesRoutes from "./routes/advanced-features.routes.js"

const app = express()
const PORT = process.env.PORT || 5000

// Reduce server fingerprinting
app.disable("x-powered-by")

// Honor proxy headers when configured (e.g., behind Nginx/Heroku)
if (process.env.TRUST_PROXY) {
  const trustProxy = Number.parseInt(process.env.TRUST_PROXY, 10)
  app.set("trust proxy", Number.isNaN(trustProxy) ? 1 : trustProxy)
}

// ============================================
// MIDDLEWARE SETUP
// ============================================

// 1. Correlation ID (must be first)
app.use(correlationIdMiddleware())

// 1b. Attach correlationId to JSON responses
app.use((req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = (data) => {
    if (data && typeof data === "object" && !Array.isArray(data)) {
      data.correlationId = req.correlationId
    }
    return originalJson(data)
  }
  next()
})

// 2. Body parsers (before security chain)
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf?.length ? buf.toString("utf8") : ""
    },
  }),
)
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Handle invalid JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: 400,
      message: "Invalid JSON payload",
      errorCode: "INVALID_JSON",
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    })
  }

  return next(err)
})

// 2b. Cookie parsing (needed for CSRF double-submit cookies)
app.use(cookieParser())

// 3. CORS
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true)
      }

      if (corsOrigins.includes("*") || corsOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error("CORS origin not allowed"))
    },
    credentials: process.env.CORS_CREDENTIALS === "true",
    optionsSuccessStatus: 200,
  }),
)

app.options(/.*/, (req, res) => {
  res.sendStatus(200)
})

// 4. Apply complete security chain
applySecurityChain(app)

// 5. Header and payload guards
app.use(validateHeaders)
app.use(payloadLimiter("10mb"))

// 6. Session validation handled by auth middleware

// ============================================
// ROUTES
// ============================================

// Health check (no auth required)
app.get("/health", (req, res) => {
  const readyState = mongoose.connection.readyState
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"]
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStates[readyState] || "unknown",
      readyState,
    },
  })
})

// Root route for quick API info
app.get("/", (req, res) => {
  res.json({
    name: "property-management-api",
    status: "ok",
    docs: {
      health: "/health",
      ready: "/ready",
    },
    timestamp: new Date().toISOString(),
  })
})

// Readiness check (returns 503 until DB is connected)
app.get("/ready", (req, res) => {
  const readyState = mongoose.connection.readyState
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"]
  const isReady = readyState === 1

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStates[readyState] || "unknown",
      readyState,
    },
  })
})

// Authentication routes (with rate limiting)
app.use("/api/auth", authRateLimiter, authRoutes)

// Protected routes with their specific rate limiters
app.use("/api/properties", propertyRoutes)
app.use("/api/units", unitRoutes)
app.use("/api/leases", leaseRoutes)
app.use("/api/payments", paymentRateLimiter, paymentRoutes)
app.use("/api/maintenance", maintenanceRoutes)
app.use("/api/notifications", twoFactorRateLimiter, notificationRoutes)
app.use("/api/api-keys", authRateLimiter, apiKeyRoutes)
app.use("/api", advancedFeaturesRoutes)

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    errorCode: "NOT_FOUND",
    correlationId: req.correlationId,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  })
})

// ============================================
// DATABASE & SERVER STARTUP
// ============================================

async function validateEnvironment() {
  const requiredVars = ["JWT_SECRET", "MONGODB_URI", "ENCRYPTION_KEY"]

  const missing = requiredVars.filter((v) => !process.env[v])
  if (missing.length > 0) {
    console.error(`[FATAL] Missing required environment variables: ${missing.join(", ")}`)
    process.exit(1)
  }

  console.log("[STARTUP] All environment variables validated ✓")
}

async function validateRedisConnection() {
  try {
    const { createClient } = await import("redis")
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT || 6379),
      },
      password: process.env.REDIS_PASSWORD,
    })

    client.on("error", (err) => {
      console.error("[STARTUP] Redis connection failed:", err.message)
    })

    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connection timeout")), 5000),
      ),
    ])
    console.log("[STARTUP] Redis connection verified ✓")

    await client.quit()
  } catch (err) {
    console.error("[FATAL] Redis validation failed:", err.message)
    console.warn("[WARN] Falling back to in-memory rate limiting (not recommended for production)")
  }
}

async function startServer() {
  try {
    await validateEnvironment()
    await validateRedisConnection()
    if (process.env.SENTRY_DSN) {
      initializeSentry()
      console.log("[STARTUP] Sentry initialized ✓")
    }
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`[SERVER] Running on http://localhost:${PORT}`)
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`)
      console.log("[SERVER] Security features enabled:")
      console.log("  - AES-256 encryption for sensitive data")
      console.log("  - Two-Factor Authentication (TOTP + Email)")
      console.log("  - CSRF protection")
      console.log("  - Rate limiting")
      console.log("  - Session management")
      console.log("  - Audit logging")
    })

    console.log("[SERVER] Connecting to MongoDB...")
    connectDatabase()
      .then(() => {
        if (process.env.ENABLE_SCHEDULED_JOBS === "true") {
          console.log("[SERVER] Starting scheduled jobs...")
          JobScheduler.initializeScheduledJobs()
        }
      })
      .catch((err) => {
        console.error("[WARN] MongoDB connection failed:", err.message)
        console.warn("[WARN] API will respond, but DB-backed routes may fail")
      })

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("[SERVER] SIGTERM received, shutting down gracefully...")

      server.close(async () => {
        console.log("[SERVER] HTTP server closed")

        // Stop scheduled jobs
        JobScheduler.stopScheduledJobs()

        // Close database connection
        await mongoose.disconnect()
        console.log("[SERVER] Database disconnected")

        // Close Redis client if open
        try {
          await closeRedisClient()
          console.log("[SERVER] Redis client closed")
        } catch (error) {
          console.warn("[SERVER] Failed to close Redis client:", error.message)
        }

        process.exit(0)
      })

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error("[SERVER] Forced shutdown after 30 seconds")
        process.exit(1)
      }, 30000)
    })

    process.on("SIGINT", () => {
      console.log("[SERVER] SIGINT received")
      process.emit("SIGTERM")
    })

    process.on("unhandledRejection", (reason) => {
      console.error("[FATAL] Unhandled promise rejection:", reason)
      process.emit("SIGTERM")
    })

    process.on("uncaughtException", (error) => {
      console.error("[FATAL] Uncaught exception:", error)
      process.emit("SIGTERM")
    })
  } catch (error) {
    console.error("[FATAL] Server startup failed:", error)
    process.exit(1)
  }
}

// Only start server if this is main module
const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : ""
if (import.meta.url === entryHref) {
  startServer()
}

export default app
