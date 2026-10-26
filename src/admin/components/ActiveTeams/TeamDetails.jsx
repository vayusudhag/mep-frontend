import { ArrowLeft, Edit3, Plus, Trash2, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAdminTeamAPI,
  updateAdminTeamAPI,
  deleteAdminTeamAPI,
  addAdminMemberAPI,
  updateAdminMemberAPI,
  deleteAdminMemberAPI,
  createAdminBullAPI,
  updateAdminBullAPI,
  deleteAdminBullAPI,
} from "../../../services/admin/adminManagement.api";

const categoryValues = {
  DENTITION: ["MILK", "TWO", "FOUR", "SIX"],
  AGE_GROUP: ["SUB_JUNIOR", "JUNIOR", "SENIOR"],
  CLASS: ["GENERAL", "NEW", "OLD"],
};

const emptyMemberForm = { name: "", phone: "", role: "HELPER", info: "" };
const emptyBullForm = {
  name: "",
  age: "",
  breed: "",
  weight: "",
  healthStatus: "HEALTHY",
  categoryType: "AGE_GROUP",
  categoryValue: "JUNIOR",
  image: null,
};

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 px-4 py-6 overflow-y-auto">
      <div className="mx-auto max-w-xl bg-white border border-stone-200 shadow-xl rounded-lg">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-stone-500 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const selectCls = `${inputCls} bg-white`;

export default function TeamDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // modal state: null | "editTeam" | "member" | "bull"
  const [modal, setModal] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editingBull, setEditingBull] = useState(null);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [bullForm, setBullForm] = useState(emptyBullForm);
  const [teamForm, setTeamForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await getAdminTeamAPI(id);
      setTeam(data);
    } catch {
      setErr("Failed to load team details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  /* ---- Team edit ---- */
  const openEditTeam = () => {
    setTeamForm({
      teamName: team.teamName || "",
      status: team.status || "PENDING",
      isActive: Boolean(team.isActive),
      village: team.teamLocation?.village || "",
      district: team.teamLocation?.district || "",
      state: team.teamLocation?.state || "",
      rejectedReason: team.rejectedReason || "",
    });
    setModal("editTeam");
  };

  const saveTeam = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateAdminTeamAPI(id, {
        teamName: teamForm.teamName,
        status: teamForm.status,
        isActive: teamForm.isActive,
        rejectedReason: teamForm.rejectedReason,
        teamLocation: {
          village: teamForm.village,
          district: teamForm.district,
          state: teamForm.state,
        },
      });
      toast.success("Team updated");
      setModal(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update team");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (
      !window.confirm(
        `Delete "${team.teamName}"? This will also remove all members and bulls.`,
      )
    )
      return;
    try {
      await deleteAdminTeamAPI(id);
      toast.success("Team deleted");
      navigate("/admin/teams");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  /* ---- Members ---- */
  const openAddMember = () => {
    setEditingMember(null);
    setMemberForm(emptyMemberForm);
    setModal("member");
  };

  const openEditMember = (member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name || "",
      phone: member.phone || "",
      role: member.role || "HELPER",
      info: member.info || "",
    });
    setModal("member");
  };

  const saveMember = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingMember) {
        await updateAdminMemberAPI(editingMember._id, memberForm);
        toast.success("Member updated");
      } else {
        await addAdminMemberAPI(id, memberForm);
        toast.success("Member added");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save member");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Remove "${member.name}" from this team?`)) return;
    try {
      await deleteAdminMemberAPI(member._id);
      toast.success("Member removed");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    }
  };

  /* ---- Bulls ---- */
  const openAddBull = () => {
    setEditingBull(null);
    setBullForm(emptyBullForm);
    setModal("bull");
  };

  const openEditBull = (bull) => {
    setEditingBull(bull);
    setBullForm({
      name: bull.name || "",
      age: bull.age ?? "",
      breed: bull.breed || "",
      weight: bull.weight ?? "",
      healthStatus: bull.healthStatus || "HEALTHY",
      categoryType: bull.currentCategory?.type || "AGE_GROUP",
      categoryValue: bull.currentCategory?.value || "JUNIOR",
      image: null,
    });
    setModal("bull");
  };

  const saveBull = async (e) => {
    e.preventDefault();
    const payload = {
      ...bullForm,
      teamId: id,
      currentCategory: {
        type: bullForm.categoryType,
        value: bullForm.categoryValue,
      },
    };
    delete payload.categoryType;
    delete payload.categoryValue;
    try {
      setSaving(true);
      if (editingBull) {
        await updateAdminBullAPI(editingBull._id, payload);
        toast.success("Bull updated");
      } else {
        await createAdminBullAPI(payload);
        toast.success("Bull added");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save bull");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBull = async (bull) => {
    if (!window.confirm(`Delete bull "${bull.name}"?`)) return;
    try {
      await deleteAdminBullAPI(bull._id);
      toast.success("Bull deleted");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete bull");
    }
  };

  /* ---- Render ---- */
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4" />
        <p className="text-stone-500 font-medium">Loading team details...</p>
      </div>
    );
  }

  if (err || !team) {
    return (
      <div className="p-6 bg-stone-50 border border-stone-200 rounded-lg text-stone-700">
        {err || "Team not found"}
      </div>
    );
  }

  const location = [
    team.teamLocation?.village,
    team.teamLocation?.district,
    team.teamLocation?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => navigate("/admin/teams")}
          className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Teams
        </button>
        <div className="flex gap-2">
          <button
            onClick={openEditTeam}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50"
          >
            <Edit3 className="h-4 w-4" />
            Edit Team
          </button>
          <button
            onClick={handleDeleteTeam}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete Team
          </button>
        </div>
      </div>

      {/* Team summary card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🐂</span>
              <h1 className="text-2xl font-serif font-semibold text-stone-900">
                {team.teamName}
              </h1>
            </div>
            <p className="text-stone-600 text-sm">
              {location || "Location not set"}
            </p>
            <p className="text-stone-500 text-sm mt-1">
              Owner:{" "}
              <span className="font-medium text-stone-700">
                {team.ownerId?.username || "—"}
              </span>{" "}
              {team.ownerId?.mobileNumber && (
                <span className="text-stone-400">
                  ({team.ownerId.mobileNumber})
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                team.status === "APPROVED"
                  ? "bg-green-50 text-green-700"
                  : team.status === "PENDING"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {team.status}
            </span>
            <span
              className={`text-xs ${team.isActive ? "text-green-600" : "text-stone-400"}`}
            >
              {team.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Members & Bulls grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
            <h2 className="font-semibold text-stone-900">
              Team Members ({team.members?.length || 0})
            </h2>
            <button
              onClick={openAddMember}
              className="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {(team.members || []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-500">
                No members yet.
              </p>
            ) : (
              (team.members || []).map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="font-medium text-stone-900 text-sm">
                      {member.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {member.role}
                      {member.phone ? ` · ${member.phone}` : ""}
                      {member.info ? ` · ${member.info}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded hover:bg-stone-100"
                      onClick={() => openEditMember(member)}
                      title="Edit member"
                    >
                      <Edit3 className="h-4 w-4 text-stone-500" />
                    </button>
                    <button
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      onClick={() => handleDeleteMember(member)}
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bulls */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
            <h2 className="font-semibold text-stone-900">
              Bulls ({team.bulls?.length || 0})
            </h2>
            <button
              onClick={openAddBull}
              className="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Bull
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {(team.bulls || []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-500">
                No bulls registered.
              </p>
            ) : (
              (team.bulls || []).map((bull) => (
                <div
                  key={bull._id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="font-medium text-stone-900 text-sm">
                      {bull.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {bull.currentCategory
                        ? `${bull.currentCategory.type}: ${bull.currentCategory.value}`
                        : ""}
                      {bull.breed ? ` · ${bull.breed}` : ""}
                      {bull.age != null ? ` · ${bull.age}yr` : ""}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {bull.healthStatus} · {bull.status}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded hover:bg-stone-100"
                      onClick={() => openEditBull(bull)}
                      title="Edit bull"
                    >
                      <Edit3 className="h-4 w-4 text-stone-500" />
                    </button>
                    <button
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      onClick={() => handleDeleteBull(bull)}
                      title="Delete bull"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ---- Modals ---- */}

      {modal === "editTeam" && (
        <Modal title="Edit Team" onClose={() => setModal(null)}>
          <form
            onSubmit={saveTeam}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Field label="Team name">
              <input
                className={inputCls}
                value={teamForm.teamName}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, teamName: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Status">
              <select
                className={selectCls}
                value={teamForm.status}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, status: e.target.value })
                }
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </Field>
            <Field label="Village">
              <input
                className={inputCls}
                value={teamForm.village}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, village: e.target.value })
                }
              />
            </Field>
            <Field label="District">
              <input
                className={inputCls}
                value={teamForm.district}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, district: e.target.value })
                }
              />
            </Field>
            <Field label="State">
              <input
                className={inputCls}
                value={teamForm.state}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, state: e.target.value })
                }
              />
            </Field>
            <Field label="Rejection reason">
              <input
                className={inputCls}
                value={teamForm.rejectedReason}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, rejectedReason: e.target.value })
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={teamForm.isActive}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, isActive: e.target.checked })
                }
              />
              Active team
            </label>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Team"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "member" && (
        <Modal
          title={editingMember ? "Edit Member" : "Add Member"}
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={saveMember}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Field label="Name">
              <input
                className={inputCls}
                value={memberForm.name}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, name: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Phone">
              <input
                className={inputCls}
                value={memberForm.phone}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, phone: e.target.value })
                }
              />
            </Field>
            <Field label="Role">
              <select
                className={selectCls}
                value={memberForm.role}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, role: e.target.value })
                }
              >
                {["OWNER", "CAPTAIN", "DRIVER", "TRAINER", "HELPER", "OTHER"].map(
                  (r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Info">
              <input
                className={inputCls}
                value={memberForm.info}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, info: e.target.value })
                }
              />
            </Field>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Member"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "bull" && (
        <Modal
          title={editingBull ? "Edit Bull" : "Add Bull"}
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={saveBull}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Field label="Bull name">
              <input
                className={inputCls}
                value={bullForm.name}
                onChange={(e) =>
                  setBullForm({ ...bullForm, name: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Age (years)">
              <input
                type="number"
                min="0"
                className={inputCls}
                value={bullForm.age}
                onChange={(e) =>
                  setBullForm({ ...bullForm, age: e.target.value })
                }
              />
            </Field>
            <Field label="Breed">
              <input
                className={inputCls}
                value={bullForm.breed}
                onChange={(e) =>
                  setBullForm({ ...bullForm, breed: e.target.value })
                }
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                type="number"
                min="0"
                className={inputCls}
                value={bullForm.weight}
                onChange={(e) =>
                  setBullForm({ ...bullForm, weight: e.target.value })
                }
              />
            </Field>
            <Field label="Health status">
              <select
                className={selectCls}
                value={bullForm.healthStatus}
                onChange={(e) =>
                  setBullForm({ ...bullForm, healthStatus: e.target.value })
                }
              >
                <option value="HEALTHY">Healthy</option>
                <option value="INJURED">Injured</option>
                <option value="UNDER_OBSERVATION">Under observation</option>
                <option value="UNFIT">Unfit</option>
              </select>
            </Field>
            <Field label="Category type">
              <select
                className={selectCls}
                value={bullForm.categoryType}
                onChange={(e) =>
                  setBullForm({
                    ...bullForm,
                    categoryType: e.target.value,
                    categoryValue: categoryValues[e.target.value][0],
                  })
                }
              >
                <option value="DENTITION">Dentition</option>
                <option value="AGE_GROUP">Age group</option>
                <option value="CLASS">Class</option>
              </select>
            </Field>
            <Field label="Category value">
              <select
                className={selectCls}
                value={bullForm.categoryValue}
                onChange={(e) =>
                  setBullForm({ ...bullForm, categoryValue: e.target.value })
                }
              >
                {categoryValues[bullForm.categoryType].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-stone-700">
                Image (optional)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setBullForm({
                    ...bullForm,
                    image: e.target.files?.[0] || null,
                  })
                }
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Bull"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
