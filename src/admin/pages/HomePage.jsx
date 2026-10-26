import {
  Users,
  Calendar,
  TrendingUp,
  Radio,
  BarChart3,
  Award,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardItem from "../components/Home/CardItem";
import QuickStat from "../components/Home/QuickStat";
import RecentActivityItem from "../components/Home/RecentAvtivityItem";
import { getAllEvents } from "../../services/events/event.api";
import {
  getAllTeamsApi,
  getTeamsInOngoingEventsAPI,
} from "../../services/teams/index";
import { getDashboardCountsAPI } from "../../services/dashboard/dashboard.api";

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardCounts, setDashboardCounts] = useState({
    activeTeams: 0,
    activeBulls: 0,
    totalEvents: 0,
    pendingTeams: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  const onNavigateToTeams = () => {
    navigate("/admin/active-teams");
  };
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [eventsRes, teamsRes] = await Promise.all([
          getAllEvents(),
          getAllTeamsApi(),
        ]);
        setEvents(eventsRes.data.data || []);
        setTeams(teamsRes?.data?.data || teamsRes || []);
      } catch {
        setEvents([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setCountsLoading(true);
        const response = await getDashboardCountsAPI();
        setDashboardCounts(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      } finally {
        setCountsLoading(false);
      }

      let activeTeams = 0;
      try {
        const activeTeamsList = await getTeamsInOngoingEventsAPI();
        activeTeams = Array.isArray(activeTeamsList)
          ? activeTeamsList.length
          : 0;
      } catch {
        activeTeams = 0;
      } finally {
        setCountsLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const metrics = useMemo(() => {
    const now = Date.now();
    const totalEvents = events.length;
    const upcomingEvents = events.filter((e) => {
      try {
        return new Date(e.timings?.from).getTime() > now;
      } catch {
        return false;
      }
    }).length;
    const liveEvents = events.filter((e) => e.state === "ONGOING").length;
    const activeTeams = teams.filter(
      (t) => t.status?.toUpperCase() === "APPROVED",
    ).length;
    return { totalEvents, upcomingEvents, liveEvents, activeTeams };
  }, [events, teams]);

  const cards = [
    {
      id: "active-teams",
      title: "Active Teams",
      value: countsLoading ? "..." : String(dashboardCounts.activeTeams || 0),
      subtitle: "Teams currently registered",
      icon: Users,
      onClick: onNavigateToTeams,
    },
    {
      id: "active-bulls",
      title: "Active Bulls",
      value: countsLoading ? "..." : String(dashboardCounts.activeBulls || 0),
      subtitle: "Bulls in competition",
      icon: Award,
    },
    {
      id: "total-events",
      title: "Total Events",
      value: countsLoading ? "..." : String(dashboardCounts.totalEvents || 0),
      subtitle: "Events this season",
      icon: Calendar,
    },
    {
      id: "upcoming-events",
      title: "Upcoming Events",
      value: String(metrics.upcomingEvents || 0),
      subtitle: "Next 30 days",
      icon: TrendingUp,
    },
    {
      id: "live-events",
      title: "Live Events",
      value: String(metrics.liveEvents || 0),
      subtitle: "Currently ongoing",
      icon: Radio,
      pulse: metrics.liveEvents > 0,
    },
    {
      id: "statistics",
      title: "Statistics",
      value: `${metrics.totalEvents} Events`,
      subtitle: "Overview metrics",
      icon: BarChart3,
    },
    // {
    //   id: "champions",
    //   title: "Champions",
    //   value: String(events.filter((e) => e.state === "COMPLETED").length),
    //   subtitle: "Completed event winners",
    //   icon: Award,
    // },
  ];

  const activities = useMemo(() => {
    const eventActivities = events
      .map((e) => ({
        action: e.state === "COMPLETED" ? "Event completed" : "Event update",
        team: e.title,
        time: new Date(
          e.updatedAt || e.timings?.from || Date.now(),
        ).toLocaleString(),
        kind: "event",
        ts: new Date(e.updatedAt || e.timings?.from || Date.now()).getTime(),
      }))
      .slice(0, 10);
    const teamActivities = teams
      .map((t) => ({
        action:
          t.status?.toUpperCase() === "APPROVED"
            ? "Team approved"
            : t.status?.toUpperCase() === "REJECTED"
              ? "Team rejected"
              : "New team registration",
        team: t.teamName,
        time: new Date(
          t.updatedAt || t.createdAt || Date.now(),
        ).toLocaleString(),
        kind: "team",
        ts: new Date(t.updatedAt || t.createdAt || Date.now()).getTime(),
      }))
      .slice(0, 10);
    return [...eventActivities, [...teamActivities]]
      .flat()
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8);
  }, [events, teams]);

  return (
    <div>
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif font-medium text-stone-900 mb-4">
          Welcome to Bull Race Management
        </h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-lg">
          Monitor and manage all aspects of your bull racing events from this
          comprehensive dashboard.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            {...card}
            loading={
              (card.id === "active-teams" && countsLoading) ||
              (card.id === "active-bulls" && countsLoading) ||
              (card.id === "total-events" && countsLoading)
            }
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-12">
        <h3 className="text-xl font-serif text-stone-800 font-medium mb-6 px-1">
          Quick Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickStat
            label="Pending Approvals"
            value={`${
              countsLoading ? "..." : dashboardCounts.pendingTeams || 0
            } Teams`}
            icon="⏳"
          />
          <QuickStat
            label="Completion Rate"
            value={
              events.length
                ? `${Math.round(
                    (events.filter((e) => e.state === "COMPLETED").length /
                      events.length) *
                      100,
                  )}%`
                : "0%"
            }
            icon="📊"
          />
          <QuickStat
            label="Live Events"
            value={`${metrics.liveEvents}`}
            icon="🎥"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-stone-200 p-8">
        <h3 className="text-xl font-serif text-stone-800 font-medium mb-6">
          Recent Activity
        </h3>

        <div className="space-y-4">
          {activities.map((a, i) => (
            <RecentActivityItem key={i} {...a} />
          ))}
        </div>
      </div>
    </div>
  );
}
