import mongoose from "mongoose"

const maintenanceRequestSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit is required"],
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
      index: true,
    },
    estimatedCostEtb: {
      type: Number,
      min: [0, "Estimated cost must be non-negative"],
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    completionNotes: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

maintenanceRequestSchema.index({ unitId: 1, status: 1 })

export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema)
