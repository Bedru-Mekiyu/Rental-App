import mongoose from "mongoose"

const scheduleSchema = new mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
      unique: true,
    },
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUALLY"],
      default: "MONTHLY",
    },
    billingDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },
    nextBillingDate: {
      type: Date,
      required: true,
      index: true,
    },
    lastInvoiceDate: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    suspendedAt: Date,
    suspensionReason: String,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model("PaymentSchedule", scheduleSchema)
