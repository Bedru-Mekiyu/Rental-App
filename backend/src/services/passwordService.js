import bcrypt from "bcryptjs"

/**
 * Password Security Service
 * Handles hashing, validation, and complexity checking
 */
class PasswordService {
  // Password requirements
  static REQUIREMENTS = {
    MIN_LENGTH: 12,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
  }

  /**
   * Hash password with bcrypt (10 rounds = ~100ms per hash)
   * @param {string} plainPassword
   * @returns {string} - Hashed password
   */
  static async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(plainPassword, salt)
  }

  /**
   * Compare plain password with hash
   * @param {string} plainPassword
   * @param {string} hashedPassword
   * @returns {boolean}
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword)
  }

  /**
   * Validate password meets complexity requirements
   * @param {string} password
   * @returns {object} - {isValid, errors: []}
   */
  static validatePasswordComplexity(password) {
    const errors = []

    if (password.length < this.REQUIREMENTS.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.REQUIREMENTS.MIN_LENGTH} characters`)
    }

    if (password.length > this.REQUIREMENTS.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.REQUIREMENTS.MAX_LENGTH} characters`)
    }

    if (this.REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }

    if (this.REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }

    if (this.REQUIREMENTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    if (this.REQUIREMENTS.REQUIRE_SPECIAL && !this.REQUIREMENTS.SPECIAL_CHARS.test(password)) {
      errors.push("Password must contain at least one special character: !@#$%^&*()_+-=[]{}';:\"\\|,.<>/?")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Generate secure random password
   * @returns {string} - Random 16-character password
   */
  static generateSecurePassword() {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const special = "!@#$%^&*()_+-=[]{}';:\"\\|,.<>/?!"

    let password = ""
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    const all = uppercase + lowercase + numbers + special
    for (let i = password.length; i < 16; i++) {
      password += all[Math.floor(Math.random() * all.length)]
    }

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")
  }
}

export default PasswordService
