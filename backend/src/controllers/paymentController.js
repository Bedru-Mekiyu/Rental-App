// src/controllers/paymentController.js (ESM)

import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Lease from "../models/Lease.js";
import { logAction } from "../utils/auditLogger.js";

/**
 * POST /api/payments
 * Roles: TENANT, ADMIN (and optionally PM if route allows)
 * Create a payment record (tenant-initiated, starts as PENDING)
 */
export async function createPayment(req, res) {
  try {
    const {
      leaseId,
      amountEtb,
      transactionDate,
      paymentMethod,
      externalTransactionId,
      receiptUrl,
      status,
    } = req.body;

    if (!leaseId || !amountEtb || !transactionDate || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate leaseId format
    if (!mongoose.Types.ObjectId.isValid(leaseId)) {
      return res.status(400).json({ message: "Invalid lease ID format" });
    }

    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    const payment = await Payment.create({
      leaseId,
      amountEtb,
      transactionDate,
      paymentMethod,
      externalTransactionId,
      receiptUrl,
      // always start as PENDING; verification is done by PM/ADMIN
      status: status || "PENDING",
      createdBy: req.user.id,
    });

    await logAction({
      userId: req.user.id,
      action: "PAYMENT_CREATE",
      entityType: "PAYMENT",
      entityId: payment._id,
      details: {
        leaseId,
        amountEtb,
        paymentMethod,
        status: payment.status,
      },
    });

    return res.status(201).json(payment);
  } catch (err) {
    console.error("createPayment error:", err);
    return res.status(500).json({ message: "Failed to create payment" });
  }
}

/**
 * PATCH /api/payments/:id/status
 * Roles: PM, ADMIN
 * Update payment status (PENDING -> VERIFIED/REJECTED)
 */
export async function updatePaymentStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = status;
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();
    await payment.save();

    await payment.save();

    await logAction({
      userId: req.user.id,
      action: "PAYMENT_STATUS_UPDATE",
      entityType: "PAYMENT",
      entityId: payment._id,
      details: { status },
    });

    return res.json(payment);
  } catch (err) {
    console.error("updatePaymentStatus error:", err);
    return res
      .status(500)
      .json({ message: "Failed to update payment status" });
  }
}

/**
 * GET /api/payments
 * Roles: PM, ADMIN
 * Optional query: status, method, q (search)
 */
export async function listPayments(req, res) {
  try {
    const { status, method, q } = req.query;

    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (method && method !== "All") {
      filter.paymentMethod = method;
    }

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { externalTransactionId: regex },
        { paymentMethod: regex },
      ];
    }

    const payments = await Payment.find(filter)
      .sort({ transactionDate: -1 })
      .limit(200);

    return res.json(payments);
  } catch (err) {
    console.error("listPayments error:", err);
    return res.status(500).json({ message: "Failed to fetch payments" });
  }
}

/**
 * GET /api/payments/by-lease/:leaseId
 * Roles: PM, ADMIN
 */
export async function listByLease(req, res) {
  try {
    const { leaseId } = req.params;

    const payments = await Payment.find({ leaseId }).sort({
      transactionDate: -1,
    });

    return res.json(payments);
  } catch (err) {
    console.error("listByLease error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch payments by lease" });
  }
}

/**
 * GET /api/payments/by-tenant/:tenantId
 * Roles: TENANT, PM, ADMIN (TENANT should see only own leases)
 */
export async function listByTenant(req, res) {
  try {
    const { tenantId } = req.params;

    const leases = await Lease.find({ tenantId }, { _id: 1 });
    const leaseIds = leases.map((l) => l._id);

    if (leaseIds.length === 0) {
      return res.json([]);
    }

    const payments = await Payment.find({
      leaseId: { $in: leaseIds },
    }).sort({
      transactionDate: -1,
    });

    return res.json(payments);
  } catch (err) {
    console.error("listByTenant error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch payments by tenant" });
  }
}
