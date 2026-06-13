import mongoose from "mongoose"

const ipWhitelistSchema = new mongoose.Schema(
  {
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
    },
    ip: {
      type: String,
      required: true,
      validate: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, // IPv4 or CIDR
    },
    description: String,
    status: {
      type: String,
      enum: ["active", "blocked", "testing"],
      default: "active",
    },
    lastVerified: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

ipWhitelistSchema.index({ apiKeyId: 1 })
ipWhitelistSchema.index({ ip: 1 })

export default mongoose.model("IpWhitelist", ipWhitelistSchema)
