// src/models/Unit.js
const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    unitNumber: {
      type: String,
      required: true,
      trim: true,
    },
    propertyId: {
      type: String, // later you can change to ObjectId if you add Property model
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    type: {
      type: String, // e.g. "STUDIO", "1BR"
      required: true,
    },
    areaSqm: {
      type: Number,
      required: true,
    },
    basePriceEtb: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['VACANT', 'OCCUPIED', 'UNDER_MAINTENANCE'],
      default: 'VACANT',
    },
    amenitiesConfig: {
      type: [String],
      default: [],
    },
    viewAttributes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

unitSchema.index({ unitNumber: 1, propertyId: 1 }, { unique: true });
unitSchema.index({ status: 1 });
unitSchema.index({ status: 1, floor: 1 });

module.exports = mongoose.model('Unit', unitSchema);
