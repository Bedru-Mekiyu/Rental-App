import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor - handle token refresh & errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: localStorage.getItem("refreshToken"),
        })
        const { token } = refreshResponse.data
        localStorage.setItem("authToken", token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      } catch {
        localStorage.removeItem("authToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
      }
    }

    // Handle rate limiting with backoff
    if (error.response?.status === 429) {
      const retryAfter = Number.parseInt(error.response.headers["retry-after"] || "1")
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
      return apiClient(originalRequest)
    }

    return Promise.reject(error)
  },
)

export default apiClient
