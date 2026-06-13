import AuditLog from "../models/AuditLog.js"

export async function logAction({
  userId,
  action,
  entityType,
  entityId,
  details,
  statusCode,
  ipAddress,
  userAgent,
  correlationId,
}) {
  try {
    return await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      details,
      statusCode,
      ipAddress,
      userAgent,
      correlationId,
    })
  } catch (err) {
    console.error("[AUDIT] Failed to log action:", err.message)
    return null
  }
}

export default {
  logAction,
}