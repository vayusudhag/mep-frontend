import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Medal, Trophy } from "lucide-react";
import { getTeamByIdApi, getTeamProfileApi } from "../services/teams/index";
import { getTeamStatsAPI } from "../services/stats/stats.api.js";

const isValidObjectId = (value) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

const groupBullsByCategory = (bulls = []) => {
  return bulls.reduce((acc, bull) => {
    const category = bull?.currentCategory?.value || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(bull);
    return acc;
  }, {});
};

const adaptTeamData = ({
  teamData = {},
  profileData = {},
  teamStats = {},
}) => ({
  id: teamData?._id,
  name: teamData?.teamName || "—",
  profileUrl: teamData?.profileUrl || null,
  bannerUrl: teamData?.bannerUrl || null,
  owner: teamData?.ownerId?.username || "—",
  location: [
    teamData?.teamLocation?.village,
    teamData?.teamLocation?.district,
    teamData?.teamLocation?.state,
  ],
  bulls: profileData?.bulls || teamData?.bulls || [],
  members: teamData?.teamMembers || [],
  stats: {
    wins: profileData?.summary?.podiums ?? teamStats?.podiums ?? 0,
    events: profileData?.summary?.totalEntries ?? teamStats?.totalEntries ?? 0,
    rank: profileData?.summary?.bestRank ?? teamStats?.bestRank ?? "—",
  },
});

export default function TeamDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!id || !isValidObjectId(id)) {
        setError("Invalid team ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [teamRes, statsRes, profileRes] = await Promise.all([
          getTeamByIdApi(id),
          getTeamStatsAPI(),
          getTeamProfileApi(id),
        ]);

        const teamData = teamRes?.data?.data;
        const profileData = profileRes?.data?.data || {};
        const allTeamStats = statsRes?.data?.data || [];
        const teamStats = allTeamStats.find((stat) => stat.teamId === id) || {};

        setTeam(adaptTeamData({ teamData, profileData, teamStats }));
        console.log("Fetched team details", team);
      } catch (fetchError) {
        console.error("Failed to fetch team details", fetchError);
        setError("Failed to load team details");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [id]);

  const categorizedBulls = useMemo(
    () => groupBullsByCategory(team?.bulls || []),
    [team?.bulls],
  );

  const toggleCategory = (categoryValue) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryValue)) next.delete(categoryValue);
      else next.add(categoryValue);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf6ee] flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-amber-200 rounded-full mb-4"></div>
          <p className="text-stone-600 font-serif">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-[#fbf6ee] flex flex-col justify-center items-center gap-4">
        <p className="text-red-600 font-serif text-xl">
          {error || "Team not found"}
        </p>
        <button
          onClick={() => navigate("/teams")}
          className="text-amber-700 hover:text-amber-900 underline underline-offset-4"
        >
          Return to Teams
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Teams
        </Link>

        <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="relative w-full h-56">
            {team.bannerUrl ? (
              <img
                src={team.bannerUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-r from-amber-200 via-orange-200 to-rose-200" />
            )}
          </div>

          <div className="relative px-4 pb-4 md:pb-8 ">
            {/* Profile Image (Overlapping Banner) */}
            <div className="absolute -top-18 left-2 md:-top-16 md:left-8">
              <div className="w-30 h-30 md:w-32 md:h-32 rounded-full border-4 border-white bg-stone-100 overflow-hidden shadow-md flex items-center justify-center text-5xl">
                {team?.profileUrl ? (
                  <img
                    src={team.profileUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "🐂"
                )}
              </div>
            </div>

            {/* Spacing for overlap */}
            <div className="h-20 relative" />

            {/* Name */}
            <h1 className="text-3xl font-semibold text-stone-800  absolute right-6 top-10 ">
              {team?.name}
            </h1>
          </div>
        </div>

        <div>
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm block md:hidden">
            <h3 className="font-serif text-xl text-stone-800 mb-4 flex items-center gap-2">
              Owner :{team.owner || "—"} <br />
              {/* Location :{team.location?[0]} team.location?[0]} */}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-amber-400 rounded-full"></span>
                Registered Bulls
              </h2>

              {team.bulls.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(categorizedBulls).map(
                    ([categoryValue, bulls]) => (
                      <div
                        key={categoryValue}
                        className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => toggleCategory(categoryValue)}
                          className="w-full p-6 text-left hover:bg-stone-50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-sm text-amber-700 font-semibold">
                              {bulls.length}
                            </div>
                            <div>
                              <h3 className="font-serif text-lg text-stone-800">
                                {categoryValue}
                              </h3>
                              <p className="text-sm text-stone-500">
                                {bulls.length} bull
                                {bulls.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`transform transition-transform ${
                              expandedCategories.has(categoryValue)
                                ? "rotate-180"
                                : ""
                            }`}
                          >
                            <svg
                              className="w-5 h-5 text-stone-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </button>

                        {expandedCategories.has(categoryValue) && (
                          <div className="px-6 pb-6 border-t border-stone-100">
                            <div className="pt-4 space-y-3">
                              {bulls.map((bull, idx) => (
                                <div
                                  key={bull?._id || idx}
                                  className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-lg"
                                >
                                  <span className="text-stone-700 font-medium">
                                    {bull?.name || "—"}
                                  </span>
                                  <div className="text-xs text-stone-600">
                                    Events:{" "}
                                    <span className="font-semibold text-stone-800">
                                      {bull?.stats?.eventsPlayed ?? 0}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500 italic">
                  No bulls registered yet.
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-amber-400 rounded-full"></span>
                Team Members
              </h2>

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {team.members.length > 0 ? (
                        team.members.map((member, idx) => (
                          <tr
                            key={member?._id || idx}
                            className="hover:bg-stone-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-stone-800 font-medium">
                              {member?.name || "—"}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  member?.role === "OWNER"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-stone-100 text-stone-600"
                                }`}
                              >
                                {member?.role || "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-stone-500 text-sm">
                              Active
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            className="px-6 py-4 text-stone-500 text-sm"
                            colSpan={3}
                          >
                            No team members found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm hidden md:block">
              <h3 className="font-serif text-xl text-stone-800 mb-4 flex items-center gap-2">
                Owner :{team.owner || "—"}
              </h3>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-xl text-stone-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                Achievements
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <Medal className="w-5 h-5 text-amber-600" />
                    <span className="text-stone-700 font-medium">Rank</span>
                  </div>
                  <span className="text-amber-800 font-bold">
                    {team.stats?.rank !== undefined &&
                    team.stats?.rank !== null &&
                    team.stats?.rank !== "—"
                      ? `#${team.stats.rank}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
