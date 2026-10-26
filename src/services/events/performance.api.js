import api from "../auth/index";

// Public
export const getApprovedTeams = (eventId) => {
  return api.get(`/api/performance/${eventId}/approved-teams`);
};

export const getLeaderboard = (eventId) => {
  return api.get(`/api/performance/${eventId}/leaderboard`);
};

// Admin
export const recordTeamPerformance = (eventId, data) => {
  return api.post(`/api/performance/${eventId}/team-performance`, data);
};

export const recordBullPerformance = (eventId, data) => {
  return api.post(`/api/performance/${eventId}/bull-performance`, data);
};

// EventDayEntry-level APIs (temporary pairing)
export const createEventDayEntry = (eventId, dayId, data = {}) => {
  return api.post(
    `/api/event-day-entries/events/${eventId}/days/${dayId}/entries`,
    data,
  );
};

export const getEventDayEntries = (eventId, dayId) => {
  return api.get(
    `/api/event-day-entries/events/${eventId}/days/${dayId}/entries`,
  );
};

export const updateEntryPerformance = (entryId, data) => {
  return api.patch(
    `/api/event-day-entries/entries/${entryId}/performance`,
    data,
  );
};
