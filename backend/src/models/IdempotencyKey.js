// src/models/IdempotencyKey.js (ESM)
// Prevents duplicate payment processing

import mongoose from "mongoose"

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    result: mongoose.Schema.Types.Mixed, // Store the result
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: { expireAfterSeconds: 0 }, // TTL index
    },
  },
  { timestamps: true },
)

idempotencyKeySchema.index({ key: 1, userId: 1 }, { unique: true })

export default mongoose.model("IdempotencyKey", idempotencyKeySchema)
