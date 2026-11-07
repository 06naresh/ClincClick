// Centralized Axios client.
//
// - Reads base URL from VITE_API_BASE_URL.
// - Uses credentialed requests so the refresh-token cookie flows back.
// - Attaches the in-memory access token.
// - On 401, attempts exactly one refresh (single-flight) and retries the
//   original request; otherwise redirects to /login.

import axios from "axios"

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null

export function setAccessToken(token) {
  accessToken = token || null
  apiClient.defaults.headers.common.Authorization = token ? `Bearer ${token}` : undefined
}

export function clearAccessToken() {
  setAccessToken(null)
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

async function refreshAccessToken() {
  // Like httpx promise chaining in Python — share one in-flight refresh.
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    )
    const token = response.data?.data?.access_token
    if (!token) throw new Error("No access token in refresh response")
    setAccessToken(token)
    return token
  })()
  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {}
    if (error.response?.status === 401 && !original._retry) {
      // Don't try to refresh the refresh endpoint itself or login/register
      const url = original.url || ""
      if (!url.includes("/auth/refresh") && !url.includes("/auth/login")) {
        original._retry = true
        try {
          await refreshAccessToken()
          return apiClient(original)
        } catch (refreshError) {
          clearAccessToken()
          window.location.href = "/login"
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
