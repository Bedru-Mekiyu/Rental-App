import { validateApiKey } from "../services/apiKeyService.js"
import { auth } from "./auth-advanced.js"

export const apiKeyMiddleware = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "")

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" })
  }

  const validation = await validateApiKey(apiKey, req.ip, req.path)

  if (!validation.valid) {
    return res.status(403).json({ error: validation.error })
  }

  if (req.user) {
    return res.status(409).json({ error: "Multiple authentication methods not allowed" })
  }

  req.user = validation.user
  req.apiKeyPermissions = validation.permissions
  req.apiKeyScopes = validation.scopes
  next()
}

// Check specific permission
export const requireApiKeyPermission = (resource, action) => {
  return (req, res, next) => {
    const hasPermission = req.apiKeyPermissions?.some((p) => p.resource === resource && p.actions.includes(action))

    if (!hasPermission) {
      return res.status(403).json({ error: `Permission denied for ${resource}:${action}` })
    }

    next()
  }
}

export const authOrApiKey = (roles = [], permission = null) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"] || ""
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
    const hasApiKey = Boolean(req.headers["x-api-key"] || bearerToken.startsWith("sk_"))

    if (hasApiKey) {
      return apiKeyMiddleware(req, res, (err) => {
        if (err) {
          return next(err)
        }

        if (permission) {
          return requireApiKeyPermission(permission.resource, permission.action)(req, res, next)
        }

        return next()
      })
    }

    return auth(roles)(req, res, next)
  }
}

export default {
  apiKeyMiddleware,
  requireApiKeyPermission,
  authOrApiKey,
}
