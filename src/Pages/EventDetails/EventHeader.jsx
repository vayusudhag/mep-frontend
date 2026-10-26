import { Trophy, Clock, MapPin, Calendar } from "lucide-react";

export default function EventHeader({ event }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-stone-200">
      <div className="flex justify-between items-start relative">
        <div className="mt-6 sm:mt-0">
          <h1 className="text-3xl font-serif font-medium text-stone-800">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 mt-4 text-stone-600">
            <div className="flex items-center gap-1">
              <Calendar size={18} />
              <span>{new Date(event.timings.from).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={18} />
              <span>{new Date(event.timings.from).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              <span className="text-stone-600 mr-3">
                {event.location?.name}
              </span>
              {event.location?.googleMapUrl && (
                <a
                  href={event.location.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:underline text-sm whitespace-nowrap"
                >
                  View on Google Maps
                </a>
              )}
            </div>
            <div className="flex items-center gap-1 font-medium text-amber-700">
              <Trophy size={18} />
              <span>₹{event.prizeMoney.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <span
          className={`absolute top-[-7px] right-[-7px] sm:relative px-3 py-1 rounded-full text-sm font-semibold border ${
            event.state === "ONGOING"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse"
              : "bg-stone-100 text-stone-700 border-stone-200"
          }`}
        >
          {event.state}
        </span>
      </div>
      <p className="mt-4 text-stone-600">{event.description}</p>
    </div>
  );
}
