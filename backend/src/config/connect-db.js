import mongoose from "mongoose"

let listenersAttached = false

function attachConnectionListeners() {
  if (listenersAttached) {
    return
  }

  mongoose.connection.on("connected", () => {
    console.log("[DB] MongoDB connected")
  })

  mongoose.connection.on("disconnected", () => {
    console.warn("[DB] MongoDB disconnected")
  })

  mongoose.connection.on("error", (error) => {
    console.error("[DB] MongoDB connection error:", error.message)
  })

  listenersAttached = true
}

function getMongoOptions() {
  return {
    autoIndex: process.env.MONGODB_AUTO_INDEX !== "false",
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 0),
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set")
  }

  mongoose.set("strictQuery", true)
  attachConnectionListeners()

  const retries = Number(process.env.MONGODB_CONNECT_RETRIES || 3)
  const baseDelayMs = Number(process.env.MONGODB_CONNECT_RETRY_DELAY_MS || 2000)

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, getMongoOptions())
      return
    } catch (error) {
      if (attempt === retries) {
        throw error
      }

      const delayMs = baseDelayMs * 2 ** (attempt - 1)
      console.warn(
        `[DB] MongoDB connect attempt ${attempt} failed: ${error.message}. Retrying in ${delayMs}ms...`,
      )
      await delay(delayMs)
    }
  }
}
