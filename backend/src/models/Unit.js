// src/models/Unit.js (ESM)

import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    unitNumber: {
      type: String,
      required: true,
      trim: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    floor: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    areaSqm: {
      type: Number,
      required: true,
      min: 1,
    },
    basePriceEtb: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["VACANT", "OCCUPIED", "UNDER_MAINTENANCE"],
      default: "VACANT",
      index: true,
    },
    amenitiesConfig: {
      type: [String],
      default: [],
      index: true,
    },
    viewAttributes: {
      type: [String],
      default: [],
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

unitSchema.index({ unitNumber: 1, propertyId: 1 }, { unique: true });
unitSchema.index({ floor: 1 });
unitSchema.index({ type: 1 });

const Unit = mongoose.model("Unit", unitSchema);

export default Unit;
