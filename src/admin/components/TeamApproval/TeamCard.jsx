import { useEffect } from "react";
import { Calendar, Check, MapPin, Phone, Users, X } from "lucide-react";

const formatLocation = (location) =>
  [location?.village, location?.district, location?.state]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ") || "Not provided";

const formatCategory = (category) => {
  if (!category) return "Category not set";
  if (typeof category === "string") return category;
  if (typeof category === "object") {
    return [category.type, category.value].filter(Boolean).join(": ") || "Category not set";
  }
  return String(category);
};

export default function TeamCard({ team, loading, onApprove, onReject, isOpen, onOpen, onClose }) {
  const status = team.status?.toLowerCase();
  const formattedDate = team.registrationDate
    ? new Date(team.registrationDate).toLocaleDateString()
    : "N/A";

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="w-full bg-white border border-stone-200 rounded-xl p-5 text-left hover:border-amber-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
        aria-label={`View details for ${team.name}`}
      >
        <span className="flex items-center justify-between gap-4">
          <span className="text-xl font-serif text-stone-800 font-medium">{team.name}</span>
          <span className="text-sm text-stone-500">View team details →</span>
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) onClose();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`team-title-${team.id}`}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-stone-100 bg-white p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Team registration</p>
                <h2 id={`team-title-${team.id}`} className="mt-1 text-2xl font-serif text-stone-900">{team.name}</h2>
              </div>
              <button type="button" onClick={onClose} disabled={loading} aria-label="Close team details" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-50">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Team owner</p>
                  <p className="mt-1 font-medium text-stone-800">{team.ownerName || "Not provided"}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-stone-600"><Phone className="h-4 w-4" />{team.phone || "No phone provided"}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Location</p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-stone-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{formatLocation(team.location)}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-stone-600"><Calendar className="h-4 w-4" />Registered {formattedDate}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800">Bulls ({team.bulls.length})</h3>
                {team.bulls.length ? (
                  <ul className="mt-2 divide-y divide-stone-100 rounded-xl border border-stone-200">
                    {team.bulls.map((bull, index) => (
                      <li key={bull?._id || index} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                        <span className="font-medium text-stone-800">{bull?.name || "Unnamed bull"}</span>
                        <span className="text-stone-500">{formatCategory(bull?.currentCategory)}{bull?.status ? ` · ${typeof bull.status === "object" ? bull.status.value || bull.status.type || "" : bull.status}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-sm text-stone-500">No bulls added.</p>}
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-semibold text-stone-800"><Users className="h-4 w-4" />Team members ({team.teamMembers.length})</h3>
                {team.teamMembers.length ? (
                  <ul className="mt-2 divide-y divide-stone-100 rounded-xl border border-stone-200">
                    {team.teamMembers.map((member, index) => (
                      <li key={member?._id || index} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                        <span className="font-medium text-stone-800">{member?.name || "Unnamed member"}</span>
                        <span className="text-stone-500">{[member?.role, member?.phone, member?.info].filter(Boolean).join(" · ") || "Details not provided"}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-sm text-stone-500">No team members added.</p>}
              </div>
            </div>

            {status === "pending" && (
              <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-stone-100 bg-white p-5">
                <button type="button" onClick={() => onReject(team.id)} disabled={loading} className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">
                  <X className="h-4 w-4" />Reject
                </button>
                <button type="button" onClick={() => onApprove(team.id)} disabled={loading} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                  <Check className="h-4 w-4" />{loading ? "Approving…" : "Approve team"}
                </button>
              </footer>
            )}
          </section>
        </div>
      )}
    </>
  );
}
