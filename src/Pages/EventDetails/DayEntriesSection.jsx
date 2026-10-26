import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  calculateDayResults,
  createEventDayEntry,
  getEventDayEntries,
  getAvailableBullsForDay,
} from "../../services/events/event.api";
import AdminControls from "./AdminControls";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessage";

export default function DayEntriesSection({
  eventId,
  dayId,
  dayStatus,
  selectedDay,
  entries,
  setEntries,
  isAdmin,
}) {
  const [syncing, setSyncing] = useState(false);
  const [availableBulls, setAvailableBulls] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);

  const resultsCalculated =
    entries.length > 0 && entries.every((e) => e.isFinalized);
  const allCompleted =
    entries.length > 0 && entries.every((e) => e.gameStatus === "COMPLETED");

  const rankedEntries = useMemo(() => {
    if (!resultsCalculated) return [];
    return [...entries].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [entries, resultsCalculated]);

  const handleCalculate = async () => {
    const isRecalc = resultsCalculated;
    const message = isRecalc
      ? "Recalculate results? This will update existing rankings."
      : "Calculate results? This cannot be undone.";
    const result = await Swal.fire({
      title: isRecalc ? "Recalculate Results" : "Calculate Results",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isRecalc ? "Recalculate" : "Calculate",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await calculateDayResults(dayId);
      const res = await getEventDayEntries(eventId, dayId);
      setEntries(Array.isArray(res) ? res : []);
      toast.success(isRecalc ? "Results recalculated!" : "Results calculated!");
    } catch (err) {
      const msg = getUserFriendlyErrorMessage(
        err,
        "Failed to calculate results.",
      );
      toast.error(msg);
    }
  };

  const handleSyncDeclaredEntries = async () => {
    if (!["UPCOMING", "ONGOING"].includes(dayStatus)) {
      toast.error(
        "Entries can only be synced while day status is UPCOMING or ONGOING",
      );
      return;
    }

    try {
      setSyncing(true);
      await createEventDayEntry(eventId, dayId, {});
      const res = await getEventDayEntries(eventId, dayId);
      setEntries(Array.isArray(res) ? res : []);
      const avail = await getAvailableBullsForDay(eventId, dayId);
      setAvailableBulls(Array.isArray(avail) ? avail : []);
      toast.success("Declared entries synced successfully");
    } catch (err) {
      const msg = getUserFriendlyErrorMessage(
        err,
        "Failed to sync declared entries.",
      );
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || !eventId || !dayId) return;
    const loadAvailable = async () => {
      try {
        setAvailableLoading(true);
        const avail = await getAvailableBullsForDay(eventId, dayId);
        setAvailableBulls(Array.isArray(avail) ? avail : []);
      } catch {
        setAvailableBulls([]);
      } finally {
        setAvailableLoading(false);
      }
    };
    loadAvailable();
  }, [eventId, dayId, isAdmin, dayStatus, entries.length]);

  if (resultsCalculated) {
    return (
      <div className="mt-6 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
            <h3 className="text-lg font-serif font-medium text-stone-800">
              Results
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3 font-medium text-stone-500">Rank</th>
                  <th className="px-6 py-3 font-medium text-stone-500">
                    Bulls
                  </th>
                  <th className="px-6 py-3 font-medium text-stone-500">Team</th>
                  <th className="px-6 py-3 font-medium text-stone-500 text-right">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rankedEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 font-bold text-stone-800">
                      #{entry.rank}
                    </td>
                    <td className="px-6 py-4 text-stone-800">
                      {(entry.bulls || [])
                        .map((b) => b?.name)
                        .filter(Boolean)
                        .join(" & ") || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {entry.team?.teamName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-stone-800">
                        {entry.performance?.distanceMeters}m
                      </div>
                      <div className="text-xs text-stone-500">
                        {(entry.performance?.timeSeconds || 0) / 60} min •{" "}
                        {entry.performance?.rockWeightKg}kg
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {isAdmin && (
        <div className="mb-4 bg-white border border-stone-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-serif font-medium text-stone-800">
              Available Bulls for This Day
            </h4>
            {selectedDay?.category?.value && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                {selectedDay.category.value.replace(/_/g, " ")}
              </span>
            )}
          </div>
          {availableLoading ? (
            <p className="text-sm text-stone-500">Loading available bulls...</p>
          ) : availableBulls.length === 0 ? (
            <p className="text-sm text-stone-500">
              No available bulls for this day.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableBulls.map((b) => (
                <div
                  key={b.bullId || b._id}
                  className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="text-stone-800 font-medium">
                    {b.name || "—"}
                  </div>
                  <div className="text-stone-500 text-xs">
                    {b.teamName || "Unknown Team"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
        <h3 className="font-serif font-medium text-stone-800">Matches</h3>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={handleSyncDeclaredEntries}
              className="px-3 py-2 bg-stone-800 text-white rounded-lg text-sm"
              disabled={syncing || !["UPCOMING", "ONGOING"].includes(dayStatus)}
            >
              {syncing
                ? "Syncing..."
                : entries.length > 0
                  ? "Refresh Declared Entries"
                  : "Sync Declared Entries"}
            </button>
          )}
          {isAdmin && allCompleted && (
            <button
              onClick={handleCalculate}
              className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
            >
              {resultsCalculated ? "Recalculate Results" : "Calculate Results"}
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="p-8 text-center text-stone-500 italic">
          No declared entries found for this day.
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                entry.gameStatus === "PLAYING" ? "bg-amber-50" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-stone-800">
                    {(entry.bulls || []).map((b) => b.name).join(" & ")}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      entry.gameStatus === "COMPLETED"
                        ? "bg-stone-100 text-stone-600"
                        : entry.gameStatus === "PLAYING"
                          ? "bg-amber-100 text-amber-700 animate-pulse"
                          : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {entry.gameStatus}
                  </span>
                  {selectedDay?.category?.value && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                      {selectedDay.category.value.replace(/_/g, " ")}
                    </span>
                  )}
                  {entry.borrowedBullFromTeam?.teamName && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Borrowed: {entry.borrowedBullFromTeam.teamName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-500">
                  {entry.team?.teamName || "Unknown"}
                </p>
                {entry.captain?.name && (
                  <p className="text-xs text-stone-500">
                    Captain: {entry.captain.name}
                  </p>
                )}
                {Array.isArray(entry.drivers) && entry.drivers.length > 0 && (
                  <p className="text-xs text-stone-500">
                    Driver:{" "}
                    {entry.drivers
                      .map((d) => (typeof d === "string" ? d : d?.name))
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {(entry.performance?.distanceMeters > 0 ||
                  entry.performance?.timeSeconds > 0) && (
                  <div className="mt-1 text-xs text-stone-600 flex gap-3">
                    <span>{entry.performance?.distanceMeters}m</span>
                    <span>
                      {(entry.performance?.timeSeconds || 0) / 60} min
                    </span>
                    <span>{entry.performance?.rockWeightKg}kg</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <AdminControls
                  entry={entry}
                  dayStatus={dayStatus}
                  onUpdated={(updated) => {
                    setEntries((prev) =>
                      prev.map((e) => {
                        if (e._id !== updated._id) return e;

                        const bullsLooksUnpopulated =
                          Array.isArray(updated?.bulls) &&
                          updated.bulls.some((b) => typeof b === "string");

                        return {
                          ...e,
                          ...updated,
                          bulls: bullsLooksUnpopulated
                            ? e.bulls
                            : updated.bulls,
                          team:
                            updated?.team && typeof updated.team === "object"
                              ? updated.team
                              : e.team,
                          captain:
                            updated?.captain &&
                            typeof updated.captain === "object"
                              ? updated.captain
                              : e.captain,
                          borrowedBullFromTeam:
                            updated?.borrowedBullFromTeam &&
                            typeof updated.borrowedBullFromTeam === "object"
                              ? updated.borrowedBullFromTeam
                              : e.borrowedBullFromTeam,
                          drivers:
                            Array.isArray(updated?.drivers) &&
                            updated.drivers.length > 0
                              ? updated.drivers
                              : e.drivers,
                        };
                      }),
                    );
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
