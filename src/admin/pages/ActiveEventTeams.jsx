import { useEffect, useMemo, useState } from "react";
import TeamsSearchBar from "../components/ActiveTeams/TeamsSearchBar";
import TeamCard from "../components/ActiveTeams/TeamCard";
import { useNavigate } from "react-router-dom";
import { getTeamsInOngoingEventsAPI } from "../../services/teams/index";

export default function ActiveEventTeams() {
  const navigate = useNavigate();

  const onBack = () => {
    navigate("/admin/home");
  };
  const onNavigateToTeamDetails = (teamId) => {
    navigate(`/admin/teams-details/${teamId}`);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [teamsRaw, setTeamsRaw] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getTeamsInOngoingEventsAPI();
        setTeamsRaw(data || []);
      } catch {
        setTeamsRaw([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const teams = useMemo(() => {
    return (teamsRaw || []).map((t) => {
      const bullNames = Array.isArray(t.bulls)
        ? t.bulls.map((b) => b?.name).filter(Boolean).join(" + ")
        : "";
      const members = Array.isArray(t.teamMembers) ? t.teamMembers.length : 0;
      return {
        id: t._id,
        name: t.teamName,
        owner: t.createdBy?.name || "Unknown Owner",
        bullNames: bullNames || "N/A",
        location:
          [
            t?.teamLocation?.village,
            t?.teamLocation?.district,
            t?.teamLocation?.state,
          ]
            .filter(Boolean)
            .join(", ") || "—",
        members,
        eventsParticipated: t.eventsParticipated || 0,
        wins: t.wins || 0,
        status: t.status?.toLowerCase() || "active",
        image: "🐂",
      };
    });
  }, [teamsRaw]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#fbf6ee] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-stone-800 font-medium">
              Active Teams
            </h1>
            <p className="text-stone-600 mt-1">
              Teams in upcoming or ongoing events
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Search Bar Wrapper */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <TeamsSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
            <p className="text-stone-500 font-medium">
              Loading active teams...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onClick={() => onNavigateToTeamDetails(team.id)}
                />
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
                 <p className="text-stone-500 font-medium">No teams in upcoming or ongoing events.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
