import mongoose from "mongoose"
import EncryptionService from "../services/encryptionService.js"

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "PM", "GM", "FS", "TENANT"],
      default: "TENANT",
      index: true,
    },
    password: {
      type: String,
      required: true,
    },

    ssn_encrypted: {
      iv: String,
      authTag: String,
      encryptedData: String,
    },
    bankAccount_encrypted: {
      iv: String,
      authTag: String,
      encryptedData: String,
    },
    bankRoutingNumber_encrypted: {
      iv: String,
      authTag: String,
      encryptedData: String,
    },
    phoneNumber_encrypted: {
      iv: String,
      authTag: String,
      encryptedData: String,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },

    // Password management
    passwordChangedAt: Date,
    passwordExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
    forcePasswordChangeOnLogin: {
      type: Boolean,
      default: false, // Set to true for new users
    },

    // Account security
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastLoginAt: Date,
    accountLockedUntil: Date, // Lock after failed login attempts
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    notificationPreferences: {
      paymentAlerts: {
        type: Boolean,
        default: true,
      },
      leaseAlerts: {
        type: Boolean,
        default: true,
      },
      maintenanceAlerts: {
        type: Boolean,
        default: true,
      },
    },

    // Audit fields
    createdBy: mongoose.Schema.Types.ObjectId,
    lastModifiedBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
)

userSchema.query.withoutEncrypted = function () {
  return this.select("-ssn_encrypted -bankAccount_encrypted -bankRoutingNumber_encrypted -phoneNumber_encrypted")
}

userSchema.pre("validate", function (next) {
  if (!this.name) {
    const fromParts = [this.firstName, this.lastName].filter(Boolean).join(" ")
    this.name = this.fullName || fromParts || this.email
  }
  next()
})

userSchema.methods.getDecryptedData = function () {
  return {
    ssn: this.ssn_encrypted ? EncryptionService.decrypt(this.ssn_encrypted) : null,
    bankAccount: this.bankAccount_encrypted ? EncryptionService.decrypt(this.bankAccount_encrypted) : null,
    bankRoutingNumber: this.bankRoutingNumber_encrypted
      ? EncryptionService.decrypt(this.bankRoutingNumber_encrypted)
      : null,
    phoneNumber: this.phoneNumber_encrypted ? EncryptionService.decrypt(this.phoneNumber_encrypted) : null,
  }
}

export default mongoose.model("User", userSchema)
