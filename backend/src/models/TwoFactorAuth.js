import mongoose from "mongoose"

const twoFactorAuthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totpSecret: String, // Encrypted TOTP secret
    totpEnabled: {
      type: Boolean,
      default: false,
    },
    emailOtpEnabled: {
      type: Boolean,
      default: true, // Default to email 2FA
    },
    backupCodes: [String], // Encrypted backup codes
    usedBackupCodes: [String],
    emailOtpCode: String, // Hashed OTP
    emailOtpExpiresAt: Date,
    lastVerifiedAt: Date,
    verifyAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: Date, // Lock account after 5 failed attempts
  },
  { timestamps: true },
)

// Index for cleanup of expired OTPs
twoFactorAuthSchema.index({ emailOtpExpiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model("TwoFactorAuth", twoFactorAuthSchema)
