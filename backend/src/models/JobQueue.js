import mongoose from "mongoose"

const jobQueueSchema = new mongoose.Schema(
  {
    jobType: {
      type: String,
      enum: [
        "DETECT_OVERDUE_PAYMENTS",
        "LEASE_EXPIRATION_WARNING",
        "PAYMENT_VERIFICATION_ALERT",
        "GENERATE_FINANCIAL_REPORT",
        "SEND_PAYMENT_RECEIPT",
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    result: mongoose.Schema.Types.Mixed,
    errorMessage: String,
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    nextRetryAt: Date,
    executedAt: Date,
    completedAt: Date,
  },
  { timestamps: true },
)

// Index for finding pending jobs
jobQueueSchema.index({ status: 1, nextRetryAt: 1 })

export default mongoose.model("JobQueue", jobQueueSchema)
