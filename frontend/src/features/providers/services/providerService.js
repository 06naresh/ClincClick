import apiClient from "../../../services/apiClient";
const clean = (r) => r.data?.data;
export const providerService = {
  list: async (params = {}) => clean(await apiClient.get("/providers", { params })),
  get: async (id) => clean(await apiClient.get(`/providers/${id}`)),
  create: async (payload) => clean(await apiClient.post("/providers", payload)),
  update: async (id, payload) => clean(await apiClient.patch(`/providers/${id}`, payload)),
  setStatus: async (id, is_active) => clean(await apiClient.patch(`/providers/${id}/status`, null, { params: { is_active } })),
};