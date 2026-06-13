import crypto from "crypto"
import Session from "../models/Session.js"

/**
 * Session Management Service
 * Handles session timeouts, refresh tokens, and device management
 */
class SessionService {
  // Session configuration
  static CONFIG = {
    ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
    SESSION_IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
    MAX_SESSIONS_PER_USER: 5, // Max concurrent sessions
  }

  static getRefreshTokenSecret() {
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    if (!secret) {
      throw new Error("REFRESH_TOKEN_SECRET not configured")
    }
    return secret
  }

  static normalizeIpAddress(value) {
    if (!value || typeof value !== "string") {
      return null
    }

    const first = value.split(",")[0]?.trim()
    if (!first) {
      return null
    }

    return first.startsWith("::ffff:") ? first.slice(7) : first
  }

  static normalizeDeviceInfo(deviceInfo = {}) {
    const userAgent = typeof deviceInfo.userAgent === "string" ? deviceInfo.userAgent.slice(0, 512) : null
    const ipAddress = this.normalizeIpAddress(deviceInfo.ipAddress)

    return {
      ...deviceInfo,
      userAgent,
      ipAddress,
    }
  }

  static hashRefreshToken(refreshToken) {
    return crypto.createHmac("sha256", this.getRefreshTokenSecret()).update(refreshToken).digest("hex")
  }

  static generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex")
  }

  /**
   * Create new session
   * @param {string} userId - User ID
   * @param {string} deviceInfo - Device fingerprint
   * @returns {object} - {sessionId, accessToken, refreshToken, expiresAt}
   */
  static async createSession(userId, deviceInfo) {
    const sessionId = crypto.randomBytes(32).toString("hex")
    const accessTokenExpiry = new Date(Date.now() + this.CONFIG.ACCESS_TOKEN_EXPIRY)
    const refreshTokenExpiry = new Date(Date.now() + this.CONFIG.REFRESH_TOKEN_EXPIRY)
    const refreshToken = this.generateRefreshToken()
    const refreshTokenHash = this.hashRefreshToken(refreshToken)

    await Session.create({
      userId,
      sessionId,
      deviceInfo: this.normalizeDeviceInfo(deviceInfo),
      accessTokenExpiry,
      refreshTokenExpiry,
      refreshTokenHash,
      previousRefreshTokenHashes: [],
      lastActivityAt: new Date(),
      revokedAt: null,
      isActive: true,
    })

    await this.enforceMaxSessions(userId)

    return {
      sessionId,
      accessTokenExpiry,
      refreshTokenExpiry,
      refreshToken,
    }
  }

  static async rotateRefreshToken(refreshToken, deviceInfo = {}) {
    const refreshTokenHash = this.hashRefreshToken(refreshToken)
    const session = await Session.findOne({ refreshTokenHash, isActive: true, revokedAt: null })

    if (!session) {
      const reuseSession = await Session.findOne({ previousRefreshTokenHashes: refreshTokenHash })
      if (reuseSession) {
        await Session.findByIdAndUpdate(reuseSession._id, {
          isActive: false,
          revokedAt: new Date(),
          refreshTokenHash: null,
          previousRefreshTokenHashes: [],
        })
        return { reuseDetected: true, session: reuseSession }
      }

      return null
    }

    if (new Date() > new Date(session.refreshTokenExpiry)) {
      await Session.findByIdAndUpdate(session._id, {
        isActive: false,
        revokedAt: new Date(),
        refreshTokenHash: null,
        previousRefreshTokenHashes: [],
      })
      return { revoked: true, reason: "REFRESH_EXPIRED", session }
    }

    const normalizedDeviceInfo = this.normalizeDeviceInfo(deviceInfo)

    if (
      session.deviceInfo?.userAgent &&
      normalizedDeviceInfo.userAgent &&
      session.deviceInfo.userAgent !== normalizedDeviceInfo.userAgent
    ) {
      await Session.findByIdAndUpdate(session._id, {
        isActive: false,
        revokedAt: new Date(),
        refreshTokenHash: null,
        previousRefreshTokenHashes: [],
      })
      return { revoked: true, reason: "USER_AGENT_MISMATCH", session }
    }

    const storedIp = this.normalizeIpAddress(session.deviceInfo?.ipAddress)
    const requestIp = this.normalizeIpAddress(normalizedDeviceInfo.ipAddress)
    if (storedIp && requestIp && storedIp !== requestIp) {
      await Session.findByIdAndUpdate(session._id, {
        isActive: false,
        revokedAt: new Date(),
        refreshTokenHash: null,
        previousRefreshTokenHashes: [],
      })
      return { revoked: true, reason: "IP_MISMATCH", session }
    }

    const newRefreshToken = this.generateRefreshToken()
    const newRefreshTokenHash = this.hashRefreshToken(newRefreshToken)
    const newRefreshTokenExpiry = new Date(Date.now() + this.CONFIG.REFRESH_TOKEN_EXPIRY)
    const previousHashes = [session.refreshTokenHash, ...(session.previousRefreshTokenHashes || [])]
      .filter(Boolean)
      .slice(0, 5)

    await Session.findByIdAndUpdate(session._id, {
      refreshTokenHash: newRefreshTokenHash,
      previousRefreshTokenHashes: previousHashes,
      refreshTokenExpiry: newRefreshTokenExpiry,
      lastActivityAt: new Date(),
    })

    return {
      session,
      refreshToken: newRefreshToken,
      refreshTokenExpiry: newRefreshTokenExpiry,
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken
   * @returns {object} - {accessToken, newAccessTokenExpiry}
   */
  static async refreshAccessToken(refreshToken) {
    // Verify refresh token is valid and not expired
    // Create new access token
    const newAccessTokenExpiry = new Date(Date.now() + this.CONFIG.ACCESS_TOKEN_EXPIRY)

    return {
      newAccessTokenExpiry,
    }
  }

  /**
   * Invalidate session (logout)
   * @param {string} sessionId
   */
  static async invalidateSession(sessionId) {
    await Session.findOneAndUpdate(
      { sessionId, isActive: true },
      { isActive: false, revokedAt: new Date(), refreshTokenHash: null },
    )
  }

  /**
   * Invalidate all sessions for a user (password change, etc.)
   * @param {string} userId
   */
  static async invalidateAllUserSessions(userId) {
    await Session.updateMany(
      { userId, isActive: true },
      { isActive: false, revokedAt: new Date(), refreshTokenHash: null },
    )
  }

  static async enforceMaxSessions(userId) {
    const sessions = await Session.find({ userId, isActive: true }).sort({ createdAt: -1 })
    if (sessions.length <= this.CONFIG.MAX_SESSIONS_PER_USER) {
      return
    }

    const sessionsToRevoke = sessions.slice(this.CONFIG.MAX_SESSIONS_PER_USER)
    await Session.updateMany(
      { _id: { $in: sessionsToRevoke.map((s) => s._id) } },
      { isActive: false, revokedAt: new Date(), refreshTokenHash: null },
    )
  }

  /**
   * Check session inactivity
   * @param {Date} lastActivityAt
   * @returns {boolean} - true if expired
   */
  static isSessionExpiredByInactivity(lastActivityAt) {
    const inactiveTime = Date.now() - new Date(lastActivityAt).getTime()
    return inactiveTime > this.CONFIG.SESSION_IDLE_TIMEOUT
  }

  /**
   * Update last activity timestamp
   * @param {string} sessionId
   */
  static async updateSessionActivity(sessionId) {
    await Session.findOneAndUpdate({ sessionId, isActive: true }, { lastActivityAt: new Date() })
  }
}

export default SessionService
