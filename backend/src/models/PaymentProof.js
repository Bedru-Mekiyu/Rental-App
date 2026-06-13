// src/models/PaymentProof.js (ESM)
// Stores payment verification documents/receipts

import mongoose from "mongoose"

const paymentProofSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      unique: true,
      index: true,
    },
    proofImage: {
      type: String, // File path: /uploads/payments/...
      required: [true, "Proof image is required"],
    },
    proofType: {
      type: String,
      enum: ["BANK_RECEIPT", "MOBILE_TRANSFER", "CHECK_PHOTO", "OTHER"],
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationComments: String,
    verificationDate: Date,
    extractedData: {
      transactionId: String,
      amount: String,
      date: String,
      senderName: String,
    },
    imageMetadata: {
      size: Number,
      dimensions: {
        width: Number,
        height: Number,
      },
      uploadedFormat: String,
      processedFormat: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

paymentProofSchema.index({ paymentId: 1, createdAt: -1 })
paymentProofSchema.index({ uploadedBy: 1, createdAt: -1 })

export default mongoose.model("PaymentProof", paymentProofSchema)
