import mongoose from "mongoose"

const reconciliationSchema = new mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reconciliationPeriod: {
      startDate: Date,
      endDate: Date,
    },
    totalExpected: {
      type: Number,
      required: true,
      min: 0,
    },
    totalReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOverdue: {
      type: Number,
      default: 0,
      min: 0,
    },
    discrepancies: [
      {
        description: String,
        amount: Number,
        status: {
          type: String,
          enum: ["REPORTED", "INVESTIGATING", "RESOLVED"],
          default: "REPORTED",
        },
        reportedAt: Date,
        resolvedAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "RECONCILED", "DISPUTED"],
      default: "PENDING",
      index: true,
    },
    reconciliationNotes: String,
    reconciliedBy: mongoose.Schema.Types.ObjectId,
    reconciliedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

reconciliationSchema.index({ status: 1, leaseId: 1 })
reconciliationSchema.index({ tenantId: 1, reconciliedAt: 1 })

export default mongoose.model("PaymentReconciliation", reconciliationSchema)
