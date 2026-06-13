import crypto from "crypto"

// AES-256-GCM Encryption Service
// Encrypts sensitive fields: SSN, bank details, payment methods, phone numbers

const ENCRYPTION_ALGORITHM = "aes-256-gcm"

function deriveEncryptionKey() {
  const masterKey = process.env.ENCRYPTION_KEY
  if (!masterKey) {
    throw new Error("ENCRYPTION_KEY environment variable not set")
  }

  // PBKDF2: 100,000 iterations, SHA256, 32-byte key
  return crypto.pbkdf2Sync(masterKey, "property-management-salt", 100000, 32, "sha256")
}

const ENCRYPTION_KEY = deriveEncryptionKey()

class EncryptionService {
  /**
   * Encrypt sensitive data
   * @param {string} plaintext - Data to encrypt
   * @returns {object} - {iv, authTag, encryptedData} base64 encoded
   */
  static encrypt(plaintext) {
    if (!plaintext) return null

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv)

    let encrypted = cipher.update(String(plaintext), "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    return {
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      encryptedData: encrypted,
    }
  }

  /**
   * Decrypt sensitive data
   * @param {object} encrypted - {iv, authTag, encryptedData}
   * @returns {string} - Decrypted plaintext
   */
  static decrypt(encrypted) {
    if (!encrypted || !encrypted.encryptedData) return null

    const iv = Buffer.from(encrypted.iv, "base64")
    const authTag = Buffer.from(encrypted.authTag, "base64")

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted.encryptedData, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  /**
   * Hash sensitive data one-way (for comparison without decryption)
   * @param {string} plaintext - Data to hash
   * @returns {string} - SHA256 hash
   */
  static hash(plaintext) {
    return crypto.createHash("sha256").update(plaintext).digest("hex")
  }

  /**
   * Verify if plaintext matches hash
   * @param {string} plaintext - Original data
   * @param {string} hash - Hash to verify against
   * @returns {boolean}
   */
  static verifyHash(plaintext, hash) {
    return this.hash(plaintext) === hash
  }
}

export default EncryptionService
