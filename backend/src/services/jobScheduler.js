// Cron-based job scheduler using node-cron
// Runs background tasks at scheduled intervals

import cron from "node-cron"
import Lease from "../models/Lease.js"
import Payment from "../models/Payment.js"
import User from "../models/User.js"
import JobQueue from "../models/JobQueue.js"
import { sendLeaseExpirationWarning, sendOverduePaymentNotice } from "./emailService.js"

let scheduledJobs = []

export async function initializeScheduledJobs() {
  console.log("[Job Scheduler] Initializing scheduled tasks...")

  // Job 1: Check for overdue payments - Runs daily at 8 AM
  scheduledJobs.push(
    cron.schedule("0 8 * * *", async () => {
      await detectOverduePayments()
    }),
  )

  // Job 2: Check for lease expiration - Runs daily at 9 AM
  scheduledJobs.push(
    cron.schedule("0 9 * * *", async () => {
      await checkLeaseExpirations()
    }),
  )

  // Job 3: Process job queue - Runs every 5 minutes
  scheduledJobs.push(
    cron.schedule("*/5 * * * *", async () => {
      await processJobQueue()
    }),
  )

  // Job 4: Generate daily financial reports - Runs at 6 PM daily
  scheduledJobs.push(
    cron.schedule("0 18 * * *", async () => {
      await generateDailyFinancialReport()
    }),
  )

  console.log("[Job Scheduler] All scheduled jobs initialized successfully")
}

async function detectOverduePayments() {
  try {
    console.log("[Job: Overdue Detection] Starting...")

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find unpaid payments past due date
    const overduePayments = await Payment.find({
      status: { $in: ["PENDING", "REJECTED"] },
      dueDate: { $lt: new Date(), $ne: null },
      createdAt: { $gt: thirtyDaysAgo },
      isDeleted: false,
    })
      .populate("leaseId")
      .populate("leaseId.tenantId")

    let notificationsSent = 0

    for (const payment of overduePayments) {
      if (!payment.dueDate) {
        continue
      }

      const daysOverdue = Math.max(1, Math.floor((Date.now() - payment.dueDate) / (1000 * 60 * 60 * 24)))

      // Create job queue entry for sending email
      await JobQueue.create({
        jobType: "SEND_OVERDUE_NOTICE",
        payload: {
          paymentId: payment._id,
          tenantId: payment.leaseId.tenantId._id,
          tenantEmail: payment.leaseId.tenantId.email,
          daysOverdue,
          amount: payment.amountEtb,
        },
        status: "PENDING",
      })

      notificationsSent++
    }

    console.log(
      `[Job: Overdue Detection] Found ${overduePayments.length} overdue payments, queued ${notificationsSent} notifications`,
    )
  } catch (err) {
    console.error("[Job: Overdue Detection] Error:", err.message)
  }
}

async function checkLeaseExpirations() {
  try {
    console.log("[Job: Lease Expiration] Starting...")

    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    // Find leases expiring within 30 days
    const expiringLeases = await Lease.find({
      status: "ACTIVE",
      endDate: { $gte: now, $lte: thirtyDaysFromNow },
      isDeleted: false,
    }).populate("tenantId")

    let notificationsSent = 0

    for (const lease of expiringLeases) {
      const daysUntilExpiry = Math.floor((lease.endDate - now) / (1000 * 60 * 60 * 24))

      // Only notify at certain intervals (30, 14, 7 days)
      if ([30, 14, 7].includes(daysUntilExpiry)) {
        await JobQueue.create({
          jobType: "LEASE_EXPIRATION_WARNING",
          payload: {
            leaseId: lease._id,
            tenantId: lease.tenantId._id,
            tenantEmail: lease.tenantId.email,
            tenantName: lease.tenantId.fullName,
            daysUntilExpiry,
            expirationDate: lease.endDate.toLocaleDateString(),
          },
          status: "PENDING",
        })

        notificationsSent++
      }
    }

    console.log(
      `[Job: Lease Expiration] Found ${expiringLeases.length} expiring leases, queued ${notificationsSent} notifications`,
    )
  } catch (err) {
    console.error("[Job: Lease Expiration] Error:", err.message)
  }
}

async function processJobQueue() {
  try {
    // Find pending jobs that are ready to process
    const pendingJobs = await JobQueue.find({
      status: "PENDING",
      $or: [{ nextRetryAt: null }, { nextRetryAt: { $lte: new Date() } }],
    }).limit(10) // Process max 10 jobs per run

    for (const job of pendingJobs) {
      try {
        console.log(`[Job Queue] Processing job: ${job.jobType}`)

        // Mark as processing
        await JobQueue.findByIdAndUpdate(job._id, { status: "PROCESSING" })

        let result

        // Handle different job types
        if (job.jobType === "SEND_OVERDUE_NOTICE") {
          const tenant = await User.findById(job.payload.tenantId)
          const payment = await Payment.findById(job.payload.paymentId)
          result = await sendOverduePaymentNotice(payment, tenant, job.payload.daysOverdue)
        } else if (job.jobType === "LEASE_EXPIRATION_WARNING") {
          const tenant = await User.findById(job.payload.tenantId)
          const lease = await Lease.findById(job.payload.leaseId)
          result = await sendLeaseExpirationWarning(lease, tenant, job.payload.daysUntilExpiry)
        }

        // Mark as completed
        await JobQueue.findByIdAndUpdate(job._id, {
          status: "COMPLETED",
          result,
          completedAt: new Date(),
        })

        console.log(`[Job Queue] Job completed: ${job._id}`)
      } catch (err) {
        console.error(`[Job Queue] Job failed: ${job._id}`, err.message)

        const newAttempts = job.attempts + 1

        // Calculate exponential backoff for retry
        const backoffMinutes = Math.pow(2, newAttempts)
        const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000)

        if (newAttempts < job.maxAttempts) {
          await JobQueue.findByIdAndUpdate(job._id, {
            status: "PENDING",
            attempts: newAttempts,
            nextRetryAt: nextRetry,
            errorMessage: err.message,
          })
        } else {
          await JobQueue.findByIdAndUpdate(job._id, {
            status: "FAILED",
            attempts: newAttempts,
            errorMessage: `Max retries exceeded: ${err.message}`,
          })
        }
      }
    }
  } catch (err) {
    console.error("[Job Queue] Processing error:", err.message)
  }
}

async function generateDailyFinancialReport() {
  try {
    console.log("[Job: Financial Report] Starting daily report generation...")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all payments from today
    const todaysPayments = await Payment.find({
      createdAt: { $gte: today, $lt: tomorrow },
      isDeleted: false,
    })

    const totalAmount = todaysPayments.reduce((sum, p) => sum + p.amountEtb, 0)
    const verifiedCount = todaysPayments.filter((p) => p.status === "VERIFIED").length
    const pendingCount = todaysPayments.filter((p) => p.status === "PENDING").length

    const report = {
      date: today.toLocaleDateString(),
      totalPayments: todaysPayments.length,
      totalAmountEtb: totalAmount,
      verifiedPayments: verifiedCount,
      pendingPayments: pendingCount,
      rejectedPayments: todaysPayments.filter((p) => p.status === "REJECTED").length,
    }

    // Get all PM/FS users for report email
    const admins = await User.find({ role: { $in: ["ADMIN", "FS"] } })

    // Queue email jobs for each admin
    for (const admin of admins) {
      await JobQueue.create({
        jobType: "SEND_FINANCIAL_REPORT",
        payload: {
          adminId: admin._id,
          adminEmail: admin.email,
          report,
        },
        status: "PENDING",
      })
    }

    console.log("[Job: Financial Report] Daily report generated successfully")
  } catch (err) {
    console.error("[Job: Financial Report] Error:", err.message)
  }
}

export function stopScheduledJobs() {
  console.log("[Job Scheduler] Stopping all scheduled tasks...")
  scheduledJobs.forEach((job) => job.stop())
  scheduledJobs = []
}
export default {
  initializeScheduledJobs,
  stopScheduledJobs,
}
