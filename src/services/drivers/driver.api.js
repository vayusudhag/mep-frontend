import api from "../auth/index";

export const getAllDriversAPI = () => api.get("/api/drivers");
