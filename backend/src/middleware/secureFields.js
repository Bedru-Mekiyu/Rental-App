import EncryptionService from "../services/encryptionService.js"

/**
 * Middleware to automatically encrypt/decrypt sensitive fields
 * Usage: app.use(secureFields())
 */
export function secureFieldsMiddleware() {
  return (req, res, next) => {
    // Store encryption/decryption functions on res.locals for use in controllers
    res.locals.encryptSensitive = (data, fields) => {
      const encrypted = { ...data }
      fields.forEach((field) => {
        if (encrypted[field]) {
          encrypted[`${field}_encrypted`] = EncryptionService.encrypt(encrypted[field])
          delete encrypted[field] // Remove plaintext from memory
        }
      })
      return encrypted
    }

    res.locals.decryptSensitive = (data, fields) => {
      const decrypted = { ...data }
      fields.forEach((field) => {
        if (decrypted[`${field}_encrypted`]) {
          decrypted[field] = EncryptionService.decrypt(decrypted[`${field}_encrypted`])
          delete decrypted[`${field}_encrypted`] // Store only plaintext in response
        }
      })
      return decrypted
    }

    next()
  }
}
