import apiClient from "../../../services/apiClient";
const clean = (r) => r?.data?.data;
export const bookingService = {
  create: async (payload) => clean(await apiClient.post("/bookings", payload)),
  myBookings: async (params = {}) => clean(await apiClient.get("/bookings/my", { params })),
  get: async (id) => clean(await apiClient.get(`/bookings/${id}`)),
  reschedule: async (id, payload) => clean(await apiClient.patch(`/bookings/${id}/reschedule`, payload)),
  cancel: async (id, params = {}) => clean(await apiClient.patch(`/bookings/${id}/cancel`, null, { params })),
  history: async (id) => clean(await apiClient.get(`/bookings/${id}/history`)),
  adminList: async (params = {}) => clean(await apiClient.get("/admin/bookings", { params })),
  adminUpdateStatus: async (id, status, params = {}) =>
    clean(await apiClient.patch(`/admin/bookings/${id}/status`, null, { params: { status, ...params } })),
};
