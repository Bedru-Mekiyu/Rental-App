import DOMPurify from "dompurify"

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

// Sanitize user input for safe database storage
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input

  // Remove potentially dangerous characters
  return input
    .replace(/[<>"'`]/g, "")
    .trim()
    .substring(0, 500) // Limit length
}

// Validate email format
export const sanitizeEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? email.toLowerCase() : null
}

// Validate phone format for Ethiopia
export const sanitizePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, "")
  // Ethiopia phone format: +251 or 0 followed by 9 digits
  return /^(\+251|0)[0-9]{9}$/.test(cleaned) ? cleaned : null
}

// Escape special characters for safe display
export const escapeHtml = (text) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
