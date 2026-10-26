import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, X, GripHorizontal } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { getUserFriendlyErrorMessage } from "../utils/errorMessage";

const buildEntry = () => ({
  id: `${Date.now()}-${Math.random()}`,
  bulls: ["", ""],
});

const getBullTeamId = (bull) => {
  if (!bull) return null;
  if (typeof bull.teamId === "string") return bull.teamId;
  return bull.teamId?._id || null;
};

export default function EventRegistrationForm({
  event,
  team,
  bulls = [],
  allBulls = [],
  teamMembers = [],
  onSubmit,
  onClose,
}) {
  const { user } = useAuth();
  const [captainName, setCaptainName] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [entries, setEntries] = useState([buildEntry()]);
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const modalRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const ownerName =
    team?.ownerId?.username ||
    team?.ownerId?.name ||
    user?.username ||
    user?.name ||
    "-";

  const sourceBulls = useMemo(() => {
    const pool = Array.isArray(allBulls) && allBulls.length > 0 ? allBulls : bulls;
    return pool
      .filter((b) => b?.status === "ACTIVE" || !b?.status)
      .map((b) => ({
        _id: b._id,
        name: b.name,
        currentCategory: b.currentCategory,
        teamId: getBullTeamId(b),
        teamName: b.teamName || b.teamId?.teamName || team?.teamName || "Unknown Team",
      }));
  }, [allBulls, bulls, team?.teamName]);

  const bullMap = useMemo(
    () => new Map(sourceBulls.map((b) => [String(b._id), b])),
    [sourceBulls],
  );

  useEffect(() => {
    if (user?.mobileNumber) {
      setContactMobile(user.mobileNumber);
    }
  }, [user]);

  const handleDragStart = (e) => {
    if ("ontouchstart" in window) return;

    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      const modal = modalRef.current;
      if (!modal) return;

      const rect = modal.getBoundingClientRect();
      const nextX = e.clientX - dragStart.current.x;
      const nextY = e.clientY - dragStart.current.y;

      const clampedX = Math.min(
        Math.max(nextX, -rect.left),
        window.innerWidth - rect.width - rect.left,
      );

      const clampedY = Math.min(
        Math.max(nextY, -rect.top),
        window.innerHeight - rect.height - rect.top,
      );

      setPosition({ x: clampedX, y: clampedY });
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, position]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // All hooks are declared above; safe to bail out without changing hook order.
  if (!event || !team) return null;

  const updateEntryBull = (entryId, bullIndex, value) => {
    const currentEntry = entries.find((entry) => entry.id === entryId);
    const firstBullId =
      bullIndex === 1 ? currentEntry?.bulls?.[0] : value || currentEntry?.bulls?.[0];
    const secondBullId =
      bullIndex === 1 ? value : currentEntry?.bulls?.[1];

    if (firstBullId && secondBullId) {
      const firstBull = bullMap.get(String(firstBullId));
      const secondBull = bullMap.get(String(secondBullId));
      const sameCategory =
        firstBull?.currentCategory?.type === secondBull?.currentCategory?.type &&
        firstBull?.currentCategory?.value === secondBull?.currentCategory?.value;

      if (!sameCategory) {
        setError("Second bull must be from the same category as the first bull");
        return;
      }
    }

    setError("");
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              bulls: entry.bulls.map((bullId, i) => (i === bullIndex ? value : bullId)),
            }
          : entry,
      ),
    );
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, buildEntry()]);
  };

  const removeEntry = (entryId) => {
    setEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== entryId);
      return next.length > 0 ? next : [buildEntry()];
    });
  };

  const toggleTeamMember = (personId) => {
    setSelectedTeamMemberIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId],
    );
  };

  const allSelectedBullIds = entries
    .flatMap((entry) => entry.bulls)
    .filter(Boolean)
    .map(String);

  const getOptionsForEntry = (entryId, bullIndex) => {
    const currentEntry = entries.find((entry) => entry.id === entryId);
    const selectedInEntry = currentEntry?.bulls?.[bullIndex] || "";
    const firstBullId = currentEntry?.bulls?.[0] || "";
    const firstBull = bullMap.get(String(firstBullId));

    return sourceBulls.filter((bull) => {
      const otherBullId =
        bullIndex === 0 ? currentEntry?.bulls?.[1] : currentEntry?.bulls?.[0];
      if (otherBullId && String(otherBullId) === String(bull._id)) return false;
      if (bullIndex === 1 && firstBullId) {
        const sameCategory =
          bull.currentCategory?.type === firstBull?.currentCategory?.type &&
          bull.currentCategory?.value === firstBull?.currentCategory?.value;
        if (!sameCategory) return false;
      }
      if (selectedInEntry && String(selectedInEntry) === String(bull._id)) return true;
      return true;
    });
  };

  const getGroupedOptionsForEntry = (entryId, bullIndex) => {
    const options = getOptionsForEntry(entryId, bullIndex);
    const myTeamId = String(team?._id || "");

    return {
      ownBulls: options.filter(
        (bull) => String(getBullTeamId(bull)) === myTeamId,
      ),
      otherTeamBulls: options.filter(
        (bull) => String(getBullTeamId(bull)) !== myTeamId,
      ),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!captainName.trim()) return setError("Captain name is required");
    if (!contactMobile.trim()) return setError("Contact mobile is required");
    if (!/^\d{10}$/.test(contactMobile.trim())) {
      return setError("Enter a valid 10-digit mobile number");
    }
    if (selectedTeamMemberIds.length < 5) {
      return setError("Select at least 5 team members");
    }

    const normalizedEntries = entries
      .map((entry) => ({
        bulls: entry.bulls.filter(Boolean),
      }))
      .filter((entry) => entry.bulls.length > 0);

    if (normalizedEntries.length === 0) {
      return setError("At least one entry is required");
    }

    for (const entry of normalizedEntries) {
      if (entry.bulls.length < 1 || entry.bulls.length > 2) {
        return setError("Each entry must have 1 or 2 bulls");
      }

      if (entry.bulls.length === 2) {
        const a = bullMap.get(String(entry.bulls[0]));
        const b = bullMap.get(String(entry.bulls[1]));

        if (!a || !b) {
          return setError("Invalid bull selection");
        }

        const sameCategory =
          a.currentCategory?.type === b.currentCategory?.type &&
          a.currentCategory?.value === b.currentCategory?.value;

        if (!sameCategory) {
          return setError("Paired bulls must belong to the same category");
        }
      }
    }

    const payloadEntries = normalizedEntries.map((entry) => {
      const selected = entry.bulls.map((id) => bullMap.get(String(id))).filter(Boolean);
      const borrowed = selected.filter(
        (bull) => String(getBullTeamId(bull)) !== String(team?._id),
      );

      return {
        bulls: entry.bulls,
        entryType: entry.bulls.length === 2 ? "PAIR_BULL" : "SINGLE_BULL",
        borrowedFromTeamId: borrowed.length === 1 ? getBullTeamId(borrowed[0]) : null,
      };
    });

    try {
      setSubmitting(true);
      await onSubmit({
        captainName: captainName.trim(),
        contactMobile: contactMobile.trim(),
        entries: payloadEntries,
        teamMembers: selectedTeamMemberIds,
      });
      onClose();
    } catch (err) {
      const msg = getUserFriendlyErrorMessage(
        err,
        "Registration failed. Please try again.",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y rounded-xl shadow-xl border border-stone-200"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 cursor-move select-none"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal size={18} className="text-stone-400" />
            <h3 className="font-serif font-medium text-stone-800">
              Register for {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-stone-50 p-3 rounded-lg text-sm border border-stone-200">
            <b>Team:</b> {team.teamName}
            <br />
            <b>Owner:</b> {ownerName}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">
              Captain Name
            </label>
            <input
              type="text"
              className="input w-full"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="Enter captain name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">
              Contact Mobile Number
            </label>
            <input
              type="tel"
              className="input w-full"
              value={contactMobile}
              onChange={(e) => setContactMobile(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
            />
          </div>

          <div>
            <p className="font-medium text-sm mb-1 text-stone-700">
              Team Members
            </p>
            <div className="max-h-[140px] overflow-y-auto border border-stone-200 rounded-lg p-2 space-y-2">
              {teamMembers.length === 0 ? (
                <p className="text-xs text-stone-500">No team members found.</p>
              ) : (
                teamMembers.map((m) => (
                  <label key={m._id} className="flex items-center gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={selectedTeamMemberIds.includes(m._id)}
                      onChange={() => toggleTeamMember(m._id)}
                    />
                    <span>
                      {m.name} {m.role ? `- ${m.role}` : ""}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium text-sm text-stone-700">Entry Builder</p>
            <button
              type="button"
              onClick={addEntry}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-stone-800 text-white hover:bg-stone-900"
            >
              <Plus className="w-4 h-4" /> Add Entry
            </button>
          </div>

          <div className="space-y-3">
            {entries.map((entry, index) => {
              const selectedA = bullMap.get(String(entry.bulls[0] || ""));
              const selectedB = bullMap.get(String(entry.bulls[1] || ""));
              const entryType = entry.bulls[1] ? "PAIR_BULL" : entry.bulls[0] ? "SINGLE_BULL" : "-";
              const bull1Options = getGroupedOptionsForEntry(entry.id, 0);
              const bull2Options = getGroupedOptionsForEntry(entry.id, 1);

              const borrowedInEntry = [selectedA, selectedB]
                .filter(Boolean)
                .filter((bull) => String(getBullTeamId(bull)) !== String(team?._id));

              return (
                <div key={entry.id} className="border border-stone-200 rounded-lg p-3 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-stone-700">Entry {index + 1}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                        {entryType}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="p-1 rounded text-red-600 hover:bg-red-50"
                        title="Remove entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Bull 1 (Required)</label>
                      <select
                        value={entry.bulls[0]}
                        onChange={(e) => updateEntryBull(entry.id, 0, e.target.value)}
                        className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                      >
                        <option value="">Select bull</option>
                        {bull1Options.ownBulls.length > 0 && (
                          <optgroup label="Your Team Bulls">
                            {bull1Options.ownBulls.map((bull) => (
                              <option key={bull._id} value={bull._id}>
                                {bull.name} ({bull.currentCategory?.value || "-"})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {bull1Options.otherTeamBulls.length > 0 && (
                          <optgroup label="Other Teams Bulls">
                            {bull1Options.otherTeamBulls.map((bull) => (
                              <option key={bull._id} value={bull._id}>
                                {bull.name} ({bull.currentCategory?.value || "-"}) - {bull.teamName}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Bull 2 (Optional)</label>
                      <select
                        value={entry.bulls[1]}
                        onChange={(e) => updateEntryBull(entry.id, 1, e.target.value)}
                        className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                      >
                        <option value="">No pair</option>
                        {bull2Options.ownBulls.length > 0 && (
                          <optgroup label="Your Team Bulls">
                            {bull2Options.ownBulls.map((bull) => (
                              <option key={bull._id} value={bull._id}>
                                {bull.name} ({bull.currentCategory?.value || "-"})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {bull2Options.otherTeamBulls.length > 0 && (
                          <optgroup label="Other Teams Bulls">
                            {bull2Options.otherTeamBulls.map((bull) => (
                              <option key={bull._id} value={bull._id}>
                                {bull.name} ({bull.currentCategory?.value || "-"}) - {bull.teamName}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>

                  {borrowedInEntry.length > 0 && (
                    <p className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1 inline-block">
                      Borrowed bull from {borrowedInEntry[0]?.teamName || "another team"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {allSelectedBullIds.length === 0 && (
            <p className="text-xs text-stone-500">Select at least one bull in entries.</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
            >
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
