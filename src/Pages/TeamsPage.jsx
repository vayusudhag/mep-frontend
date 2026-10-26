import { CardSkeleton } from "../components/ShimmerEffect";
import { Link, useNavigate } from "react-router-dom";
import { useTeams } from "../context/TeamContext";
import { useEffect } from "react";

const TeamsPage = ({ loading }) => {
  const navigate = useNavigate();
  const { teams, loading: contextLoading, fetchTeamsOnce } = useTeams();

  useEffect(() => {
    fetchTeamsOnce();
  }, []);

  const isLoading = loading || contextLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Helper to format categories
  const getCategories = (team) => {
    if (!team.bulls || team.bulls.length === 0) return "N/A";
    const categories = new Set(
      team.bulls
        .map((b) => b.currentCategory?.value)
        .filter(Boolean)
    );
    return Array.from(categories).join(", ").replace(/_/g, " ");
  };

  const getBullNames = (team) => {
    if (!team.bulls || team.bulls.length === 0) return "N/A";
    return team.bulls
      .map((b) => b?.name)
      .filter(Boolean)
      .join(" + ");
  };

  const getOwnerName = (team) =>
    team?.ownerId?.username || team?.ownerId?.name || "—";

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8 pt-0 md:px-10">
      <div className="space-y-10 max-w-7xl mx-auto px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="text-sm text-amber-700 hover:text-amber-900 font-medium transition"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-amber-200 pb-4">
          <h2 className="text-3xl font-serif font-semibold text-stone-800">
            All Teams
          </h2>
          <span className="text-stone-600 font-medium">
            Total: {teams.length}
          </span>
        </div>

        {/* Cards */}
        {teams.length === 0 ? (
          <div className="text-center text-stone-500 py-10">
            No active teams found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <div
                key={team._id}
                onClick={() => navigate(`/teams/${team._id}`)}
                className="bg-[#fbf6ee] border border-stone-300 p-6 hover:border-amber-600 transition cursor-pointer"
              >
                <div className="space-y-3">
                  <h3 className="text-xl font-serif text-stone-800 tracking-wide">
                    {team.teamName}
                  </h3>

                  <div className="h-px bg-amber-300 w-12" />

                  <p className="text-sm text-stone-600">
                    Category:{" "}
                    <span className="font-medium text-emerald-700">
                      {getCategories(team)}
                    </span>
                  </p>

                  {team.teamLocation && (
                    <p className="text-sm text-stone-600">
                      Location:{" "}
                      <span className="font-medium text-stone-800">
                        {[
                          team.teamLocation.village,
                          team.teamLocation.district,
                          team.teamLocation.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </p>
                  )}

                  <p className="text-sm text-stone-600">
                    Total Bulls:{" "}
                    <span className="font-medium text-stone-800">
                      {team.bulls ? team.bulls.length : 0}
                    </span>
                  </p>
                  <p className="text-sm text-stone-600">
                    Bulls:{" "}
                    <span className="font-medium text-stone-800">
                      {getBullNames(team)}
                    </span>
                  </p>
                  <p className="text-sm text-stone-600">
                    Owner:{" "}
                    <span className="font-medium text-stone-800">
                      {getOwnerName(team)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
