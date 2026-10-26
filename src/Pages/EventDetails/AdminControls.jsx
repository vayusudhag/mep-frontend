import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { updateEntryPerformance } from "../../services/events/event.api";
import toast from "react-hot-toast";
import { getTeamMembers } from "../../services/teams/index";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessage";

export default function AdminControls({ entry, onUpdated, dayStatus }) {
  const [perf, setPerf] = useState({
    rockWeightKg: entry.performance?.rockWeightKg || "",
    distanceMeters: entry.performance?.distanceMeters || "",
    timeSeconds: entry.performance?.timeSeconds || "",
  });
  const [timeUnit, setTimeUnit] = useState("minutes"); // minutes or seconds
  const [editing, setEditing] = useState(false);
  const [driverOptions, setDriverOptions] = useState([]);
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);

  const teamId = useMemo(() => {
    if (typeof entry?.teamId === "string") return entry.teamId;
    if (entry?.teamId?._id) return entry.teamId._id;
    if (typeof entry?.team === "string") return entry.team;
    if (entry?.team?._id) return entry.team._id;
    return "";
  }, [entry]);

  useEffect(() => {
    const currentDrivers = Array.isArray(entry?.drivers) ? entry.drivers : [];
    if (currentDrivers.length === 0) {
      setSelectedDriverIds([]);
      return;
    }
    setSelectedDriverIds(
      currentDrivers
        .map((d) => (typeof d === "string" ? d : d?._id))
        .filter(Boolean),
    );
  }, [entry?.drivers]);

  useEffect(() => {
    const loadDrivers = async () => {
      if (!teamId) {
        setDriverOptions([]);
        return;
      }
      const members = await getTeamMembers(teamId);
      const drivers = (members || []).filter((m) => m.role === "DRIVER");
      setDriverOptions(drivers);
      if (drivers.length > 0 && selectedDriverIds.length === 0) {
        setSelectedDriverIds(drivers.map((d) => d._id));
      }
    };
    loadDrivers();
  }, [teamId]);

  const toggleDriver = (id) => {
    setSelectedDriverIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const driverPayload =
    selectedDriverIds.length > 0
      ? { driverIds: selectedDriverIds }
      : {};

  const startPlaying = async () => {
    try {
      const res = await updateEntryPerformance(entry._id, {
        status: "PLAYING",
        ...driverPayload,
      });
      onUpdated(res);
    } catch (err) {
      const msg = getUserFriendlyErrorMessage(
        err,
        "Failed to start gameplay.",
      );
      setPerf((p) => p);
      toast.error(msg);
    }
  };
  const complete = async () => {
    try {
      const hasAny =
        perf.rockWeightKg !== "" ||
        perf.distanceMeters !== "" ||
        perf.timeSeconds !== "";
      if (hasAny) {
        const seconds =
          timeUnit === "minutes"
            ? Number(perf.timeSeconds) * 60
            : Number(perf.timeSeconds);
        await updateEntryPerformance(entry._id, {
          rockWeightKg: Number(perf.rockWeightKg),
          distanceMeters: Number(perf.distanceMeters),
          timeSeconds: seconds,
          ...driverPayload,
        });
      }
      const resStatus = await updateEntryPerformance(entry._id, {
        status: "COMPLETED",
        ...driverPayload,
      });
      onUpdated(resStatus);
    } catch (err) {
      const msg = getUserFriendlyErrorMessage(
        err,
        "Failed to complete gameplay.",
      );
      toast.error(msg);
    }
  };
  const savePerformance = async () => {
    try {
      const seconds =
        timeUnit === "minutes"
          ? Number(perf.timeSeconds) * 60
          : Number(perf.timeSeconds);
      const res = await updateEntryPerformance(entry._id, {
        rockWeightKg: Number(perf.rockWeightKg),
        distanceMeters: Number(perf.distanceMeters),
        timeSeconds: seconds,
        ...driverPayload,
      });
      onUpdated(res);
    } catch (err) {
      const msg = getUserFriendlyErrorMessage(
        err,
        "Failed to save performance.",
      );
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
      {entry.gameStatus === "NEXT" && (
        <button
          onClick={startPlaying}
          className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs hover:bg-amber-700"
        >
          Start
        </button>
      )}
      {entry.gameStatus === "PLAYING" && (
        <div className="flex flex-col gap-2 w-full md:w-100">
          <div>
            <label className="text-xs font-medium">Drivers (All who played)</label>
            <div className="mt-1 max-h-24 overflow-y-auto border border-stone-200 rounded-lg p-2 space-y-1 bg-white">
              {driverOptions.map((d) => (
                <label key={d._id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedDriverIds.includes(d._id)}
                    onChange={() => toggleDriver(d._id)}
                  />
                  <span>{d.name}</span>
                </label>
              ))}
            </div>
            {entry?.captain?.name && (
              <p className="text-[11px] text-stone-600 mt-1">
                Captain: {entry.captain.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            <div>
              <label className="text-xs">Rock Weight:</label>
              <input
                type="number"
                min="0"
                className="px-2 py-2 border border-stone-200 rounded-lg text-xs w-full"
                placeholder="Rock kg"
                value={perf.rockWeightKg}
                onChange={(e) =>
                  setPerf({ ...perf, rockWeightKg: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs">Distance:</label>
              <input
                type="number"
                min="0"
                className="px-2 py-2 border border-stone-200 rounded-lg text-xs w-full"
                placeholder="Distance m"
                value={perf.distanceMeters}
                onChange={(e) =>
                  setPerf({ ...perf, distanceMeters: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs">Time:</label>
              <input
                type="number"
                min="0"
                className="px-2 py-2 border border-stone-200 rounded-lg text-xs w-full"
                placeholder={timeUnit === "minutes" ? "Time min" : "Time s"}
                value={perf.timeSeconds}
                onChange={(e) =>
                  setPerf({ ...perf, timeSeconds: e.target.value })
                }
              />
            </div>
          </div>
          <div className="text-xs text-stone-600">
            <label className="mr-2">Time unit:</label>
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className="border border-stone-200 rounded px-2 py-1"
            >
              <option value="minutes">Minutes</option>
              <option value="seconds">Seconds</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={savePerformance}
              className="px-3 py-1 bg-stone-800 text-white rounded-lg text-xs hover:bg-stone-900"
            >
              Save Performance
            </button>
            <button
              onClick={complete}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
            >
              Complete
            </button>
          </div>
        </div>
      )}
      {entry.gameStatus === "COMPLETED" && entry.playedAt && (
        <div className="text-xs text-stone-500">
          Played at {new Date(entry.playedAt).toLocaleString()}
        </div>
      )}
      {entry.gameStatus === "COMPLETED" && !entry.isFinalized && (
        <>
          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setPerf({
                  rockWeightKg: entry.performance?.rockWeightKg ?? "",
                  distanceMeters: entry.performance?.distanceMeters ?? "",
                  timeSeconds:
                    timeUnit === "minutes"
                      ? (entry.performance?.timeSeconds ?? 0) / 60
                      : (entry.performance?.timeSeconds ?? ""),
                });
              }}
              className="px-3 py-1 bg-stone-800 text-white rounded-lg text-xs hover:bg-stone-900"
            >
              Edit Score
            </button>
          ) : (
            <div className="flex flex-col gap-2 w-full md:w-80">
              <div>
                <label className="text-xs font-medium">Drivers (All who played)</label>
                <div className="mt-1 max-h-24 overflow-y-auto border border-stone-200 rounded-lg p-2 space-y-1 bg-white">
                  {driverOptions.map((d) => (
                    <label key={d._id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedDriverIds.includes(d._id)}
                        onChange={() => toggleDriver(d._id)}
                      />
                      <span>{d.name}</span>
                    </label>
                  ))}
                </div>
                {entry?.captain?.name && (
                  <p className="text-[11px] text-stone-600 mt-1">
                    Captain: {entry.captain.name}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  className="p-2 border border-stone-200 rounded-lg text-xs"
                  placeholder="Rock kg"
                  value={perf.rockWeightKg}
                  onChange={(e) =>
                    setPerf({ ...perf, rockWeightKg: e.target.value })
                  }
                />
                <input
                  type="number"
                  min="0"
                  className="p-2 border border-stone-200 rounded-lg text-xs"
                  placeholder="Distance m"
                  value={perf.distanceMeters}
                  onChange={(e) =>
                    setPerf({ ...perf, distanceMeters: e.target.value })
                  }
                />
                <input
                  type="number"
                  min="0"
                  className="p-2 border border-stone-200 rounded-lg text-xs"
                  placeholder={timeUnit === "minutes" ? "Time min" : "Time s"}
                  value={perf.timeSeconds}
                  onChange={(e) =>
                    setPerf({ ...perf, timeSeconds: e.target.value })
                  }
                />
              </div>
              <div className="text-xs text-stone-600">
                <label className="mr-2">Time unit:</label>
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                  className="border border-stone-200 rounded px-2 py-1"
                >
                  <option value="minutes">Minutes</option>
                  <option value="seconds">Seconds</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "Save edited score?",
                      text: "This will update the performance data.",
                      icon: "question",
                      showCancelButton: true,
                      confirmButtonText: "Save",
                      cancelButtonText: "Cancel",
                    });
                    if (!result.isConfirmed) return;
                    try {
                      const seconds =
                        timeUnit === "minutes"
                          ? Number(perf.timeSeconds) * 60
                          : Number(perf.timeSeconds);
                      const res = await updateEntryPerformance(entry._id, {
                        rockWeightKg: Number(perf.rockWeightKg),
                        distanceMeters: Number(perf.distanceMeters),
                        timeSeconds: seconds,
                        ...driverPayload,
                      });
                      onUpdated(res);
                      setEditing(false);
                    } catch (err) {
                      const msg = getUserFriendlyErrorMessage(
                        err,
                        "Failed to save changes.",
                      );
                      toast.error(msg);
                    }
                  }}
                  className="px-3 py-1 bg-stone-800 text-white rounded-lg text-xs hover:bg-stone-900"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs hover:bg-stone-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
