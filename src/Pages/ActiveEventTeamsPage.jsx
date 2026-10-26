import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTeamsInOngoingEventsAPI } from "../services/teams/index";
import { CardSkeleton } from "../components/ShimmerEffect";

const ActiveEventTeamsPage = ({ loading }) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchActiveTeams = async () => {
      try {
        setPageLoading(true);
        const data = await getTeamsInOngoingEventsAPI();
        setTeams(data || []);
      } catch (error) {
        console.error("Failed to fetch active teams", error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchActiveTeams();
  }, []);

  const isLoading = loading || pageLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Helper to format categories
  const getCategories = (team) => {
    // console.log("Team data for categories:", team);
    if (!team.bulls || team.bulls.length === 0) return "N/A";
    const categories = new Set(
      team.bulls.map((b) => b.currentCategory?.value).filter(Boolean),
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

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8">
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
          <div>
            <h2 className="text-3xl font-serif font-semibold text-stone-800">
              Active Teams
            </h2>
            <p className="text-stone-600 mt-1">
              Teams in upcoming or ongoing events
            </p>
          </div>
          <span className="text-stone-600 font-medium">
            Total: {teams.length}
          </span>
        </div>

        {/* Cards */}
        {teams.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
            <p className="text-stone-500 font-medium">
              No teams in upcoming or ongoing events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <div
                key={team._id}
                onClick={() => navigate(`/teams/${team._id}`)}
                className="bg-white border border-stone-200 p-6 rounded-lg shadow-sm hover:border-amber-600 hover:shadow-md transition cursor-pointer"
              >
                <div className="space-y-3">
                  <h3 className="text-xl font-serif text-stone-800 tracking-wide">
                    {team.teamName}
                  </h3>

                  <div className="h-px bg-amber-100 w-full" />

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
                    Bulls:{" "}
                    <span className="font-medium text-stone-800">
                      {getBullNames(team)}
                    </span>
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Playing Now
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveEventTeamsPage;
