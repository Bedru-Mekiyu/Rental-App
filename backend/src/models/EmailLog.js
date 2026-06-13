import mongoose from "mongoose"

const emailLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    subject: String,
    templateType: {
      type: String,
      enum: [
        "PAYMENT_VERIFICATION",
        "LEASE_EXPIRATION",
        "OVERDUE_PAYMENT",
        "PAYMENT_RECEIPT",
        "MAINTENANCE_ASSIGNED",
        "GENERIC",
      ],
      index: true,
    },
    status: {
      type: String,
      enum: ["SENT", "FAILED", "PENDING"],
      default: "PENDING",
      index: true,
    },
    messageId: String,
    error: String,
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Auto-cleanup old logs (keep 30 days)
emailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

export default mongoose.model("EmailLog", emailLogSchema)
