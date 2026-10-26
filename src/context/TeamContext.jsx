import { createContext, useContext, useState } from "react";
import { getAllTeamsApi } from "../services/teams/index";

const TeamContext = createContext(null);

const sortTeamsAlphabetically = (teams) => {
  return [...teams].sort((a, b) =>
    String(a?.teamName || "").localeCompare(String(b?.teamName || ""), undefined, {
      sensitivity: "base",
    }),
  );
};

export function TeamProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTeamsOnce = async () => {
    if (loaded) return; // cache guard

    setLoading(true);
    try {
      const res = await getAllTeamsApi();
      const data = res?.data?.data || res || [];
      // console.log("Fetched teams:", res);
      setTeams(Array.isArray(data) ? sortTeamsAlphabetically(data) : []);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshTeams = async () => {
    setLoading(true);
    try {
      const res = await getAllTeamsApi();
      const data = res?.data?.data || res || [];
      setTeams(Array.isArray(data) ? sortTeamsAlphabetically(data) : []);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        loading,
        fetchTeamsOnce,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export const useTeams = () => useContext(TeamContext);
