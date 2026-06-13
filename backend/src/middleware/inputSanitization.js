import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitize user input to prevent XSS and injection attacks
 * Removes any HTML/script tags from strings
 */
export function sanitizeInputMiddleware() {
  return (req, res, next) => {
    if (req.body) {
      req.body = sanitizeObject(req.body)
    }

    if (req.query) {
      const sanitizedQuery = sanitizeObject(req.query)
      replaceObject(req.query, sanitizedQuery)
    }

    if (req.params) {
      const sanitizedParams = sanitizeObject(req.params)
      replaceObject(req.params, sanitizedParams)
    }

    next()
  }
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item))
  }

  const sanitized = {}
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      // Remove HTML/scripts but preserve text
      sanitized[key] = DOMPurify.sanitize(obj[key], { ALLOWED_TAGS: [] })
    } else if (typeof obj[key] === "object") {
      sanitized[key] = sanitizeObject(obj[key])
    } else {
      sanitized[key] = obj[key]
    }
  }

  return sanitized
}

function replaceObject(target, source) {
  if (!target || typeof target !== "object") {
    return
  }

  Object.keys(target).forEach((key) => {
    delete target[key]
  })

  Object.assign(target, source)
}
