import apiClient from "../../../services/apiClient";
const clean = (r) => r.data?.data;
export const profileService = {
  get: async () => clean(await apiClient.get("/users/me")),
  update: async (payload) => clean(await apiClient.patch("/users/me", payload)),
};
