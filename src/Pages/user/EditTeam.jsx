import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTeamByIdApi as getTeamById,
  updateTeamRoster,
} from "../../services/teams/index";
import {
  scheduleDeleteBull,
  revokeDeleteBull,
  getBullsByTeam,
} from "../../services/bulls/bulls.api";
import toast from "react-hot-toast";

const CATEGORY_MAP = {
  milk_teeth: { type: "DENTITION", value: "MILK" },
  two_teeth: { type: "DENTITION", value: "TWO" },
  four_teeth: { type: "DENTITION", value: "FOUR" },
  six_teeth: { type: "DENTITION", value: "SIX" },
  sub_junior: { type: "AGE_GROUP", value: "SUB_JUNIOR" },
  junior: { type: "AGE_GROUP", value: "JUNIOR" },
  senior: { type: "AGE_GROUP", value: "SENIOR" },
  general: { type: "CLASS", value: "GENERAL" },
  new: { type: "CLASS", value: "NEW" },
  old: { type: "CLASS", value: "OLD" },
};

const getCategoryKey = (category) => {
  const type = category?.type;
  const value = category?.value;
  const map = {
    "DENTITION:MILK": "milk_teeth",
    "DENTITION:TWO": "two_teeth",
    "DENTITION:FOUR": "four_teeth",
    "DENTITION:SIX": "six_teeth",
    "AGE_GROUP:SUB_JUNIOR": "sub_junior",
    "AGE_GROUP:JUNIOR": "junior",
    "AGE_GROUP:SENIOR": "senior",
    "CLASS:GENERAL": "general",
    "CLASS:NEW": "new",
    "CLASS:OLD": "old",
  };
  return map[`${type}:${value}`] || "senior";
};

const normalizeTeam = (raw) => ({
  _id: raw?._id || "",
  teamName: raw?.teamName || "",
  ownerName: raw?.ownerId?.username || "",
  teamLocation: {
    village: raw?.teamLocation?.village || "",
    district: raw?.teamLocation?.district || "",
    state: raw?.teamLocation?.state || "",
  },
  bulls: Array.isArray(raw?.bulls)
    ? raw.bulls.map((bull) => ({
        _id: bull?._id,
        name: bull?.name || "",
        currentCategory: bull?.currentCategory || CATEGORY_MAP.senior,
        isDeleted: Boolean(bull?.isDeleted),
        deletionRequestedAt: bull?.deletionRequestedAt || null,
      }))
    : [],
  teamMembers: Array.isArray(raw?.teamMembers)
    ? raw.teamMembers.map((member) => ({
        _id: member?._id,
        name: member?.name || "",
        role: member?.role || "HELPER",
        phone: member?.phone || "",
        info: member?.info || "",
      }))
    : [],
});

export default function EditTeam() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    bull: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const response = await getTeamById(teamId);
        const payload = response?.data?.data || response?.data || response;
        const normalized = normalizeTeam(payload);
        setTeam(normalized);
      } catch {
        toast.error("Failed to load team");
      }
    };
    loadTeam();
  }, [teamId]);

  if (!team) return <div>Loading...</div>;

  const handleSave = async () => {
    if (!String(team.teamName || "").trim()) {
      toast.error("Team name is required");
      return;
    }
    if (!String(team.ownerName || "").trim()) {
      toast.error("Owner name is required");
      return;
    }
    const invalidBull = (team.bulls || []).find(
      (b) => !String(b?.name || "").trim() && !b?.isDeleted,
    );
    if (invalidBull) {
      toast.error("Bull name is required");
      return;
    }
    const invalidMember = (team.teamMembers || []).find(
      (m) => !String(m?.name || "").trim(),
    );
    if (invalidMember) {
      toast.error("Team member name is required");
      return;
    }
    if (!String(team.teamName || "").trim()) {
      toast.error("Team name is required");
      return;
    }
    if (!String(team.ownerName || "").trim()) {
      toast.error("Owner name is required");
      return;
    }
    const hasCaptain = (team.teamMembers || []).some(
      (member) =>
        String(member?.role || "").toUpperCase() === "CAPTAIN" &&
        String(member?.name || "").trim(),
    );
    if (!hasCaptain) {
      toast.error("At least one captain is required");
      return;
    }

    try {
      setSaving(true);
      await updateTeamRoster(teamId, {
        teamName: team.teamName,
        ownerName: team.ownerName,
        bulls: team.bulls,
        teamMembers: team.teamMembers,
        teamLocation: team.teamLocation,
      });
      toast.success("Team updated successfully");
      navigate("/profile");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.message ||
          "Update failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.bull?._id) return;
    try {
      setDeleteLoading(true);
      const updated = await scheduleDeleteBull(deleteModal.bull._id);
      setTeam((prev) => ({
        ...prev,
        bulls: prev.bulls.map((b) =>
          b._id === updated._id
            ? {
                ...b,
                isDeleted: true,
                deletionRequestedAt: updated.deletionRequestedAt,
              }
            : b,
        ),
      }));
      toast.success(
        "Bull scheduled for deletion. You can revoke within 15 days.",
      );
      setDeleteModal({ open: false, bull: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRevokeDelete = async (bullId) => {
    try {
      const updated = await revokeDeleteBull(bullId);
      setTeam((prev) => ({
        ...prev,
        bulls: prev.bulls.map((b) =>
          b._id === updated._id
            ? { ...b, isDeleted: false, deletionRequestedAt: null }
            : b,
        ),
      }));
      toast.success("Deletion revoked successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Revoke failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Team: {team.teamName}</h1>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="px-3 py-2 rounded border border-stone-300 text-stone-700 hover:bg-stone-50"
        >
          Back to Profile
        </button>
      </div>

      <section className="space-y-4">
        <h2 className="font-medium">Team Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={team.teamName}
            onChange={(e) =>
              setTeam((prev) => ({ ...prev, teamName: e.target.value }))
            }
            placeholder="Team Name"
            className="border p-2 rounded w-full"
          />
          <input
            value={team.ownerName}
            onChange={(e) =>
              setTeam((prev) => ({ ...prev, ownerName: e.target.value }))
            }
            placeholder="Owner Name"
            className="border p-2 rounded w-full"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-medium">Team Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={team.teamName}
            onChange={(e) =>
              setTeam((prev) => ({ ...prev, teamName: e.target.value }))
            }
            placeholder="Team Name"
            className="border p-2 rounded w-full"
          />
          <input
            value={team.ownerName}
            onChange={(e) =>
              setTeam((prev) => ({ ...prev, ownerName: e.target.value }))
            }
            placeholder="Owner Name"
            className="border p-2 rounded w-full"
          />
        </div>
      </section>

      <LocationSection team={team} setTeam={setTeam} />
      <BullsSection
        team={team}
        setTeam={setTeam}
        onDelete={(bull) => setDeleteModal({ open: true, bull })}
        onRevoke={handleRevokeDelete}
      />
      <TeamMembersSection team={team} setTeam={setTeam} />

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-amber-600 text-white rounded"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {deleteModal.open && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              Schedule Bull Deletion?
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              Deleting this bull will remove its active availability. Historical
              participation data will remain. The bull will be permanently
              deleted after 15 days. You can revoke deletion within this period.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal({ open: false, bull: null })}
                className="px-4 py-2 rounded border border-stone-200 text-stone-700"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Scheduling..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BullsSection({ team, setTeam, onDelete, onRevoke }) {
  const updateBull = (i, field, value) => {
    const updated = [...team.bulls];
    if (field === "name") {
      updated[i].name = value;
    } else if (field === "categoryKey") {
      updated[i].currentCategory = CATEGORY_MAP[value] || CATEGORY_MAP.senior;
    }
    setTeam((prev) => ({ ...prev, bulls: updated }));
  };

  const addBull = () => {
    setTeam((prev) => ({
      ...prev,
      bulls: [
        ...prev.bulls,
        {
          name: "",
          currentCategory: CATEGORY_MAP.senior,
        },
      ],
    }));
  };
  const removeBull = (index) => {
    const bull = team.bulls[index];
    if (bull?._id) {
      onDelete(bull);
      return;
    }
    setTeam((prev) => ({
      ...prev,
      bulls: prev.bulls.filter((_, i) => i !== index),
    }));
  };

  const getDaysRemaining = (date) => {
    if (!date) return null;
    const cutoff = new Date(date);
    cutoff.setDate(cutoff.getDate() + 15);
    const ms = cutoff.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  return (
    <section className="space-y-4">
      <h2 className="font-medium">Bulls</h2>

      {(team.bulls || []).map((bull, i) => (
        <div key={bull._id || i} className="border p-3 rounded space-y-2">
          {bull.isDeleted && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded px-2 py-1 text-xs text-amber-800">
              <span>Scheduled for Deletion</span>
              <span>
                {getDaysRemaining(bull.deletionRequestedAt)} days remaining
              </span>
            </div>
          )}
          <input
            value={bull.name}
            disabled={bull.isDeleted}
            onChange={(e) => updateBull(i, "name", e.target.value)}
            placeholder="Bull Name"
            className="input"
          />
          <select
            value={getCategoryKey(bull.currentCategory)}
            disabled={bull.isDeleted}
            onChange={(e) => updateBull(i, "categoryKey", e.target.value)}
            className="w-full border rounded px-2 py-2"
          >
            <option value="milk_teeth">Milk Teeth</option>
            <option value="two_teeth">Two Teeth</option>
            <option value="four_teeth">Four Teeth</option>
            <option value="six_teeth">Six Teeth</option>
            <option value="sub_junior">Sub Junior</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
            <option value="general">General</option>
            <option value="new">New</option>
            <option value="old">Old</option>
          </select>
          <div className="flex justify-end">
            {bull.isDeleted ? (
              <button
                type="button"
                onClick={() => onRevoke(bull._id)}
                className="text-xs text-emerald-700 hover:text-emerald-800"
              >
                Revoke Deletion
              </button>
            ) : (
              <button
                type="button"
                onClick={() => removeBull(i)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove Bull
              </button>
            )}
          </div>
        </div>
      ))}

      <button onClick={addBull} className="text-sm text-amber-600">
        + Add Bull
      </button>
    </section>
  );
}

function LocationSection({ team, setTeam }) {
  const updateLocation = (field, value) => {
    // Title Case formatting
    const formatted = value
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
    setTeam({
      ...team,
      teamLocation: { ...team.teamLocation, [field]: formatted },
    });
  };

  return (
    <section className="space-y-4">
      <h2 className="font-medium">Team Location</h2>
      <div className="grid grid-cols-3 gap-4">
        <input
          value={team.teamLocation?.village || ""}
          onChange={(e) => updateLocation("village", e.target.value)}
          placeholder="Village"
          className="border p-2 rounded w-full"
        />
        <input
          value={team.teamLocation?.district || ""}
          onChange={(e) => updateLocation("district", e.target.value)}
          placeholder="District"
          className="border p-2 rounded w-full"
        />
        <input
          value={team.teamLocation?.state || ""}
          onChange={(e) => updateLocation("state", e.target.value)}
          placeholder="State"
          className="border p-2 rounded w-full"
        />
      </div>
    </section>
  );
}

function TeamMembersSection({ team, setTeam }) {
  const updateMember = (i, field, value) => {
    const updated = [...team.teamMembers];
    updated[i][field] = value;
    setTeam({ ...team, teamMembers: updated });
  };

  const addMember = () => {
    setTeam({
      ...team,
      teamMembers: [
        ...team.teamMembers,
        { name: "", role: "HELPER", phone: "", info: "" },
      ],
    });
  };
  const removeMember = (index) => {
    setTeam((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  return (
    <section className="space-y-4">
      <h2 className="font-medium">Team Members</h2>

      {team.teamMembers.map((m, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            value={m.name}
            disabled={m.role === "OWNER"}
            onChange={(e) => updateMember(i, "name", e.target.value)}
            placeholder="Name"
          />

          <select
            value={m.role}
            disabled={m.role === "OWNER"}
            onChange={(e) => updateMember(i, "role", e.target.value)}
          >
            <option value="CAPTAIN">Captain</option>
            <option value="DRIVER">Driver</option>
            <option value="TRAINER">Trainer</option>
            <option value="HELPER">Helper</option>
          </select>

          <input
            value={m.info || ""}
            disabled={m.role === "OWNER"}
            onChange={(e) => updateMember(i, "info", e.target.value)}
            placeholder="Info (optional)"
          />

          <div className="flex items-center">
            {m.role !== "OWNER" ? (
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove Member
              </button>
            ) : null}
          </div>

          {m.role === "OWNER" && (
            <span className="text-xs text-gray-500">
              Contact admin to change owner
            </span>
          )}
        </div>
      ))}

      <button onClick={addMember} className="text-sm text-amber-600">
        + Add Member
      </button>
    </section>
  );
}
