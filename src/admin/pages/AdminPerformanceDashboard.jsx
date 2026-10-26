import { useState, useEffect } from "react";
import {
  getAllEvents,
} from "../../services/events/event.api";
import {
  getApprovedParticipants,
  recordTeamPerformance,
} from "../../services/events/event.api";
import toast from "react-hot-toast";
import { CheckCircle, Lock, PlayCircle, Trophy } from "lucide-react";

export default function AdminPerformanceDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordingId, setRecordingId] = useState(null); // ID of team being recorded
  
  // Form State
  const [formData, setFormData] = useState({
    distanceCovered: "",
    timeTaken: "",
    rockWeight: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchTeams(selectedEventId);
    } else {
      setTeams([]);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const res = await getAllEvents();
      // Only show events that are NOT COMPLETED? Or all events?
      // User said "Performance can be recorded only when event status is LIVE".
      // But maybe we want to view past records too. I'll show all but indicate status.
      setEvents(res.data.data);
    } catch (err) {
      toast.error("Failed to load events");
    }
  };

  const fetchTeams = async (eventId) => {
    setLoading(true);
    try {
      const res = await getApprovedParticipants(eventId);
      setTeams(res.data.data);
    } catch (err) {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordClick = (team) => {
    setRecordingId(team.team._id);
    setFormData({
      distanceCovered: "",
      timeTaken: "",
      rockWeight: "",
    });
  };

  const handleCancel = () => {
    setRecordingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !recordingId) return;

    try {
      await recordTeamPerformance(selectedEventId, {
        teamId: recordingId,
        distanceCovered: Number(formData.distanceCovered),
        timeTaken: Number(formData.timeTaken),
        rockWeight: Number(formData.rockWeight),
      });

      toast.success("Performance recorded successfully");
      setRecordingId(null);
      fetchTeams(selectedEventId); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record performance");
    }
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="min-h-screen bg-[#fbf6ee] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-stone-800 font-medium mb-2">
              Performance Dashboard
            </h1>
            <p className="text-stone-600">
              Record and manage team performance
            </p>
          </div>
          
          {selectedEvent && (
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                selectedEvent.state === "ONGOING"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-stone-100 text-stone-600 border-stone-200"
              }`}
            >
              Status: {selectedEvent.state}
            </span>
          )}
        </div>

        {/* Event Selector */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Select Active Event
          </label>
          <select
            className="w-full md:w-1/2 p-2.5 bg-white border border-stone-200 text-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer transition-shadow"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">-- Choose Event --</option>
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title} ({new Date(evt.timings.from).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {/* Teams List */}
        {selectedEventId && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h2 className="font-serif font-medium text-stone-800">Team Run Order</h2>
              <span className="text-sm text-stone-500">
                {teams.length} Teams Qualified
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
                <p className="text-stone-500 font-medium">Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="p-12 text-center text-stone-500 font-medium">
                No approved teams found for this event.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {teams.map((item) => (
                  <div
                    key={item.registrationId}
                    className={`p-6 transition-colors ${
                      item.hasPlayed ? "bg-emerald-50/30" : "hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Team Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-serif font-bold text-xl border border-amber-100 shadow-sm">
                          {item.registrationOrder}
                        </div>
                        <div>
                          <h3 className="text-lg font-serif text-stone-800 font-medium">
                            {item.team.teamName}
                          </h3>
                          <p className="text-sm text-stone-500">
                            Captain: {item.captainName}
                          </p>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-4 w-full lg:w-auto">
                        {item.hasPlayed ? (
                          <div className="flex items-center gap-2 text-emerald-700 font-medium bg-emerald-50 px-4 py-2 rounded-lg text-sm border border-emerald-100 ml-auto lg:ml-0">
                            <CheckCircle size={18} />
                            <span>Performance Recorded</span>
                          </div>
                        ) : recordingId === item.team._id ? (
                          // Recording Form
                          <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-3 items-end w-full"
                          >
                            <div className="w-full sm:w-24">
                              <label className="text-xs font-medium text-stone-500 block mb-1">Dist (m)</label>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full p-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                value={formData.distanceCovered}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    distanceCovered: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="w-full sm:w-24">
                              <label className="text-xs font-medium text-stone-500 block mb-1">Time (s)</label>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full p-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                value={formData.timeTaken}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    timeTaken: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="w-full sm:w-24">
                              <label className="text-xs font-medium text-stone-500 block mb-1">Weight (kg)</label>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full p-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                value={formData.rockWeight}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    rockWeight: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              <button
                                type="submit"
                                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-stone-200 text-stone-600 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          // Record Button
                          <button
                            onClick={() => handleRecordClick(item)}
                            disabled={selectedEvent.state !== "ONGOING"}
                            title={
                              selectedEvent.state !== "ONGOING"
                                ? "Event must be LIVE to record"
                                : ""
                            }
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm ml-auto lg:ml-0 ${
                              selectedEvent.state === "ONGOING"
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                            }`}
                          >
                            {selectedEvent.state !== "ONGOING" ? (
                              <Lock size={16} />
                            ) : (
                              <PlayCircle size={16} />
                            )}
                            Record Run
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
