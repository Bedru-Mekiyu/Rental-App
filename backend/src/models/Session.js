import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      deviceFingerprint: String,
    },
    accessTokenExpiry: Date,
    refreshTokenExpiry: Date,
    refreshTokenHash: {
      type: String,
      index: true,
    },
    previousRefreshTokenHashes: {
      type: [String],
      default: [],
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: Date, // Null unless session is revoked
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
)

// Auto-delete revoked sessions after 7 days
sessionSchema.index({ revokedAt: 1 }, { expireAfterSeconds: 604800 })

// Keep only 5 most recent sessions per user
sessionSchema.post("save", async (doc) => {
  const userSessions = await mongoose
    .model("Session")
    .find({ userId: doc.userId, isActive: true })
    .sort({ createdAt: -1 })

  if (userSessions.length > 5) {
    const sessionsToRevoke = userSessions.slice(5)
    await mongoose.model("Session").updateMany(
      { _id: { $in: sessionsToRevoke.map((s) => s._id) } },
      { isActive: false, revokedAt: new Date(), refreshTokenHash: null },
    )
  }
})

export default mongoose.model("Session", sessionSchema)
