import { useEffect, useState } from "react";
import SearchFilterBar from "../components/TeamApproval/SearchFilterBar";
import TeamCard from "../components/TeamApproval/TeamCard";
import { fetchTeamsByStatus, updateTeamStatus } from "../../services/teams";
import toast from "react-hot-toast";

export default function TeamApproval() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const res = await fetchTeamsByStatus(filterStatus);
        setTeams(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [filterStatus]);

  const handleApprove = async (teamId) => {
    try {
      setActionLoadingId(teamId);
      await updateTeamStatus(teamId, "approve");
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      setSelectedTeamId(null);
      toast.success("Team approved");
    } catch {
      toast.error("Approval failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (teamId) => {
    const reason = window.prompt("Enter rejection reason");
    if (!reason?.trim()) return;

    try {
      setActionLoadingId(teamId);
      await updateTeamStatus(teamId, "reject", reason);
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      setSelectedTeamId(null);
      toast.success("Team rejected");
    } catch {
      toast.error("Rejection failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const q = searchTerm.toLowerCase();
    return (
      team.teamName.toLowerCase().includes(q) ||
      (team.createdBy?.name || team.createdBy?.username || "")
        .toLowerCase()
        .includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf6ee]">
        <p className="text-stone-600">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf6ee] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-serif text-stone-800">Team Approvals</h1>
          <p className="text-stone-600">
            Review and approve team registrations
          </p>
        </header>

        <div className="bg-white p-4 rounded-xl border">
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </div>

        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 bg-white border rounded-xl text-stone-500">
            No teams found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team._id}
                team={{
                  id: team._id,
                  name: team.teamName,
                  ownerName: team.createdBy?.username || team.ownerId?.username,
                  phone: team.createdBy?.mobileNumber || team.ownerId?.mobileNumber,
                  location: team.teamLocation,
                  bulls: Array.isArray(team.bulls) ? team.bulls : [],
                  teamMembers: Array.isArray(team.teamMembers) ? team.teamMembers : [],
                  registrationDate: team.createdAt,
                  status: team.status,
                }}
                loading={actionLoadingId === team._id}
                isOpen={selectedTeamId === team._id}
                onOpen={() => setSelectedTeamId(team._id)}
                onClose={() => setSelectedTeamId(null)}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
