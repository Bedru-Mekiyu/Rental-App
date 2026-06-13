import mongoose from "mongoose"

const dataRetentionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dataType: {
      type: String,
      enum: ["audit_logs", "payment_records", "session_logs", "activity_logs", "support_tickets"],
      required: true,
    },
    retentionDays: {
      type: Number,
      default: 365, // 1 year default
    },
    deleteAfter: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletionReason: String,
    autoDelete: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

dataRetentionSchema.index({ userId: 1, dataType: 1 })
dataRetentionSchema.index({ deleteAfter: 1 })

export default mongoose.model("DataRetention", dataRetentionSchema)
