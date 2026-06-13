import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: mongoose.Schema.Types.Mixed,
    statusCode: Number,
    ipAddress: String,
    userAgent: String,
    correlationId: String,
    details: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false },
)

auditLogSchema.index({ entityType: 1, createdAt: -1 })

auditLogSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model("AuditLog", auditLogSchema)
