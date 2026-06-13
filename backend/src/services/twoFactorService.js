import speakeasy from "speakeasy"
import QRCode from "qrcode"
import { sendEmail } from "./emailService.js"
import crypto from "crypto"

/**
 * Two-Factor Authentication Service
 * Supports TOTP (Time-based OTP) and Email OTP
 */
class TwoFactorService {
  /**
   * Generate TOTP secret for QR code setup
   * @param {string} userEmail - User's email
   * @returns {object} - {secret, qrCode, backupCodes}
   */
  static async generateTOTPSecret(userEmail) {
    const secret = speakeasy.generateSecret({
      name: `Property Manager (${userEmail})`,
      issuer: "PropertyManagement",
      length: 32,
    })

    const qrCode = await QRCode.toDataURL(secret.otpauth_url)

    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () => speakeasy.generateSecret({ length: 8 }).base32)

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
      otpauthUrl: secret.otpauth_url,
    }
  }

  /**
   * Verify TOTP token
   * @param {string} secret - User's TOTP secret
   * @param {string} token - 6-digit code from authenticator
   * @returns {boolean}
   */
  static verifyTOTPToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2, // Allow ±2 time steps
    })
  }

  /**
   * Generate and send Email OTP
   * @param {string} email - Recipient email
   * @param {string} userId - User ID for tracking
   * @returns {object} - {code, expiresAt}
   */
  static async generateEmailOTP(email, userId) {
    const code = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await sendEmail({
      to: email,
      subject: "Your Two-Factor Authentication Code",
      template: "2fa-email-otp",
      data: {
        code,
        expiresAt: expiresAt.toLocaleTimeString(),
        userName: userId,
      },
    })

    return {
      code,
      expiresAt,
      codeHash: this._hashOTP(code),
    }
  }

  /**
   * Verify Email OTP
   * @param {string} plainCode - Code entered by user
   * @param {string} hashedCode - Stored hash
   * @param {Date} expiresAt - Expiration time
   * @returns {boolean}
   */
  static verifyEmailOTP(plainCode, hashedCode, expiresAt) {
    if (new Date() > expiresAt) return false
    return this._hashOTP(plainCode) === hashedCode
  }

  /**
   * Hash OTP for secure storage
   * @private
   */
  static _hashOTP(code) {
    return crypto.createHash("sha256").update(code).digest("hex")
  }

  /**
   * Verify backup code and mark as used
   * @param {string} backupCode - Code to verify
   * @param {array} usedBackupCodes - Array of used codes
   * @returns {boolean}
   */
  static verifyBackupCode(backupCode, usedBackupCodes = []) {
    return !usedBackupCodes.includes(backupCode)
  }
}

export default TwoFactorService
