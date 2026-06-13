import crypto from "crypto"
import ApiKey from "../models/ApiKey.js"
import { getRedisClient } from "../utils/redis.js" // Declare the variable before using it

// Generate secure API key
export async function generateApiKey(userId, options = {}) {
  const prefix = options.prefix || `sk_${process.env.NODE_ENV === "production" ? "live" : "test"}_`
  const randomPart = crypto.randomBytes(32).toString("hex")
  const apiKey = prefix + randomPart

  // Hash the key for storage
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

  const newKey = await ApiKey.create({
    userId,
    name: options.name || "API Key",
    keyHash,
    prefix,
    allowedIps: options.allowedIps || [],
    allowedEndpoints: options.allowedEndpoints || [],
    expiresAt: options.expiresAt,
    permissions: options.permissions || [],
    scopes: options.scopes || ["read", "write"],
    rateLimit: options.rateLimit || { requests: 1000, period: "hour" },
  })

  return {
    id: newKey._id,
    apiKey, // Return unhashed key only once
    message: "Save this API key securely. You won't be able to see it again.",
  }
}

// Validate API key
export async function validateApiKey(apiKey, requestIp, endpoint) {
  try {
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

    const key = await ApiKey.findOne({
      keyHash,
      isActive: true,
      isDeleted: false,
    }).populate("userId")

    if (!key) {
      return { valid: false, error: "Invalid API key" }
    }

    // Check expiration
    if (key.expiresAt && new Date() > key.expiresAt) {
      return { valid: false, error: "API key expired" }
    }

    // Check IP whitelist
    if (key.allowedIps.length > 0) {
      const isIpAllowed = key.allowedIps.some((allowedIp) => isIpInCIDR(requestIp, allowedIp))
      if (!isIpAllowed) {
        return { valid: false, error: "IP not whitelisted" }
      }
    }

    // Check endpoint access
    if (key.allowedEndpoints.length > 0 && !key.allowedEndpoints.includes(endpoint)) {
      return { valid: false, error: "Endpoint not allowed for this key" }
    }

    // Check rate limit
    const rateLimitExceeded = await checkRateLimit(key._id, key.rateLimit)
    if (rateLimitExceeded) {
      return { valid: false, error: "Rate limit exceeded" }
    }

    // Update usage
    await ApiKey.updateOne({ _id: key._id }, { lastUsed: new Date(), $inc: { usageCount: 1 } })

    return {
      valid: true,
      user: key.userId,
      permissions: key.permissions,
      scopes: key.scopes,
    }
  } catch (error) {
    console.error("API key validation error:", error)
    return { valid: false, error: "Key validation failed" }
  }
}

// Check if IP is in CIDR range
function isIpInCIDR(ip, cidr) {
  const [range, bits] = cidr.split("/")
  if (!bits) return ip === range

  const rangeNum = ipToNumber(range)
  const ipNum = ipToNumber(ip)
  const mask = -1 << (32 - Number.parseInt(bits))

  return (rangeNum & mask) === (ipNum & mask)
}

function ipToNumber(ip) {
  const parts = ip.split(".")
  return parts.reduce((acc, part) => (acc << 8) + Number.parseInt(part), 0)
}

// Check rate limit
async function checkRateLimit(keyId, limit) {
  const key = `api:ratelimit:${keyId}`
  const client = await getRedisClient()

  const count = await client.incr(key)
  if (count === 1) {
    const seconds = getPeriodInSeconds(limit.period)
    await client.expire(key, seconds)
  }

  return count > limit.requests
}

function getPeriodInSeconds(period) {
  const periods = { hour: 3600, day: 86400, month: 2592000 }
  return periods[period] || 3600
}

export default {
  generateApiKey,
  validateApiKey,
}
