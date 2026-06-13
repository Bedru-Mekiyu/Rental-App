import PaymentDispute from "../models/PaymentDispute.js"
import Payment from "../models/Payment.js"
import Lease from "../models/Lease.js"
import Property from "../models/Property.js"
import { canManageProperty } from "../middleware/authorization.js"
import { logAction } from "../services/logActionService.js"

export async function createDispute(req, res) {
  try {
    const { paymentId } = req.params
    const { reason, description, evidence } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    const payment = await Payment.findById(paymentId)
    if (!payment) return res.status(404).json({ message: "Payment not found" })

    if (payment.tenantId.toString() !== userId.toString() && userRole !== "ADMIN") {
      return res.status(403).json({ message: "Can only dispute own payments" })
    }

    const existingDispute = await PaymentDispute.findOne({
      paymentId,
      status: { $in: ["OPEN", "UNDER_REVIEW"] },
    })
    if (existingDispute) return res.status(400).json({ message: "Dispute already exists for this payment" })

    const dispute = await PaymentDispute.create({
      paymentId,
      leaseId: payment.leaseId,
      tenantId: userId,
      reason,
      description,
      evidence,
      status: "OPEN",
    })

    await logAction({
      userId,
      action: "DISPUTE_CREATED",
      entityType: "PaymentDispute",
      entityId: dispute._id,
      details: { paymentId, reason },
    })

    res.status(201).json({ status: 201, message: "Dispute created", data: dispute })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function getDispute(req, res) {
  try {
    const { disputeId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const dispute = await PaymentDispute.findById(disputeId)
      .populate("tenantId", "name email")
      .populate("paymentId", "amountEtb status")

    if (!dispute) return res.status(404).json({ message: "Dispute not found" })

    if (dispute.tenantId.toString() !== req.user._id.toString() && !["PM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (userRole === "PM") {
      const lease = await Lease.findById(dispute.leaseId)
      if (!lease || !(await canManageProperty(userId, lease.propertyId, userRole))) {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    res.json({ status: 200, data: dispute })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function resolveDispute(req, res) {
  try {
    const { disputeId } = req.params
    const { resolutionAction, refundAmount, resolutionNotes } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ message: "Only PM/ADMIN can resolve disputes" })
    }

    const dispute = await PaymentDispute.findById(disputeId)
    if (!dispute) return res.status(404).json({ message: "Dispute not found" })

    if (userRole === "PM") {
      const lease = await Lease.findById(dispute.leaseId)
      if (!lease || !(await canManageProperty(userId, lease.propertyId, userRole))) {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    if (dispute.status !== "UNDER_REVIEW") {
      return res.status(400).json({ message: "Can only resolve disputes under review" })
    }

    let status = "RESOLVED"
    if (resolutionAction === "REFUND") {
      const payment = await Payment.findById(dispute.paymentId)
      if (!payment) return res.status(404).json({ message: "Payment not found" })
      if (!Number.isFinite(Number(refundAmount)) || Number(refundAmount) <= 0) {
        return res.status(400).json({ message: "Refund amount required" })
      }
      if (Number(refundAmount) > payment.amountEtb) {
        return res.status(400).json({ message: "Refund exceeds payment amount" })
      }
      await Payment.updateOne({ _id: payment._id }, { status: "REFUNDED" })
      status = "REFUNDED"
    }

    const updated = await PaymentDispute.findByIdAndUpdate(
      disputeId,
      {
        status,
        resolutionAction,
        refundAmount,
        resolutionNotes,
        resolvedAt: new Date(),
        resolvedBy: userId,
      },
      { new: true },
    )

    await logAction({
      userId,
      action: "DISPUTE_RESOLVED",
      entityType: "PaymentDispute",
      entityId: disputeId,
      details: { resolutionAction, refundAmount },
    })

    res.json({ status: 200, message: "Dispute resolved", data: updated })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function listDisputes(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const userId = req.user._id
    const userRole = req.user.role

    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20

    const query = { isDeleted: false }
    if (status) query.status = status

    if (!["PM", "ADMIN"].includes(userRole)) {
      query.tenantId = req.user._id
    }

    if (userRole === "PM") {
      const properties = await Property.find({ managerId: userId, isDeleted: false }, { _id: 1 })
      const leases = await Lease.find({ propertyId: { $in: properties.map((p) => p._id) } }, { _id: 1 })
      query.leaseId = { $in: leases.map((l) => l._id) }
    }

    const skip = (pageNumber - 1) * limitNumber
    const disputes = await PaymentDispute.find(query).skip(skip).limit(limitNumber).sort({ createdAt: -1 })

    const total = await PaymentDispute.countDocuments(query)

    res.json({
      status: 200,
      data: disputes,
      pagination: { page: pageNumber, limit: limitNumber, total },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}
