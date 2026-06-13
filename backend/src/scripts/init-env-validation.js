// src/scripts/init-env-validation.js (ESM)
// Run at server startup to validate all required environment variables

export function validateEnvironment() {
  const required = ["MONGODB_URI", "JWT_SECRET", "NODE_ENV", "PORT"]

  const optional = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "LOG_LEVEL"]

  const missing = []
  const warnings = []

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  optional.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(`[WARN] Optional env var not set: ${key}`)
    }
  })

  if (missing.length > 0) {
    console.error(`[ERROR] Missing required environment variables: ${missing.join(", ")}`)
    console.error("Cannot start server without these variables")
    process.exit(1)
  }

  warnings.forEach((w) => console.warn(w))

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    console.warn("[WARN] JWT_SECRET is less than 32 characters. Recommend stronger secret.")
  }

  console.log("[OK] Environment validation passed")
}
