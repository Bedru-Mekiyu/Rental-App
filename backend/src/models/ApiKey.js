import mongoose from "mongoose"

const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
    },
    prefix: {
      type: String,
      required: true, // e.g., "sk_live_", "sk_test_"
    },
    lastUsed: Date,
    usageCount: {
      type: Number,
      default: 0,
    },
    rateLimit: {
      requests: { type: Number, default: 1000 },
      period: { type: String, default: "hour" }, // hour, day, month
    },
    allowedIps: [String], // Whitelist specific IPs
    allowedEndpoints: [String], // Restrict to specific endpoints
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: [
      {
        resource: String, // "payments", "leases", "users", etc.
        actions: [String], // ["read", "write", "delete"]
      },
    ],
    scopes: [String], // OAuth-style scopes
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Index for fast lookups
apiKeySchema.index({ userId: 1, isActive: 1, isDeleted: 1 })
apiKeySchema.index({ expiresAt: 1 })

export default mongoose.model("ApiKey", apiKeySchema)
