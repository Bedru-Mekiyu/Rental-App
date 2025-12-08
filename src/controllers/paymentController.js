// src/controllers/paymentController.js

const Payment = require('../models/Payment');
const Lease = require('../models/Lease');
const { logAction } = require('../utils/auditLogger');

/**
 * POST /api/payments
 * Roles: FS, PM, ADMIN
 * Create a manual payment record (initially PENDING or VERIFIED)
 */
exports.createPayment = async (req, res) => {
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
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }

    const payment = await Payment.create({
      leaseId,
      amountEtb,
      transactionDate,
      paymentMethod,
      externalTransactionId,
      receiptUrl,
      status: status || 'PENDING',
    });

    await logAction({
      userId: req.user.id,
      action: 'PAYMENT_CREATE',
      entityType: 'PAYMENT',
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
    console.error('createPayment error:', err);
    return res.status(500).json({ message: 'Failed to create payment' });
  }
};

/**
 * PATCH /api/payments/:id/status
 * Roles: FS, PM, ADMIN
 * Update payment status (PENDING, VERIFIED, REJECTED)
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = status;
    await payment.save();

    await logAction({
      userId: req.user.id,
      action: 'PAYMENT_STATUS_UPDATE',
      entityType: 'PAYMENT',
      entityId: payment._id,
      details: { status },
    });

    return res.json(payment);
  } catch (err) {
    console.error('updatePaymentStatus error:', err);
    return res.status(500).json({ message: 'Failed to update payment status' });
  }
};

/**
 * GET /api/payments/by-lease/:leaseId
 * Roles: FS, PM, ADMIN
 * List payments for a specific lease
 */
exports.listByLease = async (req, res) => {
  try {
    const { leaseId } = req.params;

    const payments = await Payment.find({ leaseId }).sort({
      transactionDate: -1,
    });

    return res.json(payments);
  } catch (err) {
    console.error('listByLease error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to fetch payments by lease' });
  }
};

/**
 * GET /api/payments/by-tenant/:tenantId
 * Roles: FS, PM, ADMIN
 * List payments for all leases of a specific tenant
 */
exports.listByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const leases = await Lease.find({ tenantId }, { _id: 1 });
    const leaseIds = leases.map((l) => l._id);

    if (leaseIds.length === 0) {
      return res.json([]);
    }

    const payments = await Payment.find({ leaseId: { $in: leaseIds } }).sort({
      transactionDate: -1,
    });

    return res.json(payments);
  } catch (err) {
    console.error('listByTenant error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to fetch payments by tenant' });
  }
};
