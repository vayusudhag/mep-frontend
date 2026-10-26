import api from "../auth/index";

// ADMIN: fetch pending teams
export const fetchPendingTeamsAPI = async () => {
  const res = await api.get("/api/teams/pending");
  return res.data.data; // assuming { status, data }
};

// ADMIN: approve / reject team
export const updateTeamStatus = async (teamId, decision, rejectionReason) => {
  // Map 'decision' (e.g., 'approve', 'reject') to backend decision ('APPROVED', 'REJECTED')
  const decisionValue = decision === "approve" ? "APPROVED" : "REJECTED";
  const payload = { decision: decisionValue };
  if (decisionValue === "REJECTED") payload.rejectionReason = rejectionReason;

  const res = await api.patch(`/api/teams/${teamId}/decision`, payload);
  return res.data.data;
};

// User :create team
export const createTeamAPI = async (teamData) => {
  const res = await api.post("/api/teams/onboard", teamData);
  return res.data.data;
};

// public
export const getActiveTeamsAPI = async () => {
  const res = await api.get("/api/teams");
  return res.data.data;
};

export const getMyTeam = async () => {
  const res = await api.get("/api/teams/myTeam");
  return (res.data && (res.data.data || res.data)) || null;
};

export const updateTeamApi = (teamId, teamData) =>
  api.put(`/api/teams/${teamId}`, teamData);

export const updateTeamRoster = (teamId, payload) =>
  api.patch(`/api/teams/${teamId}/roster`, payload);

export const getTeamByIdApi = (teamId) => api.get(`/api/teams/${teamId}`);
export const getTeamProfileApi = (teamId) => api.get(`/api/teams/${teamId}/profile`);
export const deleteTeamApi = (teamId) => api.delete(`/api/teams/${teamId}`);
export const getAllTeamsApi = () => getActiveTeamsAPI();

const getTeamsByStatusAPI = async (status) => {
  const res = await api.get("/api/teams", { params: { status } });
  const data = res.data?.data || [];
  return data.map((team) => ({
    ...team,
    createdBy: team.createdBy || team.ownerId || null,
  }));
};

export const fetchTeamsByStatus = async (status) => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "ALL") {
    const [pending, approved, rejected] = await Promise.all([
      fetchPendingTeamsAPI(),
      getTeamsByStatusAPI("APPROVED"),
      getTeamsByStatusAPI("REJECTED"),
    ]);
    return {
      data: [...(pending || []), ...(approved || []), ...(rejected || [])],
    };
  }

  if (normalizedStatus === "PENDING") {
    const data = await fetchPendingTeamsAPI();
    return { data };
  }

  if (normalizedStatus === "APPROVED" || normalizedStatus === "REJECTED") {
    const data = await getTeamsByStatusAPI(normalizedStatus);
    return { data };
  }

  throw new Error("Invalid status filter");
};

// Fetch teams registered for UPCOMING or ONGOING events
export const getTeamsInOngoingEventsAPI = async () => {
  // Backend returns grouped by event:
  // [{ event, teams: [ { registrationId, team, captainName, registrationOrder, hasPlayed, selectedBullIds, selectedBulls } ] }]
  const res = await api.get("/api/events/teams/ongoing-and-upcoming");
  const groups = res.data?.data || [];

  // Flatten registrations and keep event info
  const registrations = groups.flatMap((g) =>
    (g.teams || []).map((t) => ({ ...t, event: g.event })),
  );

  // Unique team IDs
  const teamIds = [
    ...new Set(
      registrations
        .map((r) => r.team && (r.team._id || r.team))
        .map((id) => (id ? String(id) : null))
        .filter(Boolean),
    ),
  ];

  // Fetch detailed team info + bulls for each team in parallel
  const teamMap = new Map();
  await Promise.all(
    teamIds.map(async (id) => {
      try {
        const teamRes = await getTeamByIdApi(id);
        const teamData = teamRes.data?.data || teamRes.data || {};
        teamMap.set(id, { ...teamData });
      } catch (err) {
        // fallback to minimal info
        teamMap.set(id, null);
      }
    }),
  );

  // Build deduplicated list: one entry per team, include events array and aggregate hasPlayed
  const dedup = new Map();
  for (const r of registrations) {
    const rawTeamId = r.team && (r.team._id || r.team);
    const teamId = rawTeamId ? String(rawTeamId) : "";
    if (!teamId) continue;

    const teamDetail = teamMap.get(teamId) || r.team || { _id: teamId };

    const prev = dedup.get(teamId) || {
      ...teamDetail,
      _id: teamId,
      events: [],
      hasPlayed: false,
      registrationIds: [],
      selectedBullIds: [],
      bulls: [],
    };

    prev.events.push(r.event || null);
    prev.hasPlayed = prev.hasPlayed || Boolean(r.hasPlayed);
    if (r.registrationId) prev.registrationIds.push(r.registrationId);
    if (Array.isArray(r.selectedBullIds) && r.selectedBullIds.length)
      prev.selectedBullIds = Array.from(
        new Set([
          ...prev.selectedBullIds,
          ...r.selectedBullIds.map((id) => String(id)),
        ]),
      );
    if (Array.isArray(r.selectedBulls) && r.selectedBulls.length) {
      const bullMap = new Map((prev.bulls || []).map((b) => [String(b._id), b]));
      r.selectedBulls.forEach((b) => {
        const bullId = b?._id ? String(b._id) : null;
        if (!bullId) return;
        bullMap.set(bullId, {
          _id: bullId,
          name: b?.name || null,
          currentCategory: b?.currentCategory || null,
        });
      });
      prev.bulls = Array.from(bullMap.values());
    }

    dedup.set(teamId, prev);
  }

  return Array.from(dedup.values());
};

// Fetch team members (cleaned shape)
export const getTeamMembers = async (teamId) => {
  if (!teamId) return [];
  try {
    const res = await api.get(`/api/teams/${teamId}/members`);
    const raw = (res.data && res.data.data) || [];
    return raw.map((m) => ({
      _id: (m.personId && (m.personId._id || m.personId)) || m._id,
      name: (m.personId && (m.personId.name || m.personId)) || m.name,
      role: m.role,
    }));
  } catch (err) {
    return [];
  }
};
