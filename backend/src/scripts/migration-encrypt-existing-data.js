import mongoose from "mongoose"
import User from "../models/User-Enhanced.js"
import Payment from "../models/Payment-Enhanced.js"
import EncryptionService from "../services/encryptionService.js"

/**
 * Migration script to encrypt existing plaintext data
 * Run once: node src/scripts/migration-encrypt-existing-data.js
 *
 * IMPORTANT: Always backup database before running!
 */

const DB_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/property-management"

async function migrateEncryption() {
  try {
    console.log("[Migration] Connecting to database...")
    await mongoose.connect(DB_URL)

    console.log("[Migration] Starting data encryption...")

    // Migrate User data
    console.log("[Migration] Encrypting user sensitive data...")
    const users = await User.find({
      $or: [{ ssn_encrypted: { $exists: false } }, { ssn_encrypted: null }],
    })

    for (const user of users) {
      if (user.ssn && !user.ssn_encrypted) {
        user.ssn_encrypted = EncryptionService.encrypt(user.ssn)
        user.ssn = undefined // Remove plaintext
      }
      if (user.bankAccount && !user.bankAccount_encrypted) {
        user.bankAccount_encrypted = EncryptionService.encrypt(user.bankAccount)
        user.bankAccount = undefined
      }
      if (user.phoneNumber && !user.phoneNumber_encrypted) {
        user.phoneNumber_encrypted = EncryptionService.encrypt(user.phoneNumber)
        user.phoneNumber = undefined
      }

      await user.save()
      console.log(`[Migration] Encrypted user: ${user.email}`)
    }

    // Migrate Payment data
    console.log("[Migration] Encrypting payment details...")
    const payments = await Payment.find({
      $or: [{ cardDetails_encrypted: { $exists: false } }, { cardDetails_encrypted: null }],
    })

    for (const payment of payments) {
      if (payment.cardDetails && !payment.cardDetails_encrypted) {
        payment.cardDetails_encrypted = EncryptionService.encrypt(JSON.stringify(payment.cardDetails))
        payment.cardDetails = undefined
      }
      if (payment.bankDetails && !payment.bankDetails_encrypted) {
        payment.bankDetails_encrypted = EncryptionService.encrypt(JSON.stringify(payment.bankDetails))
        payment.bankDetails = undefined
      }

      await payment.save()
      console.log(`[Migration] Encrypted payment: ${payment._id}`)
    }

    console.log("[Migration] Encryption migration completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("[Migration] Error:", error.message)
    process.exit(1)
  }
}

migrateEncryption()
