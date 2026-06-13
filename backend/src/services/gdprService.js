import User from "../models/User.js"
import AuditLog from "../models/AuditLog.js"
import Payment from "../models/Payment.js"
import Session from "../models/Session.js"
import DataRetention from "../models/DataRetention.js"
import ConsentLog from "../models/ConsentLog.js"
import Lease from "../models/Lease.js"
import MaintenanceRequest from "../models/MaintenanceRequest.js"
import mongoose from "mongoose"

// Export user data (GDPR Right to Access)
export async function exportUserData(userId) {
  try {
    const user = await User.findById(userId).select("-passwordHash -mfaSecret")

    const data = {
      profile: user,
      payments: await Payment.find({ tenantId: userId }).lean(),
      leases: await Lease.find({ tenantId: userId }).lean(),
      maintenanceRequests: await MaintenanceRequest.find({ tenantId: userId }).lean(),
      auditLogs: await AuditLog.find({ userId }).lean(),
      sessions: await Session.find({ userId }).select("-token").lean(),
      consents: await ConsentLog.find({ userId }).lean(),
    }

    return {
      exportedAt: new Date(),
      data,
    }
  } catch (error) {
    throw new Error(`Data export failed: ${error.message}`)
  }
}

export async function deleteUserData(userId, options = {}) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const user = await User.findById(userId)

    if (!user) {
      throw new Error("User not found")
    }

    if (options.anonymize) {
      // Anonymize user record
      await User.updateOne(
        { _id: userId },
        {
          firstName: "DELETED",
          lastName: "DELETED",
          email: `deleted_${userId}@deleted.local`,
          phoneNumber_encrypted: null,
          ssn_encrypted: null,
          bankDetails_encrypted: null,
          isDeleted: true,
          deletedAt: new Date(),
        },
        { session },
      )

      // Anonymize leases
      await Lease.updateMany(
        { tenantId: userId },
        {
          tenantName: "DELETED",
          tenantEmail: "deleted@deleted.local",
        },
        { session },
      )

      // Anonymize maintenance requests
      await MaintenanceRequest.updateMany(
        { tenantId: userId },
        {
          requestedBy: "DELETED",
          description: "DELETED",
        },
        { session },
      )

      // Anonymize payments
      await Payment.updateMany(
        { tenantId: userId },
        {
          amountEtb: null,
          paymentMethod: null,
        },
        { session },
      )
    } else {
      // Hard delete if not anonymizing
      await User.deleteOne({ _id: userId }, { session })

      // Delete/anonymize all related records
      await Lease.deleteMany({ tenantId: userId }, { session })
      await MaintenanceRequest.deleteMany({ tenantId: userId }, { session })
      await Payment.deleteMany({ tenantId: userId }, { session })
    }

    // Delete user sessions
    await Session.deleteMany({ userId }, { session })

    // Scrub audit logs (keep for compliance but remove details)
    await AuditLog.updateMany(
      { userId },
      {
        details: null,
        entityId: null,
      },
      { session },
    )

    // Create retention record for payments (90-day compliance hold)
    const paymentRetention = new DataRetention({
      userId,
      dataType: "payment_records",
      deleteAfter: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    })
    await paymentRetention.save({ session })

    await session.commitTransaction()

    return {
      success: true,
      message: "User data deletion processed with cascading cleanup",
      deletedAt: new Date(),
    }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

// Auto-delete expired data based on retention policy
export async function processDataRetention() {
  try {
    const expiredRetentions = await DataRetention.find({
      deleteAfter: { $lte: new Date() },
      isDeleted: false,
    })

    for (const retention of expiredRetentions) {
      switch (retention.dataType) {
        case "audit_logs":
          await AuditLog.deleteMany({ createdAt: { $lte: retention.deleteAfter } })
          break

        case "payment_records":
          // Only delete if no disputes
          await Payment.updateMany(
            { createdAt: { $lte: retention.deleteAfter }, status: "VERIFIED" },
            { isDeleted: true },
          )
          break

        case "session_logs":
          await Session.deleteMany({ createdAt: { $lte: retention.deleteAfter } })
          break

        case "activity_logs":
          // Custom deletion logic
          break
      }

      await DataRetention.updateOne({ _id: retention._id }, { isDeleted: true, deletedAt: new Date() })
    }

    console.log(`[GDPR] Processed ${expiredRetentions.length} data retention policies`)
  } catch (error) {
    console.error("Data retention processing failed:", error)
  }
}

// Record consent
export async function recordConsent(userId, consentType, consentGiven, req) {
  try {
    await ConsentLog.create({
      userId,
      consentType,
      consentGiven,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Consent recording failed:", error)
  }
}

// Revoke consent
export async function revokeConsent(userId, consentType) {
  try {
    await ConsentLog.updateMany({ userId, consentType, revokedAt: null }, { revokedAt: new Date() })
  } catch (error) {
    console.error("Consent revocation failed:", error)
  }
}

export default {
  exportUserData,
  deleteUserData,
  processDataRetention,
  recordConsent,
  revokeConsent,
}
