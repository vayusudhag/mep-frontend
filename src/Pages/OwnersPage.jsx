import { useState, useEffect, Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import CreateTeam from "../components/CreateTeam";
import { TableSkeleton } from "../components/ShimmerEffect";

const OwnersPage = () => {
  const { isLogin } = useAuth();
  const { teams, fetchTeamsOnce, refreshTeams, loading } = useTeams();

  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchTeamsOnce();
  }, []); // Run only once on mount

  useEffect(() => {
    // console.log("Teams updated:", teams);
  }, [teams]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#fbf6ee] py-8">
        <div className="max-w-7xl mx-auto px-4 space-y-6" aria-busy="true">
          <div className="flex justify-between items-center">
            <div
              className="h-8 w-48 bg-stone-200/60 rounded-md"
              aria-hidden="true"
            ></div>
          </div>
          <TableSkeleton rows={6} />
        </div>
      </div>
    );

  const getOwnerName = (team) =>
    team?.ownerId?.username ||
    team?.ownerId?.name ||
    team?.createdBy?.name ||
    "-";

  const handleTeamCreated = async () => {
    await refreshTeams(); // ✅ sync with backend
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif font-medium text-stone-800">
            Company name
          </h2>
          {isLogin && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
            >
              + Add Team
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Bulls
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {teams.map((team) => (
                <Fragment key={team._id}>
                  <tr
                    key={team._id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-stone-800">
                      {team.teamName}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {getOwnerName(team)}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {team.bulls?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          setExpanded(expanded === team._id ? null : team._id)
                        }
                        className="text-amber-700 hover:text-amber-900 font-medium"
                      >
                        {expanded === team._id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {expanded === team._id && (
                    <tr>
                      <td colSpan={4} className="bg-stone-50 px-6 py-4">
                        {Array.isArray(team.bulls) && team.bulls.length > 0 ? (
                          <ul className="space-y-2">
                            {team.bulls.map((bull, _id) => (
                              <li
                                key={bull._id || _id}
                                className="text-stone-700"
                              >
                                <span className="font-medium mx-2">
                                  {bull?.name ?? "Unknown Bull"}
                                </span>
                                -
                                <span className="font-medium mx-2">
                                  {(
                                    bull?.currentCategory?.value ||
                                    "Unknown Category"
                                  ).replace(/_/g, "-")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-stone-500">
                            No bulls registered for this team
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen flex items-start justify-center py-10">
              <CreateTeam
                onSubmit={handleTeamCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnersPage;
