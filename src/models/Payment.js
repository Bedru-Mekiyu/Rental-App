// src/models/Payment.js (ESM)

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    amountEtb: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String, // e.g. "MANUAL_CASH", "MANUAL_BANK", "TELEBIRR"
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    externalTransactionId: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for reports and lookups
paymentSchema.index({ leaseId: 1 });
paymentSchema.index({ status: 1, transactionDate: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
