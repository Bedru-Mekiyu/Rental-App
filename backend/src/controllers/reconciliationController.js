import { generateReconciliationReport, resolveDiscrepancy } from "../services/reconciliationService.js"
import PaymentReconciliation from "../models/PaymentReconciliation.js"
import Lease from "../models/Lease.js"
import Property from "../models/Property.js"
import { canManageProperty } from "../middleware/authorization.js"
import { logAction } from "../services/logActionService.js"

export async function generateReconciliation(req, res) {
  try {
    const { leaseId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN", "FS"].includes(userRole)) {
      return res.status(403).json({ message: "Only PM/ADMIN/FS can generate reconciliation" })
    }

    if (userRole === "PM") {
      const lease = await Lease.findById(leaseId)
      if (!lease || !(await canManageProperty(userId, lease.propertyId, userRole))) {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    const existing = await PaymentReconciliation.findOne({
      leaseId,
      status: "PENDING",
      isDeleted: false,
    })
    if (existing) {
      return res.status(400).json({ message: "Reconciliation already in progress" })
    }

    const reconciliation = await generateReconciliationReport(leaseId)

    await logAction({
      userId,
      action: "RECONCILIATION_GENERATED",
      entityType: "PaymentReconciliation",
      entityId: reconciliation._id,
      details: { leaseId, totalOverdue: reconciliation.totalOverdue },
    })

    res.json({
      status: 200,
      message: "Reconciliation report generated",
      data: reconciliation,
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function getReconciliationReport(req, res) {
  try {
    const { reconciliationId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN", "FS"].includes(userRole)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const report = await PaymentReconciliation.findById(reconciliationId)
      .populate("tenantId", "name email")
      .populate("leaseId", "monthlyRentEtb startDate endDate")

    if (!report) {
      return res.status(404).json({ message: "Reconciliation report not found" })
    }

    if (userRole === "PM") {
      const lease = await Lease.findById(report.leaseId)
      if (!lease || !(await canManageProperty(userId, lease.propertyId, userRole))) {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    res.json({ status: 200, data: report })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function resolveDiscrepancyEndpoint(req, res) {
  try {
    const { reconciliationId, discrepancyIndex } = req.params
    const { resolution } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ message: "Only PM/ADMIN can resolve discrepancies" })
    }

    if (userRole === "PM") {
      const report = await PaymentReconciliation.findById(reconciliationId)
      if (!report) {
        return res.status(404).json({ message: "Reconciliation report not found" })
      }
      const lease = await Lease.findById(report.leaseId)
      if (!lease || !(await canManageProperty(userId, lease.propertyId, userRole))) {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    const updated = await resolveDiscrepancy(reconciliationId, discrepancyIndex, resolution)

    await logAction({
      userId,
      action: "DISCREPANCY_RESOLVED",
      entityType: "PaymentReconciliation",
      entityId: reconciliationId,
      details: { discrepancyIndex, resolution },
    })

    res.json({ status: 200, message: "Discrepancy resolved", data: updated })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function listReconciliations(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const userId = req.user._id
    const userRole = req.user.role

    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20

    if (!["PM", "ADMIN", "FS"].includes(userRole)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const query = { isDeleted: false }
    if (status) query.status = status

    if (userRole === "PM") {
      const properties = await Property.find({ managerId: userId, isDeleted: false }, { _id: 1 })
      const leases = await Lease.find({ propertyId: { $in: properties.map((p) => p._id) } }, { _id: 1 })
      query.leaseId = { $in: leases.map((l) => l._id) }
    }

    const skip = (pageNumber - 1) * limitNumber
    const reconciliations = await PaymentReconciliation.find(query)
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 })

    const total = await PaymentReconciliation.countDocuments(query)

    res.json({
      status: 200,
      data: reconciliations,
      pagination: { page: pageNumber, limit: limitNumber, total },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}
