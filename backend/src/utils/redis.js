import { createClient } from "redis"

let redisClient = null
let connectingPromise = null

function buildRedisOptions() {
  if (process.env.REDIS_URL) {
    return { url: process.env.REDIS_URL }
  }

  return {
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
    },
    password: process.env.REDIS_PASSWORD,
  }
}

export async function getRedisClient() {
  if (redisClient?.isOpen) {
    return redisClient
  }

  if (!redisClient) {
    redisClient = createClient(buildRedisOptions())
    redisClient.on("error", (err) => {
      console.error("[Redis] Client error:", err.message)
    })
  }

  if (!redisClient.isOpen) {
    if (!connectingPromise) {
      connectingPromise = redisClient.connect()
        .catch((err) => {
          connectingPromise = null
          throw err
        })
    }

    await connectingPromise
  }

  return redisClient
}

export default {
  getRedisClient,
}
