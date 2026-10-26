import { useEffect, useState } from "react";
import { getAllBullsAPI, getBullsByTeam } from "../services/bulls/bulls.api";
import { getAllEvents, getMyRegistrations } from "../services/events/event.api";
import { getMyTeam, getTeamMembers } from "../services/teams/index";

const getRegistrationEventId = (registration) => {
  if (!registration) return null;
  if (typeof registration.event === "string") return registration.event;
  if (registration.event && typeof registration.event === "object") {
    return registration.event._id || null;
  }
  return registration.eventId || null;
};

const buildAlreadyRegisteredMap = (events, registrations) => {
  const ids = new Set(
    (registrations || [])
      .map((registration) => getRegistrationEventId(registration))
      .filter(Boolean),
  );

  return (events || []).reduce((acc, event) => {
    if (event?._id) acc[event._id] = ids.has(event._id);
    return acc;
  }, {});
};

export const useEventsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState(null);
  const [teamBulls, setTeamBulls] = useState([]);
  const [allBulls, setAllBulls] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [alreadyRegistered, setAlreadyRegistered] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const getMyTeamSafe = async () => {
      try {
        return await getMyTeam();
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          return null;
        }
        throw err;
      }
    };

    const getMyRegistrationsSafe = async () => {
      try {
        return await getMyRegistrations();
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          return [];
        }
        throw err;
      }
    };

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [eventsData, myTeam, registrations] = await Promise.all([
          getAllEvents(),
          getMyTeamSafe(),
          getMyRegistrationsSafe(),
        ]);

        if (!mounted) return;

        const normalizedEvents = Array.isArray(eventsData) ? eventsData : [];
        const normalizedRegistrations = Array.isArray(registrations)
          ? registrations
          : [];

        setEvents(normalizedEvents);
        setRegistrations(normalizedRegistrations);
        setAlreadyRegistered(
          buildAlreadyRegisteredMap(normalizedEvents, normalizedRegistrations),
        );
        const allBullsData = await getAllBullsAPI();
        if (mounted) {
          setAllBulls(Array.isArray(allBullsData) ? allBullsData : []);
        }

        if (!myTeam?._id) {
          setTeam(null);
          setTeamBulls([]);
          return;
        }

        const [members, bulls] = await Promise.all([
          getTeamMembers(myTeam._id),
          getBullsByTeam(myTeam._id),
        ]);

        if (!mounted) return;

        setTeam({
          ...myTeam,
          teamMembers: Array.isArray(members) ? members : [],
        });
        setTeamBulls(Array.isArray(bulls) ? bulls : []);
      } catch (err) {
        if (!mounted) return;

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load events dashboard";
        setError(message);
        setEvents([]);
        setTeam(null);
        setTeamBulls([]);
        setAllBulls([]);
        setRegistrations([]);
        setAlreadyRegistered({});
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    events,
    team,
    teamBulls,
    allBulls,
    registrations,
    alreadyRegistered,
    loading,
    error,
  };
};
