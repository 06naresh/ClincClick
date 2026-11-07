import apiClient from "../../../services/apiClient";
const clean = (r) => r.data?.data;
export const serviceService = {
  list: async (params = {}) => clean(await apiClient.get("/services", { params })),
  get: async (id) => clean(await apiClient.get(`/services/${id}`)),
  create: async (payload) => clean(await apiClient.post("/services", payload)),
  update: async (id, payload) => clean(await apiClient.patch(`/services/${id}`, payload)),
  setStatus: async (id, is_active) => clean(await apiClient.patch(`/services/${id}/status`, null, { params: { is_active } })),
  deletePlaceholder: null,
};