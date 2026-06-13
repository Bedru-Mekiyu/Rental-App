// Advanced DDoS Protection with multiple layers
import rateLimit from "express-rate-limit"
import RedisStore from "rate-limit-redis"
import { createClient } from "redis"
import { createHash } from "crypto"

// Initialize Redis client for distributed rate limiting
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
  },
  password: process.env.REDIS_PASSWORD,
})

redisClient.on("error", (err) => console.error("Redis connection error:", err))
redisClient.connect().catch((err) => console.error("Redis connect error:", err))

export async function closeRedisClient() {
  if (redisClient.isOpen) {
    await redisClient.quit()
  }
}

const createRedisStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix,
  })

// Layer 1: Global rate limiter (requests per minute)
export const globalRateLimiter = rateLimit({
  store: createRedisStore("rl:global:"),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute globally
  message: { status: 429, error: "Too many requests globally. Please wait." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role === "ADMIN", // Admins bypass global limit
})

// Layer 2: Per-IP rate limiter (strict for non-authenticated)
export const ipRateLimiter = rateLimit({
  store: createRedisStore("rl:ip:"),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  message: { status: 429, error: "IP rate limit exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
})

// Layer 3: Auth attempts limiter (prevent brute force)
export const authRateLimiter = rateLimit({
  store: createRedisStore("rl:auth:"),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  keyGenerator: (req) => req.body.email || req.ip,
  message: { status: 429, error: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    // Log suspicious activity
    await logSecurityEvent({
      type: "BRUTE_FORCE_ATTEMPT",
      email: req.body.email,
      ip: req.ip,
      timestamp: new Date(),
    })
    res.status(429).json({ error: "Too many login attempts" })
  },
})

// Layer 4: Payment operations limiter (critical operations)
export const paymentRateLimiter = rateLimit({
  store: createRedisStore("rl:payment:"),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 payment operations per hour per user
  keyGenerator: (req) => req.user?._id || req.ip,
  message: { status: 429, error: "Payment operation limit exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
})

// Layer 5: API endpoint limiter (per endpoint)
export const createEndpointLimiter = (windowMs, max, name) => {
  return rateLimit({
    store: createRedisStore(`rl:endpoint:${name}:`),
    windowMs,
    max,
    keyGenerator: (req) => req.user?._id || req.ip,
    standardHeaders: true,
    legacyHeaders: false,
  })
}

// DDoS detection: monitor for suspicious patterns
export const ddosDetectionMiddleware = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress
  const requestKey = `ddos:${ip}`

  try {
    if (!redisClient.isReady) {
      return next()
    }

    const isBlocked = await redisClient.get(`blocked:${ip}`)
    if (isBlocked) {
      return res.status(403).json({ error: "IP temporarily blocked due to suspicious activity" })
    }

    const count = await redisClient.incr(requestKey)
    await redisClient.expire(requestKey, 60) // Reset every 60 seconds

    // Alert if requests exceed threshold
    if (count > 500) {
      console.warn(`[SECURITY] Potential DDoS from IP: ${ip} with ${count} requests/min`)

      // Auto-block aggressive IPs temporarily
      if (count > 1000) {
        await redisClient.setex(`blocked:${ip}`, 3600, "blocked") // 1 hour block
        return res.status(403).json({ error: "IP temporarily blocked due to suspicious activity" })
      }
    }
    next()
  } catch (error) {
    console.error("DDoS detection error:", error)
    next() // Don't block legitimate traffic if detection fails
  }
}

// IP whitelist check
export const ipWhitelistMiddleware = (whitelist = []) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    if (whitelist.includes(ip)) {
      return next()
    }
    // Continue but could be restricted based on other checks
    next()
  }
}

// Request fingerprinting to detect distributed attacks
export const requestFingerprintMiddleware = (req, res, next) => {
  const fingerprint = createHash("sha256")
    .update(
      req.headers["user-agent"] +
        req.headers["accept-language"] +
        req.headers["accept-encoding"] +
        (req.ip || req.connection.remoteAddress),
    )
    .digest("hex")

  req.fingerprint = fingerprint
  next()
}

// Helper to log security events
async function logSecurityEvent(event) {
  try {
    // Store in database for analysis
    // await SecurityEvent.create(event);
    console.log("[SECURITY EVENT]", event)
  } catch (error) {
    console.error("Error logging security event:", error)
  }
}

export default {
  globalRateLimiter,
  ipRateLimiter,
  authRateLimiter,
  paymentRateLimiter,
  createEndpointLimiter,
  ddosDetectionMiddleware,
  ipWhitelistMiddleware,
  requestFingerprintMiddleware,
}
