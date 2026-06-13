import { generateInvoice, createPaymentSchedule } from "../services/invoiceService.js"
import Invoice from "../models/Invoice.js"
import Lease from "../models/Lease.js"
import Property from "../models/Property.js"
import { logAction } from "../services/logActionService.js"

export async function createInvoice(req, res) {
  try {
    const { leaseId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN", "FS"].includes(userRole)) {
      return res.status(403).json({ message: "Only PM/ADMIN/FS can create invoices" })
    }

    const invoice = await generateInvoice(leaseId, userId)

    await logAction({
      userId,
      action: "INVOICE_CREATED",
      entityType: "Invoice",
      entityId: invoice._id,
      details: { leaseId, invoiceNumber: invoice.invoiceNumber, amount: invoice.amountEtb },
    })

    res.status(201).json({ status: 201, message: "Invoice created", data: invoice })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function setupPaymentSchedule(req, res) {
  try {
    const { leaseId } = req.params
    const { billingCycle, billingDay } = req.body
    const userRole = req.user.role

    if (!["PM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ message: "Only PM/ADMIN can setup schedules" })
    }

    const schedule = await createPaymentSchedule(leaseId, billingCycle || "MONTHLY", billingDay || 1)

    res.status(201).json({ status: 201, message: "Payment schedule created", data: schedule })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function listInvoices(req, res) {
  try {
    const { leaseId, status, page = 1, limit = 20 } = req.query
    const userId = req.user._id
    const userRole = req.user.role

    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20

    const query = { isDeleted: false }
    if (leaseId) query.leaseId = leaseId
    if (status) query.status = status

    if (userRole === "TENANT") {
      query.tenantId = userId
    }

    if (userRole === "PM") {
      const properties = await Property.find({ managerId: userId, isDeleted: false }, { _id: 1 })
      const leases = await Lease.find({ propertyId: { $in: properties.map((p) => p._id) } }, { _id: 1 })
      query.leaseId = { $in: leases.map((l) => l._id) }
    }

    const skip = (pageNumber - 1) * limitNumber
    const invoices = await Invoice.find(query).skip(skip).limit(limitNumber).sort({ dueDate: 1 })

    const total = await Invoice.countDocuments(query)

    res.json({
      status: 200,
      data: invoices,
      pagination: { page: pageNumber, limit: limitNumber, total },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}
