import { useEffect, useState } from "react";
import {
  fetchEventRegistrations,
  updateRegistrationStatus,
} from "../../services/events/eventRegistraion.api";
import { getAllEvents } from "../../services/events/event.api";
import { Check, X, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function AdminEventRegistrations() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // ID of processing item

  // Modal State
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadRegistrations(selectedEventId);
    } else {
      setRegistrations([]);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const eventList = await getAllEvents();
      setEvents(eventList);
      if (eventList.length > 0) {
        setSelectedEventId(eventList[0]._id);
      }
    } catch (err) {
      console.error("Failed to load events", err);
      toast.error("Failed to load events");
    }
  };

  const loadRegistrations = async (eventId) => {
    setLoading(true);
    try {
      const regs = await fetchEventRegistrations(eventId);
      setRegistrations(Array.isArray(regs) ? regs : []);
    } catch (err) {
      console.error("Failed to load registrations", err);
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Approve Registration?",
      text: "This will approve the team registration for the event.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    setActionLoading(id);
    try {
      await updateRegistrationStatus(id, "APPROVED");
      setRegistrations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "APPROVED" } : r)),
      );
      toast.success("Registration Approved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectModal({ open: true, id });
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Reason is required");
      return;
    }

    setActionLoading(rejectModal.id);
    try {
      await updateRegistrationStatus(rejectModal.id, "REJECTED", rejectReason);
      setRegistrations((prev) =>
        prev.map((r) =>
          r._id === rejectModal.id ? { ...r, status: "REJECTED" } : r,
        ),
      );
      toast.success("Registration Rejected");
      setRejectModal({ open: false, id: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf6ee] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-stone-800 font-medium mb-2">
              Event Registrations
            </h1>
            <p className="text-stone-600">
              Manage participant registrations for your events
            </p>
          </div>

          {/* Event Selector */}
          <div className="relative">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="appearance-none w-full md:w-64 bg-white border border-stone-200 text-stone-700 py-2.5 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm cursor-pointer"
            >
              {events.map((evt) => (
                <option key={evt._id} value={evt._id}>
                  {evt.title}
                </option>
              ))}
              {events.length === 0 && <option>No events found</option>}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
            <p className="text-stone-500 font-medium">
              Loading registrations...
            </p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
            <p className="text-stone-500 font-medium">
              No registrations found for this event.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Team / Owner
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Bulls
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {registrations.map((reg) => (
                    <tr
                      key={reg._id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-800">
                          {reg.team?.teamName || "Unknown Team"}
                        </div>
                        <div className="text-sm text-stone-500">
                          Captain: {reg.captainName || "N/A"}
                        </div>
                        <div className="text-sm text-stone-500">
                          Mobile: {reg.contactMobile || "N/A"}
                        </div>
                        <div className="text-xs text-stone-400">
                          Reg. by: {reg.registeredBy?.username || "N/A"}
                        </div>
                        <div className="text-xs text-stone-500">
                          Members:{" "}
                          {Array.isArray(reg.teamMembers) &&
                          reg.teamMembers.length > 0
                            ? reg.teamMembers
                                .map((m) => m?.name)
                                .filter(Boolean)
                                .join(", ")
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-600 text-sm">
                        {Array.isArray(reg.entries) && reg.entries.length > 0
                          ? reg.entries
                              .map((entry, idx) => {
                                const names = (entry?.bulls || [])
                                  .map((b) => b?.name)
                                  .filter(Boolean)
                                  .join(" + ");
                                return `${idx + 1}: ${names || "N/A"}`;
                              })
                              .join(" | ")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {Array.isArray(reg.entries) &&
                        reg.entries.length > 0 ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                            {[
                              ...new Set(
                                reg.entries
                                  .flatMap((entry) => entry?.bulls || [])
                                  .map((b) => b?.currentCategory?.value)
                                  .filter(Boolean),
                              ),
                            ].join(", ") ||
                              [
                                ...new Set(
                                  reg.entries
                                    .map(
                                      (entry) =>
                                        entry?.bullCategoryAtThatTime?.value ||
                                        entry?.bullCategorySnapshot?.value,
                                    )
                                    .filter(Boolean),
                                ),
                              ].join(", ") ||
                              "N/A"}
                          </span>
                        ) : (
                          <span className="text-stone-500 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            reg.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : reg.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {reg.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(reg._id)}
                              disabled={actionLoading === reg._id}
                              className="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(reg._id)}
                              disabled={actionLoading === reg._id}
                              className="inline-flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200">
              <h3 className="text-xl font-serif text-stone-800 mb-4">
                Reject Registration
              </h3>
              <textarea
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none text-stone-700 mb-4"
                rows="3"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRejectModal({ open: false, id: null })}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-50 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading === rejectModal.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  {actionLoading === rejectModal.id
                    ? "Rejecting..."
                    : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
