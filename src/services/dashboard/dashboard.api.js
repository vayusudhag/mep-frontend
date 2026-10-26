import api from "../auth/index";

export const getDashboardCountsAPI = () => {
  return api.get("/api/dashboard/counts");
};
