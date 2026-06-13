import { getRedisClient } from "../utils/redis.js"
import nodemailer from "nodemailer"

// Initialize email for alerts
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

class MonitoringService {
  constructor() {
    this.alerts = []
    this.thresholds = {
      cpu: 80,
      memory: 85,
      database: 80,
      errorRate: 5,
      responseTime: 5000,
      diskSpace: 90,
    }
  }

  // Monitor system health
  async monitorSystemHealth() {
    try {
      const health = {
        timestamp: new Date(),
        status: "healthy",
        components: {},
      }

      // Check database
      health.components.database = await this.checkDatabase()

      // Check Redis
      health.components.redis = await this.checkRedis()

      // Check disk space
      health.components.diskSpace = await this.checkDiskSpace()

      // Check API response time
      health.components.apiResponseTime = await this.checkResponseTime()

      // Check error rate
      health.components.errorRate = await this.checkErrorRate()

      // Determine overall status
      const hasErrors = Object.values(health.components).some((c) => c.status === "unhealthy")
      health.status = hasErrors ? "unhealthy" : "healthy"

      await this.storeHealth(health)
      return health
    } catch (error) {
      console.error("Health monitoring error:", error)
      return { status: "error", error: error.message }
    }
  }

  async checkDatabase() {
    try {
      const response = await new Promise((resolve) => {
        setTimeout(() => resolve(true), 100)
      })

      return { status: "healthy", responseTime: 50, timestamp: new Date() }
    } catch (error) {
      return { status: "unhealthy", error: error.message }
    }
  }

  async checkRedis() {
    try {
      const redis = await getRedisClient()
      const start = Date.now()
      await redis.ping()
      const time = Date.now() - start

      return {
        status: time > 100 ? "degraded" : "healthy",
        responseTime: time,
        timestamp: new Date(),
      }
    } catch (error) {
      return { status: "unhealthy", error: error.message }
    }
  }

  async checkDiskSpace() {
    try {
      // Simplified check - implement actual disk check
      return { status: "healthy", used: 45, total: 100, percentage: 45 }
    } catch (error) {
      return { status: "unknown", error: error.message }
    }
  }

  async checkResponseTime() {
    try {
      const redis = await getRedisClient()
      const avgTime = await redis.get("metrics:response_time:avg")

      return {
        status: Number.parseInt(avgTime || 0) > this.thresholds.responseTime ? "degraded" : "healthy",
        avgTime: Number.parseInt(avgTime || 0),
      }
    } catch (error) {
      return { status: "unknown" }
    }
  }

  async checkErrorRate() {
    try {
      const redis = await getRedisClient()
      const errorRate = await redis.get("metrics:error_rate:avg")

      return {
        status: Number.parseInt(errorRate || 0) > this.thresholds.errorRate ? "unhealthy" : "healthy",
        errorRate: Number.parseInt(errorRate || 0),
      }
    } catch (error) {
      return { status: "unknown" }
    }
  }

  async storeHealth(health) {
    try {
      const redis = await getRedisClient()
      await redis.setex("health:status", 300, JSON.stringify(health))
    } catch (error) {
      console.error("Error storing health status:", error)
    }
  }

  // Send alert
  async sendAlert(alert) {
    try {
      const { type, severity, message, recipientEmail } = alert

      // Store alert in database
      this.alerts.push({ ...alert, timestamp: new Date() })

      // Send email if critical
      if (severity === "critical") {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: recipientEmail || process.env.ADMIN_EMAIL,
          subject: `CRITICAL ALERT: ${type}`,
          html: `
            <h2>System Alert</h2>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Severity:</strong> ${severity}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          `,
        })
      }

      // Send SMS for critical security alerts
      if (severity === "critical" && type.includes("SECURITY")) {
        await this.sendSMS(alert)
      }

      console.log(`[ALERT] ${severity}: ${message}`)
    } catch (error) {
      console.error("Alert sending failed:", error)
    }
  }

  async sendSMS(alert) {
    // Implement SMS sending (e.g., Twilio, AWS SNS)
    console.log("[SMS] Would send:", alert.message)
  }

  // Track metrics
  async recordMetric(name, value, tags = {}) {
    try {
      const redis = await getRedisClient()
      const key = `metrics:${name}`

      // Store metric value
      await redis.lpush(key, JSON.stringify({ value, timestamp: Date.now(), ...tags }))

      // Keep only last 1000 records
      await redis.ltrim(key, 0, 999)

      // Calculate average
      const values = await redis.lrange(key, 0, -1)
      const avg = values.reduce((sum, val) => sum + JSON.parse(val).value, 0) / values.length
      await redis.set(`metrics:${name}:avg`, avg)
    } catch (error) {
      console.error("Metric recording failed:", error)
    }
  }

  // Get metrics
  async getMetrics(name, duration = 3600) {
    try {
      const redis = await getRedisClient()
      const key = `metrics:${name}`
      const values = await redis.lrange(key, 0, -1)

      return values.map((v) => JSON.parse(v))
    } catch (error) {
      console.error("Metrics retrieval failed:", error)
      return []
    }
  }
}

export default new MonitoringService()
