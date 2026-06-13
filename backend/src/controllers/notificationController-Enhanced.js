import { sendSMS, sendWhatsApp } from "../services/smsWhatsappService.js"
import SMSLog from "../models/SMSLog.js"
import { SMS_TEMPLATES } from "../services/notificationTemplates.js"
import { logAction } from "../services/logActionService.js"
import Lease from "../models/Lease.js"
import Property from "../models/Property.js"
import Invoice from "../models/Invoice.js"

export async function sendPaymentReminderSMS(req, res) {
  try {
    const { leaseId, channel = "SMS" } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ message: "Only PM/ADMIN can send notifications" })
    }

    const lease = await Lease.findById(leaseId).populate("tenantId")
    if (!lease) return res.status(404).json({ message: "Lease not found" })

    if (lease.status !== "ACTIVE") {
      return res.status(400).json({ message: "Lease is not active" })
    }

    if (channel !== "SMS" && channel !== "WHATSAPP") {
      return res.status(400).json({ message: "Invalid channel" })
    }

    if (userRole === "PM") {
      const property = await Property.findById(lease.propertyId)
      if (!property || property.managerId?.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    const tenant = lease.tenantId
    if (!tenant.phoneNumber) return res.status(400).json({ message: "Tenant phone number not set" })

    const message = SMS_TEMPLATES.PAYMENT_DUE(
      tenant.name,
      lease.monthlyRentEtb,
      new Date(lease.endDate).toLocaleDateString(),
    )

    let result
    if (channel === "WHATSAPP") {
      result = await sendWhatsApp(tenant.phoneNumber, message)
    } else {
      result = await sendSMS(tenant.phoneNumber, message)
    }

    const smsLog = await SMSLog.create({
      recipient: tenant.phoneNumber,
      channel,
      messageType: "PAYMENT_DUE",
      message,
      status: "SENT",
      externalMessageId: result.messageId,
      sentAt: new Date(),
    })

    await logAction({
      userId,
      action: "PAYMENT_REMINDER_SENT",
      entityType: "SMSLog",
      entityId: smsLog._id,
      details: { channel, tenantId: tenant._id },
    })

    res.json({ status: 200, message: `${channel} sent successfully`, data: smsLog })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function sendBulkReminders(req, res) {
  try {
    const { reminderType, channel = "SMS" } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    if (!["ADMIN", "GM"].includes(userRole)) {
      return res.status(403).json({ message: "Only ADMIN/GM can send bulk notifications" })
    }

    if (channel !== "SMS" && channel !== "WHATSAPP") {
      return res.status(400).json({ message: "Invalid channel" })
    }

    if (!["LEASE_EXPIRING", "PAYMENT_OVERDUE"].includes(reminderType)) {
      return res.status(400).json({ message: "Invalid reminder type" })
    }

    const now = new Date()
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    let targets = []

    if (reminderType === "LEASE_EXPIRING") {
      const leases = await Lease.find({
          endDate: { $gte: now, $lte: thirtyDaysLater },
          status: "ACTIVE",
        })
        .populate("tenantId")

      targets = leases.map((lease) => ({ tenant: lease.tenantId, lease }))
    } else if (reminderType === "PAYMENT_OVERDUE") {
      const overdueInvoices = await Invoice.find({ status: { $in: ["OVERDUE"] }, isDeleted: false })
        .populate("tenantId")

      targets = overdueInvoices.map((invoice) => ({ tenant: invoice.tenantId, invoice }))
    }

    let sentCount = 0
    let failedCount = 0
    const logs = []

    for (const target of targets) {
      try {
        const tenant = target.tenant
        if (!tenant.phoneNumber) continue

        let message = ""
        if (reminderType === "LEASE_EXPIRING") {
          const leaseEndDate = target.lease?.endDate ? new Date(target.lease.endDate) : new Date()
          message = SMS_TEMPLATES.LEASE_EXPIRING_30DAYS(tenant.name, leaseEndDate.toLocaleDateString())
        } else if (reminderType === "PAYMENT_OVERDUE") {
          const dueDate = target.invoice?.dueDate ? new Date(target.invoice.dueDate) : new Date()
          const daysOverdue = Math.max(1, Math.ceil((now - dueDate) / (24 * 60 * 60 * 1000)))
          const amount = target.invoice?.amountEtb || 0
          message = SMS_TEMPLATES.PAYMENT_OVERDUE(tenant.name, amount, daysOverdue)
        }

        if (!message) {
          failedCount += 1
          continue
        }

        if (channel === "WHATSAPP") {
          await sendWhatsApp(tenant.phoneNumber, message)
        } else {
          await sendSMS(tenant.phoneNumber, message)
        }

        const smsLog = await SMSLog.create({
          recipient: tenant.phoneNumber,
          channel,
          messageType: reminderType,
          message,
          status: "SENT",
          sentAt: new Date(),
        })

        logs.push(smsLog)
        sentCount += 1
      } catch (err) {
        console.error("[v0] Bulk notification error:", err)
        failedCount += 1
      }
    }

    await logAction({
      userId,
      action: "BULK_REMINDERS_SENT",
      entityType: "SMSLog",
      entityId: null,
      details: {
        reminderType,
        channel,
        sentCount,
        failedCount,
      },
    })

    res.json({
      status: 200,
      message: `Bulk ${reminderType} notifications sent`,
      data: { sentCount, failedCount, logs },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function getSMSLog(req, res) {
  try {
    const userRole = req.user.role
    if (!["ADMIN", "GM"].includes(userRole)) {
      return res.status(403).json({ status: 403, message: "Access denied" })
    }

    const { page = 1, limit = 20, status } = req.query

    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20

    const query = { isDeleted: false }
    if (status) query.status = status

    const skip = (pageNumber - 1) * limitNumber
    const logs = await SMSLog.find(query).skip(skip).limit(limitNumber).sort({ createdAt: -1 })

    const total = await SMSLog.countDocuments(query)

    res.json({
      status: 200,
      data: logs,
      pagination: { page: pageNumber, limit: limitNumber, total },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}
