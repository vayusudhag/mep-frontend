import React from "react";

export default function TeamSection({
  team,
  navigate,
}) {
  if (!team) {
    return (
      <div className="border-b border-stone-200 pb-6">
        <h2 className="text-xl font-serif font-medium text-stone-800 mb-4">
          My Team
        </h2>
        <div className="bg-stone-50 rounded-lg p-6 text-center border border-stone-200">
          <p className="text-stone-600">You haven&apos;t created a team yet.</p>
          <button
            onClick={() => navigate("/bulls")}
            className="mt-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Create Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-stone-200 pb-6">
      <h2 className="text-xl font-serif font-medium text-stone-800 mb-4">
        My Team
      </h2>
      <div className="bg-stone-50 rounded-lg p-4 space-y-4 border border-stone-200">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Team Name
            </label>
            <p className="mt-1 text-sm text-stone-800">{team.teamName}</p>
          </div>
          <button
            onClick={() => navigate(`/profile/team/edit/${team._id}`)}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Edit Team
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            Location
          </label>
          <p className="mt-1 text-sm text-stone-800">
            {[
              team.teamLocation?.village,
              team.teamLocation?.district,
              team.teamLocation?.state,
            ]
              .filter(Boolean)
              .join(", ") || "Not specified"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Bulls
          </label>
          <div className="space-y-2">
            {(team.bulls || []).map((bull) => (
              <div
                key={bull._id}
                className="bg-white p-3 rounded border border-stone-200"
              >
                <p className="font-medium">{bull.name}</p>
                <p className="text-sm text-stone-600">
                  Category: {(bull.currentCategory?.value || "").replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            Captain
          </label>
          <p className="mt-1 text-sm text-stone-800">
            {(team.teamMembers || [])
              .filter((member) => member.role === "CAPTAIN")
              .map((member) => member.name)
              .filter(Boolean)
              .join(", ") || "Not assigned"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Team Members
          </label>
          <div className="space-y-2">
            {(team.teamMembers || []).map((member) => (
              <div
                key={member._id}
                className="bg-white p-3 rounded border border-stone-200"
              >
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-stone-600">Role: {member.role}</p>
                {member.info && (
                  <p className="text-sm text-stone-600">Info: {member.info}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            Status
          </label>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
              team.status === "APPROVED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : team.status === "PENDING"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {team.status}
          </span>
        </div>
      </div>
    </div>
  );
}
