import api from "../auth/index";

// Events
export const getAllEvents = async (params = {}) => {
  const res = await api.get("/api/events", { params });
  return (res.data && res.data.data) || [];
};

export const getEventById = async (id) => {
  const res = await api.get(`/api/events/${id}`);
  return res.data && (res.data.data || res.data);
};

export const createEvent = async (data) => {
  const res = await api.post("/api/events", data);
  return res.data && (res.data.data || res.data);
};

export const updateEventDetails = async (id, data) => {
  const res = await api.put(`/api/events/${id}`, data); // Note: Backend implementation pending
  return res.data && (res.data.data || res.data);
};

export const deleteEvent = async (id) => {
  const res = await api.delete(`/api/events/${id}`); // Note: Backend implementation pending
  return res.data && (res.data.data || res.data);
};

export const updateEventState = async (id, state) => {
  const res = await api.patch(`/api/events/${id}`, { state });
  return res.data && (res.data.data || res.data);
};

// Event Days
export const createEventDay = async (eventId, data) => {
  const res = await api.post(`/api/event-days/events/${eventId}/days`, data);
  return res.data && (res.data.data || res.data);
};

export const getEventDays = async (eventId) => {
  const res = await api.get(`/api/event-days/events/${eventId}/days`);
  return (res.data && res.data.data) || [];
};

export const updateEventDayStatus = async (dayId, status) => {
  const res = await api.patch(`/api/event-days/${dayId}/status`, { status });
  return res.data && (res.data.data || res.data);
};

export const calculateDayResults = async (dayId) => {
  const res = await api.post(`/api/event-days/${dayId}/calculate-results`);
  return res.data && (res.data.data || res.data);
};

// Participants & Leaderboard
export const getApprovedParticipants = async (eventId) => {
  const res = await api.get(`/api/events/${eventId}/participants`);
  return (res.data && res.data.data) || [];
};

export const getLeaderboard = async (eventId) => {
  const res = await api.get(`/api/events/${eventId}/leaderboard`);
  return (res.data && res.data.data) || [];
};

// Performance (admin)
export const recordTeamPerformance = async (eventId, data) => {
  const res = await api.post(
    `/api/performance/${eventId}/team-performance`,
    data,
  );
  return res.data && (res.data.data || res.data);
};

// Event Day Entries
export const createEventDayEntry = async (eventId, dayId, data) => {
  const res = await api.post(
    `/api/event-day-entries/events/${eventId}/days/${dayId}/entries`,
    data,
  );
  return res.data && (res.data.data || res.data);
};

export const getEventDayEntries = async (eventId, dayId) => {
  const res = await api.get(
    `/api/event-day-entries/events/${eventId}/days/${dayId}/entries`,
  );
  return (res.data && res.data.data) || [];
};

export const getAvailableBullsForDay = async (eventId, dayId) => {
  const res = await api.get(
    `/api/event-day-entries/events/${eventId}/days/${dayId}/available-bulls`,
  );
  return (res.data && res.data.data) || [];
};

export const updateEntryPerformance = async (entryId, data) => {
  const res = await api.patch(
    `/api/event-day-entries/entries/${entryId}/performance`,
    data,
  );
  return res.data && (res.data.data || res.data);
};

// My registration check
export const getMyEventRegistration = async (eventId) => {
  try {
    const res = await api.get(`/api/events/${eventId}/my-registration`);
    return !!(res.data && res.data.data);
  } catch (err) {
    return false;
  }
};

// My registrations (single call for dashboard use-cases)
export const getMyRegistrations = async () => {
  const res = await api.get("/api/events/my-registrations");
  return (res.data && res.data.data) || [];
};
