import apiClient from "../../../services/apiClient";
const clean = (r) => r.data?.data;
export const availabilityService = {
  list: async (params = {}) => clean(await apiClient.get("/availability", { params })),
  get: async (id) => clean(await apiClient.get(`/availability/${id}`)),
  create: async (payload) => clean(await apiClient.post("/availability", payload)),
  update: async (id, payload) => clean(await apiClient.patch(`/availability/${id}`, payload)),
  setStatus: async (id, is_active) => clean(await apiClient.patch(`/availability/${id}/status`, null, { params: { is_active } })),
};