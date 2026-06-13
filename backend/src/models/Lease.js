// src/models/Lease.js (ESM) - Enhanced with constraints

import mongoose from "mongoose"

const leaseSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit is required"],
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant is required"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator(v) {
          return v > this.startDate
        },
        message: "End date must be after start date",
      },
    },
    monthlyRentEtb: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: [1, "Monthly rent must be positive"],
      max: [999999999, "Monthly rent too large"],
    },
    securityDepositEtb: {
      type: Number,
      default: 0,
      min: [0, "Security deposit cannot be negative"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "TERMINATED", "PENDING"],
      default: "PENDING",
    },
    terminatedAt: Date,
    terminatedBy: mongoose.Schema.Types.ObjectId,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

leaseSchema.index(
  { unitId: 1, status: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { status: "ACTIVE", isDeleted: false },
  },
)

export default mongoose.model("Lease", leaseSchema)
