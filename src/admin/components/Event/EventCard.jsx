import { Edit2, Trash2, Calendar, MapPin, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { updateEventState } from "../../../services/events/event.api";
import { toast } from "react-hot-toast";

export default function EventCard({ event, onEdit, onDelete, onStateUpdate }) {
  const getNextStateOptions = () => {
    if (event.state === "UPCOMING") return ["ONGOING"];
    if (event.state === "ONGOING") return ["COMPLETED"];
    return [];
  };

  const handleStateChange = async (e) => {
    const newState = e.target.value;
    if (!newState) return;

    try {
      const updated = await updateEventState(event._id, newState);
      if (onStateUpdate) onStateUpdate(updated);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update event status";
      toast.error(msg);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 hover:border-amber-400 hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-serif text-stone-800 font-medium line-clamp-1" title={event.title}>
          <Link to={`/admin/events/${event._id}`} className="hover:text-amber-700">
            {event.title}
          </Link>
        </h3>
        <StatusBadge status={event.state} />
      </div>

      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-stone-600 text-sm">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>
            {new Date(event.timings.from).toLocaleDateString()}
            {event.timings.to && ` - ${new Date(event.timings.to).toLocaleDateString()}`}
          </span>
        </div>
        
        {event.location?.name && (
            <div className="flex items-center gap-2 text-stone-600 text-sm">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span className="line-clamp-1">{event.location.name}</span>
            </div>
        )}

        {event.prizeMoney && (
            <div className="flex items-center gap-2 text-stone-600 text-sm">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>₹ {event.prizeMoney.toLocaleString()}</span>
            </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100 space-y-4">
        {event.location?.googleMapUrl && (
          <a
            href={event.location.googleMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 text-sm font-medium"
          >
            <MapPin className="w-4 h-4" />
            View on Google Maps
          </a>
        )}
        {getNextStateOptions().length > 0 && (
          <select
            onChange={handleStateChange}
            className="w-full bg-stone-50 border border-stone-200 text-stone-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer disabled:opacity-50"
            defaultValue=""
            disabled={event.state === "COMPLETED"}
          >
            <option value="" disabled>Change status...</option>
            {getNextStateOptions().map((s) => (
              <option key={s} value={s}>
                Mark as {s}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2">
          <button 
            onClick={onEdit} 
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 hover:text-amber-700 transition-colors text-sm font-medium disabled:opacity-50"
            disabled={event.state !== "UPCOMING"}
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>

          <button 
            onClick={onDelete} 
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
            disabled={event.state !== "UPCOMING"}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>

        <Link
          to={`/admin/events/${event._id}`}
          className="mt-3 inline-flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
        >
          Manage Days & Scores
        </Link>
      </div>
    </div>
  );
}
