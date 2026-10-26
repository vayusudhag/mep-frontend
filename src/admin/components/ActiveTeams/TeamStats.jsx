import { Trophy, TrendingUp, Award, Star } from "lucide-react";

export default function TeamStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={<Trophy className="w-5 h-5 text-amber-600" />}
        label="Win Rate"
        value={stats.winRate}
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
        label="Best Time"
        value={stats.bestTime}
      />
      <StatCard
        icon={<Award className="w-5 h-5 text-green-600" />}
        label="Total Prizes"
        value={stats.totalPrizes}
      />
      <StatCard
        icon={<Star className="w-5 h-5 text-purple-600" />}
        label="Rank"
        value={`#${stats.currentRank}`}
      />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border">
      <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}
