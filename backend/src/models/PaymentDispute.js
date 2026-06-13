import mongoose from "mongoose"

const disputeSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["DUPLICATE_CHARGE", "INCORRECT_AMOUNT", "UNAUTHORIZED", "TECHNICAL_ERROR", "OTHER"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    evidence: [
      {
        type: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED", "REFUNDED"],
      default: "OPEN",
      index: true,
    },
    assignedTo: mongoose.Schema.Types.ObjectId,
    resolutionNotes: String,
    resolutionAction: {
      type: String,
      enum: ["REFUND", "CREDIT", "REVERSAL", "NO_ACTION"],
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    resolvedAt: Date,
    resolvedBy: mongoose.Schema.Types.ObjectId,
    communicationHistory: [
      {
        author: mongoose.Schema.Types.ObjectId,
        message: String,
        timestamp: Date,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

disputeSchema.index({ status: 1, createdAt: -1 })
disputeSchema.index({ tenantId: 1, status: 1 })

export default mongoose.model("PaymentDispute", disputeSchema)
