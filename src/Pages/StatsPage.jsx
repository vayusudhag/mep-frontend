import React, { useState, useEffect, Suspense, lazy } from "react";
import { Trophy, Users, Calendar } from "lucide-react";
import { getBullStatsAPI, getTeamStatsAPI } from "../services/stats/stats.api.js";
import toast from "react-hot-toast";

// Lazy-loaded tabs
const BullPairStatsTab = lazy(() =>
  import("../components/stats/tabs/BullPairStatsTab")
);
const TeamStatsTab = lazy(() =>
  import("../components/stats/tabs/TeamStatsTab")
);
const LeaderboardTab = lazy(() =>
  import("../components/stats/tabs/LeaderboardTab")
);

function TabButton({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState("bulls");

  // Raw API data only (tabs handle memoization)
  const [bullStats, setBullStats] = useState([]);
  const [teamStats, setTeamStats] = useState([]);

  // Per-tab loading state (NO global loading)
  const [loading, setLoading] = useState({
    bulls: false,
    teams: false,
  });

  const tabs = [
    {
      id: "bulls",
      label: "Bull Stats",
      icon: Trophy,
      description: "Performance insights of individual bulls",
    },
    {
      id: "teams",
      label: "Team Stats",
      icon: Users,
      description: "Overall team rankings and dominance",
    },
    {
      id: "leaderboard",
      label: "Day Leaderboard",
      icon: Calendar,
      description: "Latest completed event results",
    },
  ];

  // Fetch Bull stats (once)
  useEffect(() => {
    if (activeTab !== "bulls" || bullStats.length > 0) return;

    const fetch = async () => {
      try {
        setLoading((p) => ({ ...p, bulls: true }));
        const res = await getBullStatsAPI();
        setBullStats(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bull statistics");
      } finally {
        setLoading((p) => ({ ...p, bulls: false }));
      }
    };

    fetch();
  }, [activeTab, bullStats.length]);

  // Fetch Team stats (once)
  useEffect(() => {
    if (activeTab !== "teams" || teamStats.length > 0) return;

    const fetch = async () => {
      try {
        setLoading((p) => ({ ...p, teams: true }));
        const res = await getTeamStatsAPI();
        setTeamStats(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load team statistics");
      } finally {
        setLoading((p) => ({ ...p, teams: false }));
      }
    };

    fetch();
  }, [activeTab, teamStats.length]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics</h1>
          <p className="text-gray-600">
            {tabs.find((t) => t.id === activeTab)?.description}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-100/60 p-1.5 rounded-xl w-fit">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[420px]">
          <Suspense fallback={<LoadingSpinner />}>
            {activeTab === "bulls" &&
              (loading.bulls ? (
                <LoadingSpinner />
              ) : (
                <BullPairStatsTab stats={bullStats} />
              ))}

            {activeTab === "teams" &&
              (loading.teams ? (
                <LoadingSpinner />
              ) : (
                <TeamStatsTab stats={teamStats} />
              ))}

            {activeTab === "leaderboard" && (
              <LeaderboardTab mode="public-latest-only" />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
