// Notification Controller - Handle notification preferences and history

import User from "../models/User.js"
import EmailLog from "../models/EmailLog.js"
import JobQueue from "../models/JobQueue.js"

// Get user notification preferences
export async function getNotificationPreferences(req, res) {
  try {
    const userId = req.user._id
    const user = await User.findById(userId).select("notificationPreferences email")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        preferences: user.notificationPreferences || {},
      },
    })
  } catch (err) {
    console.error("[Notification] Get preferences error:", err.message)
    return res.status(500).json({ message: "Failed to retrieve preferences" })
  }
}

// Update notification preferences
export async function updateNotificationPreferences(req, res) {
  try {
    const userId = req.user._id
    const { paymentAlerts, leaseAlerts, maintenanceAlerts } = req.body

    const normalizeFlag = (value, field) => {
      if (value === undefined) return undefined
      if (typeof value !== "boolean") {
        throw new Error(`${field} must be a boolean`)
      }
      return value
    }

    const nextPaymentAlerts = normalizeFlag(paymentAlerts, "paymentAlerts")
    const nextLeaseAlerts = normalizeFlag(leaseAlerts, "leaseAlerts")
    const nextMaintenanceAlerts = normalizeFlag(maintenanceAlerts, "maintenanceAlerts")

    const user = await User.findByIdAndUpdate(
      userId,
      {
        notificationPreferences: {
          paymentAlerts: nextPaymentAlerts !== undefined ? nextPaymentAlerts : true,
          leaseAlerts: nextLeaseAlerts !== undefined ? nextLeaseAlerts : true,
          maintenanceAlerts: nextMaintenanceAlerts !== undefined ? nextMaintenanceAlerts : true,
        },
      },
      { new: true },
    ).select("notificationPreferences")

    return res.status(200).json({
      success: true,
      data: user.notificationPreferences,
      message: "Preferences updated successfully",
    })
  } catch (err) {
    console.error("[Notification] Update preferences error:", err.message)
    return res.status(500).json({ message: "Failed to update preferences" })
  }
}

// Get email logs for a user
export async function getEmailHistory(req, res) {
  try {
    const { recipient, status, limit = 20, page = 1 } = req.query
    const userRole = req.user.role

    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20

    const query = {}
    if (["ADMIN", "FS", "GM"].includes(userRole)) {
      if (recipient) query.recipient = recipient
    } else {
      query.recipient = req.user.email
    }
    if (status) query.status = status

    const skip = (pageNumber - 1) * limitNumber

    const logs = await EmailLog.find(query).sort({ createdAt: -1 }).limit(limitNumber).skip(skip)

    const total = await EmailLog.countDocuments(query)

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    })
  } catch (err) {
    console.error("[Notification] Get email history error:", err.message)
    return res.status(500).json({ message: "Failed to retrieve email history" })
  }
}

// Get job queue status
export async function getJobQueueStatus(req, res) {
  try {
    const { status, limit = 20, page = 1 } = req.query

    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20

    const query = status ? { status } : {}
    const skip = (pageNumber - 1) * limitNumber

    const jobs = await JobQueue.find(query).sort({ createdAt: -1 }).limit(limitNumber).skip(skip)

    const stats = await JobQueue.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    return res.status(200).json({
      success: true,
      data: jobs,
      stats: Object.fromEntries(stats.map((s) => [s._id, s.count])),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
      },
    })
  } catch (err) {
    console.error("[Notification] Get job queue error:", err.message)
    return res.status(500).json({ message: "Failed to retrieve job queue" })
  }
}

// Retry failed job
export async function retryFailedJob(req, res) {
  try {
    const { jobId } = req.params

    const job = await JobQueue.findById(jobId)
    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    if (job.status !== "FAILED") {
      return res.status(400).json({ message: "Only failed jobs can be retried" })
    }

    // Reset job for retry
    await JobQueue.findByIdAndUpdate(jobId, {
      status: "PENDING",
      attempts: 0,
      nextRetryAt: new Date(),
      errorMessage: null,
    })

    return res.status(200).json({
      success: true,
      message: "Job queued for retry",
    })
  } catch (err) {
    console.error("[Notification] Retry job error:", err.message)
    return res.status(500).json({ message: "Failed to retry job" })
  }
}

// Resend email notification
export async function resendEmailNotification(req, res) {
  try {
    const { emailLogId } = req.params

    const emailLog = await EmailLog.findById(emailLogId)
    if (!emailLog) {
      return res.status(404).json({ message: "Email log not found" })
    }

    // Create a new job to resend the email
    await JobQueue.create({
      jobType: "RESEND_EMAIL",
      payload: {
        recipient: emailLog.recipient,
        subject: emailLog.subject,
        templateType: emailLog.templateType,
        originalEmailLogId: emailLogId,
      },
      status: "PENDING",
    })

    return res.status(200).json({
      success: true,
      message: "Email queued for resending",
    })
  } catch (err) {
    console.error("[Notification] Resend email error:", err.message)
    return res.status(500).json({ message: "Failed to resend email" })
  }
}
