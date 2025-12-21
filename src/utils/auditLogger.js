// src/utils/auditLogger.js (ESM)

import AuditLog from "../models/AuditLog.js";

export async function logAction({ userId, action, entityType, entityId, details }) {
  try {
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (err) {
    // Do not break main request if logging fails
    console.error("Audit log error:", err.message);
  }
}
