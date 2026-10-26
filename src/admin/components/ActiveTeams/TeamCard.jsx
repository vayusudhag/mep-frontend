import { Trophy, Users as UsersIcon, MapPin } from "lucide-react";

export default function TeamCard({ team, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-stone-200 rounded-xl p-6 hover:border-amber-400 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Icon */}
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-amber-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        {team.image}
      </div>

      {/* Wins */}
      {team.wins > 0 && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-medium shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>{team.wins} wins</span>
        </div>
      )}

      <div className="mt-8 flex-1 flex flex-col">
        <h3 className="text-xl font-serif text-stone-800 mb-1 group-hover:text-amber-700 transition-colors font-medium">
          {team.name}
        </h3>
        <p className="text-stone-500 text-sm mb-6">{team.owner}</p>

        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center gap-3 text-sm text-stone-600">
            <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-lg border border-stone-100">
              🐂
            </div>
            <span className="font-medium">{team.bullNames}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-stone-600">
            <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center border border-stone-100 text-stone-400">
              <MapPin className="w-4 h-4" />
            </div>
            <span>{team.location}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-stone-600">
            <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center border border-stone-100 text-stone-400">
              <UsersIcon className="w-4 h-4" />
            </div>
            <span>{team.members} members</span>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100">
          <div className="flex justify-between items-center text-sm mb-4">
            <span className="text-stone-500">Events Participated</span>
            <span className="text-stone-900 font-bold bg-stone-100 px-2 py-0.5 rounded-md">{team.eventsParticipated}</span>
          </div>
          
          <div className="flex items-center gap-2 text-amber-700 text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium translate-y-2 group-hover:translate-y-0">
            <span>View Details</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
