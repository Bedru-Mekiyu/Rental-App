// src/models/Payment.js (ESM) - Enhanced with verification controls

import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: [true, "Lease is required"],
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant is required"],
      index: true,
    },
    amountEtb: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },
    paymentMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "MOBILE_MONEY", "CASH", "CHECK", "CHAPA", "TELEBIRR", "BELL"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "REFUNDED"],
      default: "PENDING",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      validate: {
        async validator(v) {
          if (!v) return true // OK if not verified yet
          const User = mongoose.model("User")
          const user = await User.findById(v)
          return user && ["PM", "ADMIN"].includes(user.role)
        },
        message: "Only PM or ADMIN can verify payments",
      },
    },
    verifiedAt: Date,
    rejectionReason: String,
    externalTransactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

paymentSchema.index({ leaseId: 1, createdAt: -1 })

export default mongoose.model("Payment", paymentSchema)
