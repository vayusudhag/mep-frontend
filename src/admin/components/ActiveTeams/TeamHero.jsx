import { Trophy, Calendar, MapPin, Users } from "lucide-react";

export default function TeamHero({ team }) {
  return (
    <div className="relative bg-linear-to-br from-amber-500 to-amber-700 rounded-2xl p-8 mb-6 overflow-hidden">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white opacity-10 rounded-full" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-5xl shadow-xl">
          {team.image}
        </div>

        <div className="flex-1 text-white">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-white">{team.name}</h1>

            {team.wins > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 rounded-full">
                <Trophy className="w-4 h-4" />
                <span className="text-sm">{team.wins}x Champion</span>
              </div>
            )}
          </div>

          {/* <p className="text-amber-100 mb-4">{team.description}</p> */}

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Owner: {team.owner}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{team.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
