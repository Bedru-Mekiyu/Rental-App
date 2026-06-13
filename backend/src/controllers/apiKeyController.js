import ApiKey from "../models/ApiKey.js"
import { generateApiKey } from "../services/apiKeyService.js"
import { logAction } from "../services/logActionService.js"

const ADMIN_ROLES = new Set(["ADMIN", "FS"])

export async function createApiKey(req, res) {
  try {
    const userId = req.user._id
    const {
      name,
      allowedIps,
      allowedEndpoints,
      expiresAt,
      permissions,
      scopes,
      rateLimit,
    } = req.body

    const result = await generateApiKey(userId, {
      name,
      allowedIps,
      allowedEndpoints,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      permissions,
      scopes,
      rateLimit,
    })

    await logAction({
      userId,
      action: "API_KEY_CREATED",
      entityType: "ApiKey",
      entityId: result.id,
      details: {
        name: name || "API Key",
        expiresAt: expiresAt || null,
        rateLimit: rateLimit || null,
      },
    })

    return res.status(201).json({
      success: true,
      message: "API key created",
      data: result,
    })
  } catch (err) {
    console.error("[ApiKey] Create error:", err.message)
    return res.status(500).json({ message: "Failed to create API key" })
  }
}

export async function listApiKeys(req, res) {
  try {
    const { page = 1, limit = 20, userId } = req.query
    const role = req.user.role

    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20

    const query = { isDeleted: false }
    if (ADMIN_ROLES.has(role) && userId) {
      query.userId = userId
    } else {
      query.userId = req.user._id
    }

    const skip = (pageNumber - 1) * limitNumber

    const keys = await ApiKey.find(query)
      .select("-keyHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)

    const total = await ApiKey.countDocuments(query)

    return res.status(200).json({
      success: true,
      data: keys,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
      },
    })
  } catch (err) {
    console.error("[ApiKey] List error:", err.message)
    return res.status(500).json({ message: "Failed to list API keys" })
  }
}

export async function revokeApiKey(req, res) {
  try {
    const { id } = req.params
    const role = req.user.role

    const query = { _id: id, isDeleted: false }
    if (!ADMIN_ROLES.has(role)) {
      query.userId = req.user._id
    }

    const apiKey = await ApiKey.findOne(query)
    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" })
    }

    if (!apiKey.isActive) {
      return res.status(400).json({ message: "API key already revoked" })
    }

    apiKey.isActive = false
    apiKey.isDeleted = true
    apiKey.expiresAt = apiKey.expiresAt || new Date()
    await apiKey.save()

    await logAction({
      userId: req.user._id,
      action: "API_KEY_REVOKED",
      entityType: "ApiKey",
      entityId: apiKey._id,
      details: { name: apiKey.name },
    })

    return res.status(200).json({
      success: true,
      message: "API key revoked",
    })
  } catch (err) {
    console.error("[ApiKey] Revoke error:", err.message)
    return res.status(500).json({ message: "Failed to revoke API key" })
  }
}
