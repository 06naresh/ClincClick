import apiClient from "../../../services/apiClient";
const clean = (r) => r?.data?.data;
export const dashboardService = {
  adminStats: async () => clean(await apiClient.get("/admin/dashboard")),
  customerStats: async () => clean(await apiClient.get("/dashboard/customer")),
};
