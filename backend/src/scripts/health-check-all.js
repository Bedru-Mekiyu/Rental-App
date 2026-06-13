import "dotenv/config"

const port = process.env.PORT || 5000
const liveUrl = process.env.HEALTH_CHECK_URL || `http://localhost:${port}/health`
const readyUrl = process.env.READY_CHECK_URL || `http://localhost:${port}/ready`
const timeoutMs = Number(process.env.HEALTH_CHECK_TIMEOUT_MS || 5000)

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    const body = await response.text()

    if (!response.ok) {
      return { ok: false, status: response.status, statusText: response.statusText, body }
    }

    return { ok: true, body }
  } catch (error) {
    const message = error?.name === "AbortError" ? `Timeout after ${timeoutMs}ms` : error?.message
    return { ok: false, status: 0, statusText: message, body: "" }
  } finally {
    clearTimeout(timer)
  }
}

async function checkAll() {
  const [live, ready] = await Promise.all([fetchJson(liveUrl), fetchJson(readyUrl)])

  if (!live.ok) {
    console.error(`[HEALTH] ${live.status} ${live.statusText} for ${liveUrl}`)
    if (live.body) {
      console.error(live.body)
    }
  } else {
    console.log(live.body)
  }

  if (!ready.ok) {
    console.error(`[READY] ${ready.status} ${ready.statusText} for ${readyUrl}`)
    if (ready.body) {
      console.error(ready.body)
    }
  } else {
    console.log(ready.body)
  }

  if (!live.ok || !ready.ok) {
    process.exit(1)
  }
}

checkAll()
