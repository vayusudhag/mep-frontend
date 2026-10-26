import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import EventForm from "../components/Event/EventForm";
import EventCard from "../components/Event/EventCard";
import {
  getAllEvents,
  createEvent,
  updateEventDetails,
  deleteEvent,
  getLeaderboard,
} from "../../services/events/event.api";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["ALL", "UPCOMING", "ONGOING", "COMPLETED"];

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [statusEvents, setStatusEvents] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leaderboardByEvent, setLeaderboardByEvent] = useState({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ==============================
     FETCH EVENTS (ON LOAD)
     ============================== */
  useEffect(() => {
    loadEvents();
    loadStatusEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const loadStatusEvents = async () => {
    try {
      setStatusLoading(true);
      const data = await getAllEvents({ includePast: true, limit: 50, page: 1 });
      setStatusEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load events list");
    } finally {
      setStatusLoading(false);
    }
  };

  /* ==============================
     HANDLERS
     ============================== */
  const handleAdd = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      text: "Are you sure you want to delete this event? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingEvent) {
        const updated = await updateEventDetails(editingEvent._id, data);
        setEvents((prev) =>
          prev.map((e) => (e._id === editingEvent._id ? updated : e))
        );
        setStatusEvents((prev) =>
          prev.map((e) => (e._id === editingEvent._id ? updated : e))
        );
      } else {
        const created = await createEvent(data);
        setEvents((prev) => [created, ...prev]);
        setStatusEvents((prev) => [created, ...prev]);
      }

      setIsFormOpen(false);
    } catch (err) {
      toast.error("Failed to save event details");
      console.log(err.message || err || "Saving failed");
    }
  };

  const filteredStatusEvents = useMemo(() => {
    if (statusFilter === "ALL") return statusEvents;
    return statusEvents.filter((e) => e?.state === statusFilter);
  }, [statusEvents, statusFilter]);

  useEffect(() => {
    const completed = filteredStatusEvents.filter(
      (e) => e?.state === "COMPLETED"
    );
    if (completed.length === 0) return;

    const missing = completed.filter(
      (e) => !leaderboardByEvent[e._id]
    );
    if (missing.length === 0) return;

    const loadLeaderboards = async () => {
      try {
        const results = await Promise.all(
          missing.map(async (e) => {
            const data = await getLeaderboard(e._id);
            const top3 = Array.isArray(data) ? data.slice(0, 3) : [];
            return { eventId: e._id, top3 };
          })
        );
        setLeaderboardByEvent((prev) => {
          const next = { ...prev };
          results.forEach((r) => {
            next[r.eventId] = r.top3;
          });
          return next;
        });
      } catch {
        toast.error("Failed to load leaderboard data");
      }
    };

    loadLeaderboards();
  }, [filteredStatusEvents, leaderboardByEvent]);

  /* ==============================
     RENDER
     ============================== */
  return (
    <div className="min-h-screen bg-[#fbf6ee] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-stone-800 font-medium mb-2">
              Event Management
            </h1>
            <p className="text-stone-600">
              Create, update, and manage bull race events
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-xl font-serif text-stone-800 font-medium">
              Events by Status
            </h2>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    statusFilter === status
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {statusLoading ? (
            <div className="p-6 text-center text-stone-500">
              Loading events...
            </div>
          ) : filteredStatusEvents.length === 0 ? (
            <div className="p-6 text-center text-stone-500">
              No events for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStatusEvents.map((event) => (
                <div
                  key={event._id}
                  className="border border-stone-200 rounded-xl p-4 bg-stone-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-stone-800">
                        {event.title}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {event?.location?.name || "Location N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        event.state === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : event.state === "ONGOING"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-sky-50 text-sky-700 border-sky-100"
                      }`}
                    >
                      {event.state}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-stone-600">
                    {event?.timings?.from
                      ? new Date(event.timings.from).toLocaleDateString()
                      : "—"}{" "}
                    →{" "}
                    {event?.timings?.to
                      ? new Date(event.timings.to).toLocaleDateString()
                      : "—"}
                  </div>

                  {event.state === "COMPLETED" && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-stone-700 mb-1">
                        Top 3
                      </p>
                      <ol className="text-xs text-stone-600 space-y-1">
                        {(leaderboardByEvent[event._id] || []).length > 0 ? (
                          (leaderboardByEvent[event._id] || []).map((row) => (
                            <li key={row._id}>
                              #{row.rank || "—"}{" "}
                              {row.teamName || row.teamId?.teamName || "—"}{" "}
                              {row.bullNames ? `(${row.bullNames})` : ""}
                            </li>
                          ))
                        ) : (
                          <li>No results yet.</li>
                        )}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {isFormOpen && (
          <EventForm
            initialData={editingEvent}
            onSubmit={handleSubmit}
            onClose={() => setIsFormOpen(false)}
          />
        )}

        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
            <p className="text-stone-500 font-medium">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
            <p className="text-stone-500 font-medium">No events created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={() => handleEdit(event)}
                onDelete={() => handleDelete(event._id)}
                // Pass a dummy handler or update logic if needed for state update from card
                onStateUpdate={(updatedEvent) => {
                  setEvents((prev) =>
                    prev.map((e) =>
                      e._id === updatedEvent._id ? updatedEvent : e
                    )
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
