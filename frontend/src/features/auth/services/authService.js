// Authentication API module — feature-scoped (md_files/architecture.md §7).

import apiClient from "../../../services/apiClient";

export const authService = {
  register: async (data) => {
    const response = await apiClient.post("/auth/register", data)
    return response.data
  },

  login: async ({ email, password }) => {
    const response = await apiClient.post("/auth/login", { email, password })
    return response.data.data
  },

  refresh: async () => {
    const response = await apiClient.post("/auth/refresh")
    return response.data.data.access_token
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout")
    return response.data
  },

  me: async () => {
    const response = await apiClient.get("/auth/me")
    return response.data.data
  },
}
