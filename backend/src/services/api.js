import axios from "axios"

const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:5000/api"
const API_TIMEOUT = Number.parseInt(process.env.VITE_API_TIMEOUT || "10000")

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
})

// Generate correlation ID for request tracking
const generateCorrelationId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Request interceptor: add token and correlation ID
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  // Add authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Add correlation ID for request tracking
  config.headers["X-Correlation-Id"] = generateCorrelationId()

  // Add CSRF token if available
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken
  }

  return config
})

// Response interceptor: handle errors and token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          const { token } = res.data
          localStorage.setItem("token", token)
          originalRequest.headers.Authorization = `Bearer ${token}`
          return API(originalRequest)
        }
      } catch {
        // Token refresh failed, logout user
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }

    // Handle 429 (too many requests)
    if (error.response?.status === 429) {
      console.error("[v0] Rate limited - waiting before retry")
      // Don't retry rate limit errors - let user handle
    }

    if (!error.response) {
      error.message = "Network error - please check your connection"
    }

    return Promise.reject(error)
  },
)

export default API
