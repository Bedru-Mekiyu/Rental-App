import "dotenv/config"

const url = process.env.HEALTH_CHECK_URL || `http://localhost:${process.env.PORT || 5000}/health`
const timeoutMs = Number(process.env.HEALTH_CHECK_TIMEOUT_MS || 5000)

async function checkHealth() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    const body = await response.text()

    if (!response.ok) {
      console.error(`[HEALTH] ${response.status} ${response.statusText} for ${url}`)
      console.error(body)
      process.exit(1)
    }

    console.log(body)
  } catch (error) {
    const message = error?.name === "AbortError" ? `Timeout after ${timeoutMs}ms` : error?.message
    console.error(`[HEALTH] Request failed for ${url}: ${message}`)
    process.exit(1)
  } finally {
    clearTimeout(timer)
  }
}

checkHealth()
