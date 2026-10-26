import { Calendar, Trophy } from "lucide-react";
import PositionBadge from "./PositionBadge";

export default function RecentEvents({ events }) {
  return (
    <div>
      <h3 className="text-gray-900 mb-4">Recent Events</h3>

      <div className="space-y-3">
        {events.map((ev, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-gray-900">{ev.name}</h4>
                  <PositionBadge position={ev.position} />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>{ev.prize}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
