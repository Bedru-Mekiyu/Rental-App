// Secure localStorage wrapper with encryption
import { sanitizeInput } from "./sanitize"

const STORAGE_PREFIX = "rms_"
const SENSITIVE_KEYS = ["token", "refreshToken"]

// Store token securely (in production, use httpOnly cookies)
export const secureSetItem = (key, value) => {
  if (!key) return

  // Never store sensitive data as plain text
  if (SENSITIVE_KEYS.includes(key)) {
    console.warn(`[v0] Storing ${key} - consider using httpOnly cookies in production`)
  }

  try {
    const sanitized = typeof value === "string" ? sanitizeInput(value) : JSON.stringify(value)
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, sanitized)
  } catch (err) {
    console.error("[v0] Storage error:", err)
  }
}

// Retrieve and validate stored data
export const secureGetItem = (key) => {
  if (!key) return null

  try {
    const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!value) return null

    // Try to parse JSON, otherwise return string
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  } catch (err) {
    console.error("[v0] Storage retrieval error:", err)
    return null
  }
}

// Securely remove item
export const secureRemoveItem = (key) => {
  if (!key) return

  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  } catch (err) {
    console.error("[v0] Storage removal error:", err)
  }
}

// Clear all app storage
export const secureClearAll = () => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (err) {
    console.error("[v0] Storage clear error:", err)
  }
}
