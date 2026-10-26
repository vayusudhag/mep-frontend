import api from "../auth/index";

export const getBullsByTeam = async (teamId, includeDeleted = false) => {
  try {
    const res = await api.get("/api/bulls", {
      params: { team: teamId, includeDeleted },
    });
    return (res.data && res.data.data) || [];
  } catch (err) {
    return [];
  }
};

export const getAllBullsAPI = async () => {
  try {
    const res = await api.get("/api/bulls/all");
    return (res.data && res.data.data) || [];
  } catch (err) {
    return [];
  }
};

export const scheduleDeleteBull = async (bullId) => {
  const res = await api.delete(`/api/bulls/${bullId}`);
  return res.data?.data || res.data;
};

export const revokeDeleteBull = async (bullId) => {
  const res = await api.patch(`/api/bulls/${bullId}/revoke-delete`);
  return res.data?.data || res.data;
};
