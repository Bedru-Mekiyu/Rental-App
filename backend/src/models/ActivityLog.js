import mongoose from "mongoose"

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "LOGIN",
        "LOGOUT",
        "VIEW",
        "CREATE",
        "UPDATE",
        "DELETE",
        "EXPORT",
        "PAYMENT_VERIFY",
        "LEASE_SIGN",
        "DISPUTE_CREATE",
        "DOWNLOAD",
        "EXPORT_DATA",
        "DELETE_ACCOUNT",
      ],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["USER", "PAYMENT", "LEASE", "PROPERTY", "UNIT", "DISPUTE", "ACCOUNT"],
      required: true,
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    device: {
      type: String,
      enum: ["DESKTOP", "MOBILE", "TABLET"],
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        type: { type: String, enum: ["Point"] },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILURE", "PENDING"],
      default: "SUCCESS",
    },
    errorMessage: String,
    sessionId: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    duration: Number, // milliseconds
    isAnonymous: Boolean,
  },
  { timestamps: false },
)

activityLogSchema.index({ userId: 1, timestamp: -1 })
activityLogSchema.index({ resourceType: 1, resourceId: 1 })
activityLogSchema.index({ action: 1 })
activityLogSchema.index({ timestamp: 1 })
activityLogSchema.index({ "location.coordinates": "2dsphere" })

export default mongoose.model("ActivityLog", activityLogSchema)
