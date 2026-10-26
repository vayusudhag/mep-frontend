import api from "../auth";

export const getAdminStatsAPI = async () => {
  const res = await api.get("/api/admin/stats");
  return res.data.data;
};

export const getAdminTeamsAPI = async (params = {}) => {
  const res = await api.get("/api/admin/teams", { params });
  return res.data;
};

export const getAdminTeamAPI = async (teamId) => {
  const res = await api.get(`/api/admin/teams/${teamId}`);
  return res.data.data;
};

export const updateAdminTeamAPI = async (teamId, payload) => {
  const res = await api.put(`/api/admin/teams/${teamId}`, payload);
  return res.data.data;
};

export const deleteAdminTeamAPI = async (teamId) => {
  const res = await api.delete(`/api/admin/teams/${teamId}`);
  return res.data;
};

export const addAdminMemberAPI = async (teamId, payload) => {
  const res = await api.post(`/api/admin/teams/${teamId}/members`, payload);
  return res.data.data;
};

export const updateAdminMemberAPI = async (memberId, payload) => {
  const res = await api.put(`/api/admin/members/${memberId}`, payload);
  return res.data.data;
};

export const deleteAdminMemberAPI = async (memberId) => {
  const res = await api.delete(`/api/admin/members/${memberId}`);
  return res.data;
};

export const getAdminBullsAPI = async (params = {}) => {
  const res = await api.get("/api/admin/bulls", { params });
  return res.data;
};

export const createAdminBullAPI = async (payload) => {
  const res = await api.post("/api/admin/bulls", toBullFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateAdminBullAPI = async (bullId, payload) => {
  const res = await api.put(`/api/admin/bulls/${bullId}`, toBullFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const deleteAdminBullAPI = async (bullId) => {
  const res = await api.delete(`/api/admin/bulls/${bullId}`);
  return res.data;
};

const toBullFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "image" && value) {
      formData.append("image", value);
      return;
    }
    if (key === "currentCategory") {
      formData.append(key, JSON.stringify(value));
      return;
    }
    formData.append(key, value);
  });
  return formData;
};
