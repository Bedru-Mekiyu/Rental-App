// src/controllers/paymentController.js (ESM) - Production-ready with PM/ADMIN verification

import Payment from "../models/Payment.js"
import PaymentProof from "../models/PaymentProof.js"
import Lease from "../models/Lease.js"
import Property from "../models/Property.js" // Added import for Property
import { logAction } from "../utils/auditLogger.js"
import { createPaymentWithTransaction } from "../utils/transactionWrapper.js"
import { canAccessLease, canVerifyPayments } from "../middleware/authorization.js"

export async function createPayment(req, res) {
  try {
    const { leaseId, amountEtb, paymentMethod, externalTransactionId } = req.body
    const userId = req.user._id
    const userRole = req.user.role
    const idempotencyKey = req.idempotencyKey

    const lease = await Lease.findById(leaseId)
    if (!lease || lease.status !== "ACTIVE") {
      return res.status(400).json({ status: 400, message: "Invalid or inactive lease" })
    }

    const canAccess = await canAccessLease(userId, leaseId, userRole)
    if (!canAccess) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    const payment = await createPaymentWithTransaction({
      leaseId,
      tenantId: lease.tenantId,
      amountEtb,
      paymentMethod,
      externalTransactionId,
      userId,
      idempotencyKey,
    })

    await logAction({
      userId,
      action: "PAYMENT_CREATED",
      entityType: "Payment",
      entityId: payment._id,
      details: { leaseId, amountEtb, paymentMethod },
    })

    res.status(201).json({
      status: 201,
      message: "Payment recorded successfully",
      data: payment,
    })
  } catch (err) {
    res.status(400).json({ status: 400, message: err.message || "Failed to create payment" })
  }
}

export async function verifyPayment(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    if (!canVerifyPayments(userRole)) {
      await logAction({
        userId,
        action: "PAYMENT_VERIFY_DENIED",
        entityType: "Payment",
        entityId: id,
        details: { reason: "Insufficient role" },
      })
      return res.status(403).json({
        status: 403,
        message: "Only PM and ADMIN can verify payments",
      })
    }

    const payment = await Payment.findOne({ _id: id, isDeleted: false })
    if (!payment) {
      return res.status(404).json({ status: 404, message: "Payment not found" })
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({ status: 400, message: "Only pending payments can be verified" })
    }

    const canAccess = await canAccessLease(userId, payment.leaseId, userRole)
    if (!canAccess) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    if (["BANK_TRANSFER", "MOBILE_MONEY", "CHAPA", "TELEBIRR", "BELL"].includes(payment.paymentMethod)) {
      const proof = await PaymentProof.findOne({ paymentId: payment._id, isDeleted: false })
      if (!proof) {
        return res.status(400).json({ status: 400, message: "Payment proof required before verification" })
      }
    }

    const updated = await Payment.findByIdAndUpdate(
      id,
      {
        status: "VERIFIED",
        verifiedBy: userId,
        verifiedAt: new Date(),
      },
      { new: true },
    )

    await logAction({
      userId,
      action: "PAYMENT_VERIFIED",
      entityType: "Payment",
      entityId: id,
      details: { leaseId: payment.leaseId, amountEtb: payment.amountEtb },
    })

    res.json({
      status: 200,
      message: "Payment verified successfully",
      data: updated,
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to verify payment" })
  }
}

export async function rejectPayment(req, res) {
  try {
    const { id } = req.params
    const { rejectionReason } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    if (!canVerifyPayments(userRole)) {
      return res.status(403).json({ status: 403, message: "Only PM and ADMIN can reject payments" })
    }

    const payment = await Payment.findOne({ _id: id, isDeleted: false })
    if (!payment) {
      return res.status(404).json({ status: 404, message: "Payment not found" })
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({ status: 400, message: "Only pending payments can be rejected" })
    }

    const canAccess = await canAccessLease(userId, payment.leaseId, userRole)
    if (!canAccess) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    const updated = await Payment.findByIdAndUpdate(
      id,
      {
        status: "REJECTED",
        rejectionReason,
        verifiedBy: userId,
        verifiedAt: new Date(),
      },
      { new: true },
    )

    await logAction({
      userId,
      action: "PAYMENT_REJECTED",
      entityType: "Payment",
      entityId: id,
      details: { leaseId: payment.leaseId, reason: rejectionReason },
    })

    res.json({
      status: 200,
      message: "Payment rejected",
      data: updated,
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to reject payment" })
  }
}

export async function listPayments(req, res) {
  try {
    const { page = 1, limit = 20, status, leaseId } = req.query
    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20
    const skip = (pageNumber - 1) * limitNumber
    const userId = req.user._id
    const userRole = req.user.role

    const filter = { isDeleted: false }
    if (status) filter.status = status

    if (userRole === "TENANT") {
      filter.tenantId = userId
    } else if (userRole === "PM") {
      // PM can see payments for their properties' leases
      const properties = await Property.find({ managerId: userId, isDeleted: false }, { _id: 1 }).lean()
      const leases = await Lease.find({ propertyId: { $in: properties.map((p) => p._id) } }, { _id: 1 }).lean()
      filter.leaseId = { $in: leases.map((l) => l._id) }
    }

    if (leaseId) {
      // If specific lease requested, verify access
      const canAccess = await canAccessLease(userId, leaseId, userRole)
      if (!canAccess) return res.status(403).json({ status: 403, message: "Forbidden" })
      filter.leaseId = leaseId
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("leaseId tenantId")
        .lean(),
      Payment.countDocuments(filter),
    ])

    res.json({
      status: 200,
      data: payments,
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to fetch payments" })
  }
}
