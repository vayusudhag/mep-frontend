import api from "../auth/index";

export const getBullStatsAPI = () => {
  return api.get("/api/leaderboard/bulls");
};

export const getTeamStatsAPI = () => {
  return api.get("/api/leaderboard/teams");
};

export const getDayLeaderboardAPI = (eventId, dayId) => {
  return api.get(`/api/leaderboard/events/${eventId}/days/${dayId}`);
};
