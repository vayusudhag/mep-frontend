import React, { useState, useEffect, useMemo } from "react";
import { BarChart } from "recharts/es6/chart/BarChart";
import { Bar } from "recharts/es6/cartesian/Bar";
import { XAxis } from "recharts/es6/cartesian/XAxis";
import { YAxis } from "recharts/es6/cartesian/YAxis";
import { CartesianGrid } from "recharts/es6/cartesian/CartesianGrid";
import { Tooltip } from "recharts/es6/component/Tooltip";
import { ResponsiveContainer } from "recharts/es6/component/ResponsiveContainer";

import { Clock, Zap } from "lucide-react";
import StatCard from "../StatCard";
import DetailsSection from "../DetailsSection";
import { getAllEvents } from "../../../services/events/event.api";
import { getEventDays } from "../../../services/events/event.api";
import { getDayLeaderboardAPI } from "../../../services/stats/stats.api";

export default function LeaderboardTab() {
  const [events, setEvents] = useState([]);
  const [days, setDays] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("");

  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState(null);

  const isEventActiveByDate = (event) => {
    const endAt = event?.timings?.to ? new Date(event.timings.to).getTime() : null;
    if (!endAt) return false;
    return endAt >= Date.now();
  };

  // 1. Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const eventList = await getAllEvents({ includePast: false, limit: 50 });
        const visibleEvents = (eventList || []).filter(isEventActiveByDate);
        setEvents(visibleEvents);

        // Auto-select latest event
        if (visibleEvents.length > 0) {
          const latestEvent = [...visibleEvents].sort((a, b) => {
            const aDate = new Date(a?.timings?.from || a?.createdAt || 0).getTime();
            const bDate = new Date(b?.timings?.from || b?.createdAt || 0).getTime();
            return bDate - aDate;
          })[0];
          setSelectedEventId(latestEvent?._id || visibleEvents[0]._id);
        } else {
          setSelectedEventId("");
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
        setError("Unable to load events.");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // 2. Fetch Days when Event changes
  useEffect(() => {
    if (!selectedEventId) {
      setDays([]);
      return;
    }

    const fetchDays = async () => {
      setLoadingDays(true);
      try {
        const dayList = await getEventDays(selectedEventId);
        setDays(dayList);

        // Auto-select latest day (or first day)
        if (dayList.length > 0) {
          const latestDay = [...dayList].sort((a, b) => {
            const aDate = new Date(a?.date || a?.createdAt || 0).getTime();
            const bDate = new Date(b?.date || b?.createdAt || 0).getTime();
            return bDate - aDate;
          })[0];
          setSelectedDayId(latestDay?._id || dayList[dayList.length - 1]._id);
        } else {
          setSelectedDayId("");
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Failed to fetch days", err);
        // Don't set global error, just maybe no days found
      } finally {
        setLoadingDays(false);
      }
    };
    fetchDays();
  }, [selectedEventId]);

  // 3. Fetch Leaderboard when Day changes
  useEffect(() => {
    if (!selectedEventId || !selectedDayId) {
      setLeaderboard([]);
      return;
    }

    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const res = await getDayLeaderboardAPI(selectedEventId, selectedDayId);
        setLeaderboard(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
        // toast.error("Failed to load leaderboard");
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, [selectedEventId, selectedDayId]);

  // Derived Data
  const highlights = useMemo(() => {
    if (!leaderboard.length) return null;
    const sortedByDistance = [...leaderboard].sort(
      (a, b) =>
        (b.distanceMeters ?? b.distance ?? 0) -
        (a.distanceMeters ?? a.distance ?? 0),
    );
    const sortedByTime = [...leaderboard].sort(
      (a, b) =>
        (a.timeSeconds ?? a.time ?? 9999) - (b.timeSeconds ?? b.time ?? 9999),
    );
    return {
      bestDistance: sortedByDistance[0],
      bestTime: sortedByTime[0],
    };
  }, [leaderboard]);

  const chartData = useMemo(() => {
    return leaderboard
      .map((entry) => ({
        name: entry.bulls || entry.bull1 || entry.bullName,
        distance: entry.distanceMeters ?? entry.distance ?? 0,
        time: entry.timeSeconds ?? entry.time ?? 0,
        rank: entry.rank || null,
      }))
      .slice(0, 10); // Top 10
  }, [leaderboard]);

  if (loadingEvents) {
    return (
      <div className="text-center py-12 text-gray-500">Loading events...</div>
    );
  }

  if (error || (!loadingEvents && events.length === 0)) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900">
          Leaderboard Coming Soon
        </h3>
        <p className="text-gray-500 mt-2">
          Stay tuned for the first event results!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filters (Clean) */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Day
          </label>
          <select
            value={selectedDayId}
            onChange={(e) => setSelectedDayId(e.target.value)}
            disabled={!days.length}
            className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            {days.length === 0 && <option>No days available</option>}
            {days.map((d, idx) => (
              <option key={d._id} value={d._id}>
                Day {d.dayNumber || idx + 1} (
                {new Date(d.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingLeaderboard || loadingDays ? (
        <div className="text-center py-12 text-gray-400">Loading data...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No results found for this day.</p>
        </div>
      ) : (
        <>
          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights?.bestTime && (
              <StatCard
                title="Best Time"
                value={`${(
                  ((highlights.bestTime.timeSeconds ??
                    highlights.bestTime.time ??
                    0) ||
                    0) / 60
                ).toFixed(2)} min`}
                subValue={highlights.bestTime.bulls}
                icon={Clock}
                color="blue"
              />
            )}
            {/* If winner is same as best distance, show something else or repeat? */}
            <StatCard
              title="Participants"
              value={leaderboard.length}
              subValue="Total Entries"
              icon={Zap}
              color="emerald"
            />
          </div>

          {/* Primary Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Distance Ranking (Top 10)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, bottom: 40, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="distance"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Distance (m)"
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category-wise Rankings */}
          <DetailsSection title="Rankings">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bulls
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time (min)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rock Weight
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry, idx) => (
                    <tr
                      key={`rank-${idx}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{entry.rank || idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.bulls || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.team}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {entry.distanceMeters ?? entry.distance ?? 0}m
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(
                          ((entry.timeSeconds ?? entry.time ?? 0) || 0) / 60
                        ).toFixed(2)}{" "}
                        min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.rockWeightKg ?? entry.rockWeight ?? 0}kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailsSection>
        </>
      )}
    </div>
  );
}
