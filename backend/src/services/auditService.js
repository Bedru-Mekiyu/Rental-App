import ActivityLog from "../models/ActivityLog.js"
import { logAction } from "../utils/auditLogger.js"

// Comprehensive audit logging
export async function logActivity(auditData) {
  try {
    const activity = new ActivityLog({
      userId: auditData.userId,
      action: auditData.action,
      resourceType: auditData.resourceType,
      resourceId: auditData.resourceId,
      changes: auditData.changes,
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      device: auditData.device,
      location: auditData.location,
      status: auditData.status || "SUCCESS",
      errorMessage: auditData.errorMessage,
      sessionId: auditData.sessionId,
      duration: auditData.duration,
    })

    await activity.save()

    // Also log to centralized audit log for compliance
    await logAction({
      userId: auditData.userId,
      action: auditData.action,
      entityType: auditData.resourceType,
      entityId: auditData.resourceId,
      details: auditData.changes?.after,
    })
  } catch (error) {
    console.error("Audit logging failed:", error)
  }
}

// Generate audit report for compliance
export async function generateAuditReport(filters = {}) {
  try {
    const query = {}

    if (filters.userId) query.userId = filters.userId
    if (filters.action) query.action = filters.action
    if (filters.resourceType) query.resourceType = filters.resourceType
    if (filters.startDate) query.timestamp = { $gte: new Date(filters.startDate) }
    if (filters.endDate) {
      query.timestamp = { ...query.timestamp, $lte: new Date(filters.endDate) }
    }

    const logs = await ActivityLog.find(query).sort({ timestamp: -1 })

    // Generate statistics
    const stats = {
      totalActions: logs.length,
      actionBreakdown: {},
      failureCount: logs.filter((l) => l.status === "FAILURE").length,
      successCount: logs.filter((l) => l.status === "SUCCESS").length,
      uniqueUsers: new Set(logs.map((l) => l.userId.toString())).size,
    }

    logs.forEach((log) => {
      stats.actionBreakdown[log.action] = (stats.actionBreakdown[log.action] || 0) + 1
    })

    return {
      report: logs,
      stats,
      generatedAt: new Date(),
    }
  } catch (error) {
    console.error("Report generation failed:", error)
    throw error
  }
}

// Detect suspicious activity
export async function detectAnomalies(userId) {
  try {
    const recentLogs = await ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(100)

    const anomalies = []

    // Detect unusual login times
    const logins = recentLogs.filter((l) => l.action === "LOGIN")
    const loginHours = logins.map((l) => new Date(l.timestamp).getHours())
    const avgHour = loginHours.reduce((a, b) => a + b, 0) / loginHours.length

    logins.slice(0, 5).forEach((login) => {
      const hour = new Date(login.timestamp).getHours()
      if (Math.abs(hour - avgHour) > 6) {
        anomalies.push({
          type: "UNUSUAL_LOGIN_TIME",
          timestamp: login.timestamp,
          details: `Login at ${hour}:00 (average: ${Math.round(avgHour)}:00)`,
        })
      }
    })

    // Detect rapid actions
    const actionCounts = {}
    recentLogs.forEach((log) => {
      const timeWindow = new Date(log.timestamp).getHours()
      const key = `${log.action}_${timeWindow}`
      actionCounts[key] = (actionCounts[key] || 0) + 1
    })

    Object.entries(actionCounts).forEach(([key, count]) => {
      if (count > 50) {
        anomalies.push({
          type: "RAPID_ACTIONS",
          details: `${count} actions in one hour`,
        })
      }
    })

    // Detect location changes
    const locations = recentLogs
      .slice(0, 10)
      .map((l) => l.location?.city)
      .filter(Boolean)
    const uniqueLocations = new Set(locations)
    if (uniqueLocations.size > 3) {
      anomalies.push({
        type: "LOCATION_ANOMALY",
        details: "Multiple locations detected in short timespan",
      })
    }

    return anomalies
  } catch (error) {
    console.error("Anomaly detection failed:", error)
    return []
  }
}

export default {
  logActivity,
  generateAuditReport,
  detectAnomalies,
}
