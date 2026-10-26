import api from "../auth/index";

// event registration

export const registerForEvent = async (eventId, payload) => {
  const res = await api.post(`/api/events/${eventId}/register`, payload);
  return res.data && (res.data.data || res.data);
};

// admin

export const fetchEventRegistrations = async (eventId) => {
  const res = await api.get(`/api/admin/registrations`, {
    params: { eventId },
  });
  return (res.data && res.data.data) || [];
};

export const updateRegistrationStatus = async (
  registrationId,
  status,
  reason,
) => {
  const res = await api.patch(`/api/admin/registrations/${registrationId}`, {
    status,
    reason,
  });
  return res.data && (res.data.data || res.data);
};
