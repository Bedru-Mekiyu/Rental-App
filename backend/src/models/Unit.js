// src/models/Unit.js (ESM) - Enhanced with status constraints

import mongoose from "mongoose"

const unitSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
      index: true,
    },
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
    },
    floor: {
      type: Number,
      min: [0, "Floor cannot be negative"],
    },
    bedrooms: {
      type: Number,
      required: [true, "Bedrooms is required"],
      min: [0, "Bedrooms cannot be negative"],
      max: [10, "Bedrooms seems invalid"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Bathrooms is required"],
      min: [0, "Bathrooms cannot be negative"],
      max: [10, "Bathrooms seems invalid"],
    },
    squareMeters: {
      type: Number,
      required: [true, "Square meters is required"],
      min: [1, "Square meters must be positive"],
    },
    monthlyRentEtb: {
      type: Number,
      required: [true, "Rent is required"],
      min: [1, "Rent must be positive"],
    },
    status: {
      type: String,
      enum: ["VACANT", "OCCUPIED", "MAINTENANCE", "UNAVAILABLE"],
      default: "VACANT",
    },
    currentTenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

unitSchema.index(
  { propertyId: 1, unitNumber: 1 },
  { unique: true, sparse: true, partialFilterExpression: { isDeleted: false } },
)

export default mongoose.model("Unit", unitSchema)
