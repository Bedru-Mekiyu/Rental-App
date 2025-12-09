// src/models/Lease.js
const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    monthlyRentEtb: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 0, // e.g. 0.15 for 15%
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'ENDED'],
      default: 'PENDING',
    },
    digitalSignatureMeta: {
      signatureHash: String,
      signedAt: Date,
      method: String,
    },
    leasePdfUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

leaseSchema.index({ unitId: 1 });
leaseSchema.index({ tenantId: 1, status: 1 });
leaseSchema.index({ endDate: 1 });

module.exports = mongoose.model('Lease', leaseSchema);
