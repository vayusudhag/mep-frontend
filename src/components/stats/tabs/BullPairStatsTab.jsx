import React, { useMemo } from "react";
import { BarChart } from "recharts/es6/chart/BarChart";
import { Bar } from "recharts/es6/cartesian/Bar";
import { XAxis } from "recharts/es6/cartesian/XAxis";
import { YAxis } from "recharts/es6/cartesian/YAxis";
import { CartesianGrid } from "recharts/es6/cartesian/CartesianGrid";
import { Tooltip } from "recharts/es6/component/Tooltip";
import { ResponsiveContainer } from "recharts/es6/component/ResponsiveContainer";

import { Trophy, Zap } from "lucide-react";
import StatCard from "../StatCard";
import DetailsSection from "../DetailsSection";

export default function BullPairStatsTab({ stats = [] }) {
  const normalizedStats = useMemo(
    () =>
      (stats || []).map((s) => ({
        bullName: s.bullName || "Unknown Bull",
        teamName: s.teamName || "Unknown Team",
        totalPlays: s.totalPlays ?? 0,
        podiumFinishes: s.podiumFinishes ?? s.podiums ?? 0,
        bestRank: s.bestRank ?? null,
        maxDistance: s.maxDistance ?? 0,
      })),
    [stats],
  );

  const highlights = useMemo(() => {
    if (!normalizedStats.length) return null;

    const sortedByPodiums = [...normalizedStats].sort(
      (a, b) => (b.podiumFinishes || 0) - (a.podiumFinishes || 0),
    );
    const sortedByDistance = [...normalizedStats].sort(
      (a, b) => (b.maxDistance || 0) - (a.maxDistance || 0),
    );

    return {
      mostPodiums: sortedByPodiums[0],
      bestDistance: sortedByDistance[0],
    };
  }, [normalizedStats]);

  const chartData = useMemo(() => {
    // Top 10 by Podium Finishes to avoid clutter
    return [...normalizedStats]
      .sort((a, b) => (b.podiumFinishes || 0) - (a.podiumFinishes || 0))
      .slice(0, 10)
      .map((s) => ({
        name: s.bullName,
        podiums: s.podiumFinishes,
      }));
  }, [normalizedStats]);

  if (!normalizedStats.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">No data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights?.mostPodiums && (
          <StatCard
            title="Most Podiums"
            value={highlights.mostPodiums.podiumFinishes}
            subValue={highlights.mostPodiums.bullName}
            icon={Trophy}
            color="amber"
          />
        )}
        {highlights?.bestDistance && (
          <StatCard
            title="Max Distance"
            value={`${highlights.bestDistance.maxDistance}m`}
            subValue={highlights.bestDistance.bullName}
            icon={Zap}
            color="blue"
          />
        )}
      </div>

      {/* Primary Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Top 10 Bulls by Podiums
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
                tick={{ fill: "#6b7280", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
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
                dataKey="podiums"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Podium Finishes"
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Details Table */}
      <DetailsSection title="Detailed Statistics">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bull
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plays
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Podiums
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Best Rank
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Best Dist.
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {normalizedStats.map((stat, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stat.bullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.teamName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.totalPlays}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.podiumFinishes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{stat.bestRank}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.maxDistance}m
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DetailsSection>
    </div>
  );
}
