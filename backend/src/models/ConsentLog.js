import mongoose from "mongoose"

const consentLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    consentType: {
      type: String,
      enum: ["privacy_policy", "marketing", "analytics", "cookies", "data_processing"],
      required: true,
    },
    version: String, // Version of the policy agreed to
    ipAddress: String,
    userAgent: String,
    consentGiven: Boolean,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    revokedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true },
)

consentLogSchema.index({ userId: 1, consentType: 1 })

export default mongoose.model("ConsentLog", consentLogSchema)
