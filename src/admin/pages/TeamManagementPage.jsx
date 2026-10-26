import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  addAdminMemberAPI,
  createAdminBullAPI,
  deleteAdminBullAPI,
  deleteAdminMemberAPI,
  deleteAdminTeamAPI,
  getAdminBullsAPI,
  getAdminStatsAPI,
  getAdminTeamAPI,
  getAdminTeamsAPI,
  updateAdminBullAPI,
  updateAdminMemberAPI,
  updateAdminTeamAPI,
} from "../../services/admin/adminManagement.api";

const emptyTeamForm = {
  teamName: "",
  status: "PENDING",
  isActive: true,
  village: "",
  district: "",
  state: "",
  rejectedReason: "",
};

const emptyMemberForm = {
  name: "",
  phone: "",
  role: "HELPER",
  info: "",
};

const emptyBullForm = {
  name: "",
  teamId: "",
  age: "",
  breed: "",
  weight: "",
  healthStatus: "HEALTHY",
  status: "ACTIVE",
  categoryType: "AGE_GROUP",
  categoryValue: "JUNIOR",
  image: null,
};

const categoryValues = {
  DENTITION: ["MILK", "TWO", "FOUR", "SIX"],
  AGE_GROUP: ["SUB_JUNIOR", "JUNIOR", "SENIOR"],
  CLASS: ["GENERAL", "NEW", "OLD"],
};

const withTeamMembers = (team) => ({
  ...team,
  members: Array.isArray(team?.members)
    ? team.members
    : Array.isArray(team?.teamMembers)
      ? team.teamMembers
      : [],
});

const renderText = (value, fallback = "—") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "object") {
    if (value.value !== undefined || value.type !== undefined) {
      return [value.type, value.value].filter(Boolean).join(": ") || fallback;
    }
    return fallback;
  }
  return String(value);
};

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 px-4 py-6 overflow-y-auto">
      <div className="mx-auto max-w-4xl bg-white border border-stone-200 shadow-xl rounded-lg">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-stone-500 hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  const IconComponent = icon;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 text-amber-700">
          <IconComponent className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function TextInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
      />
    </label>
  );
}

function SelectInput({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <select
        {...props}
        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
      >
        {children}
      </select>
    </label>
  );
}

export default function TeamManagementPage() {
  const [teams, setTeams] = useState([]);
  const [bulls, setBulls] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [bullPagination, setBullPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [bullLoading, setBullLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [teamForm, setTeamForm] = useState(emptyTeamForm);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [editingMember, setEditingMember] = useState(null);
  const [bullForm, setBullForm] = useState(emptyBullForm);
  const [editingBull, setEditingBull] = useState(null);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const [teamRes, statsRes] = await Promise.all([
        getAdminTeamsAPI({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status,
        }),
        getAdminStatsAPI(),
      ]);
      setTeams(teamRes.data || []);
      setPagination((prev) => teamRes.pagination || prev);
      setStats(statsRes);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load admin teams");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, status]);

  const loadBulls = useCallback(async () => {
    try {
      setBullLoading(true);
      const res = await getAdminBullsAPI({
        page: bullPagination.page,
        limit: bullPagination.limit,
        search: searchTerm,
      });
      setBulls(res.data || []);
      setBullPagination((prev) => res.pagination || prev);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load bulls");
    } finally {
      setBullLoading(false);
    }
  }, [bullPagination.page, bullPagination.limit, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(loadTeams, 250);
    return () => clearTimeout(timer);
  }, [loadTeams]);

  useEffect(() => {
    const timer = setTimeout(loadBulls, 250);
    return () => clearTimeout(timer);
  }, [loadBulls]);

  const refreshSelectedTeam = async (teamId = selectedTeam?._id) => {
    if (!teamId) return;
    const detail = await getAdminTeamAPI(teamId);
    setSelectedTeam(withTeamMembers(detail));
  };

  const openTeam = async (team) => {
    try {
      setSelectedTeam(null);
      setActiveModal("teamDetails");
      const detail = await getAdminTeamAPI(team._id);
      setSelectedTeam(withTeamMembers(detail));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to open team");
      setActiveModal(null);
    }
  };

  const openEditTeam = (team) => {
    setSelectedTeam(team);
    setTeamForm({
      teamName: team.teamName || "",
      status: team.status || "PENDING",
      isActive: Boolean(team.isActive),
      village: team.teamLocation?.village || "",
      district: team.teamLocation?.district || "",
      state: team.teamLocation?.state || "",
      rejectedReason: team.rejectedReason || "",
    });
    setActiveModal("teamForm");
  };

  const saveTeam = async (event) => {
    event.preventDefault();
    try {
      const updated = await updateAdminTeamAPI(selectedTeam._id, {
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
      setActiveModal(null);
      setSelectedTeam(updated);
      loadTeams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update team");
    }
  };

  const deleteTeam = async (team) => {
    if (!window.confirm(`Delete ${team.teamName}? This soft deletes the team, members, and bulls.`)) {
      return;
    }
    try {
      await deleteAdminTeamAPI(team._id);
      toast.success("Team deleted");
      loadTeams();
      loadBulls();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete team");
    }
  };

  const openMemberForm = (member = null) => {
    setEditingMember(member);
    setMemberForm(
      member
        ? {
            name: member.name || "",
            phone: member.phone || "",
            role: member.role || "HELPER",
            info: member.info || "",
          }
        : emptyMemberForm,
    );
    setActiveModal("memberForm");
  };

  const saveMember = async (event) => {
    event.preventDefault();
    try {
      if (editingMember) {
        await updateAdminMemberAPI(editingMember._id, memberForm);
        toast.success("Member updated");
      } else {
        await addAdminMemberAPI(selectedTeam._id, memberForm);
        toast.success("Member added");
      }
      setActiveModal("teamDetails");
      await refreshSelectedTeam();
      loadTeams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save member");
    }
  };

  const deleteMember = async (member) => {
    if (!window.confirm(`Delete ${member.name || "this member"}?`)) return;
    try {
      await deleteAdminMemberAPI(member._id);
      toast.success("Member deleted");
      await refreshSelectedTeam();
      loadTeams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete member");
    }
  };

  const openBullForm = (bull = null, teamId = selectedTeam?._id) => {
    setEditingBull(bull);
    setBullForm(
      bull
        ? {
            name: bull.name || "",
            teamId: bull.teamId || teamId || "",
            age: bull.age ?? "",
            breed: bull.breed || "",
            weight: bull.weight ?? "",
            healthStatus: bull.healthStatus || "HEALTHY",
            status: bull.status || "ACTIVE",
            categoryType: bull.currentCategory?.type || "AGE_GROUP",
            categoryValue: bull.currentCategory?.value || "JUNIOR",
            image: null,
          }
        : { ...emptyBullForm, teamId: teamId || "" },
    );
    setActiveModal("bullForm");
  };

  const saveBull = async (event) => {
    event.preventDefault();
    const payload = {
      ...bullForm,
      currentCategory: {
        type: bullForm.categoryType,
        value: bullForm.categoryValue,
      },
    };
    delete payload.categoryType;
    delete payload.categoryValue;

    try {
      if (editingBull) {
        await updateAdminBullAPI(editingBull._id, payload);
        toast.success("Bull updated");
      } else {
        await createAdminBullAPI(payload);
        toast.success("Bull added");
      }
      setActiveModal(selectedTeam ? "teamDetails" : null);
      await refreshSelectedTeam();
      loadBulls();
      loadTeams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save bull");
    }
  };

  const deleteBull = async (bull) => {
    if (!window.confirm(`Delete ${bull.name}?`)) return;
    try {
      await deleteAdminBullAPI(bull._id);
      toast.success("Bull deleted");
      await refreshSelectedTeam();
      loadBulls();
      loadTeams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete bull");
    }
  };

  const teamOptions = useMemo(
    () => teams.filter((team) => !team.deletedAt).map((team) => ({ id: team._id, name: team.teamName })),
    [teams],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 font-medium">
            Admin Management
          </h1>
          <p className="text-stone-600 mt-1">
            Manage teams, team members, and bulls from one workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openBullForm(null, teams[0]?._id)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
        >
          <Plus className="h-4 w-4" />
          Add Bull
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Teams" value={stats?.totalTeams ?? "..."} icon={Users} />
        <StatCard label="Active Bulls" value={stats?.activeBulls ?? "..."} icon={Activity} />
        <StatCard label="Pending Teams" value={stats?.pendingTeams ?? "..."} icon={Search} />
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
          <div className="flex items-center gap-3 rounded-md border border-stone-300 px-3 py-2">
            <Search className="h-4 w-4 text-stone-400" />
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
                setBullPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Search teams, locations, or bulls..."
              className="w-full outline-none text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <section className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Teams</h2>
          <span className="text-sm text-stone-500">{pagination.total} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Members</th>
                <th className="px-5 py-3 font-medium">Bulls</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-stone-500">
                    Loading teams...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-stone-500">
                    No teams found.
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team._id} className="hover:bg-stone-50">
                    <td className="px-5 py-4 font-medium text-stone-900">{team.teamName}</td>
                    <td className="px-5 py-4 text-stone-600">
                      {team.ownerId?.username || "Unknown"}
                      <div className="text-xs text-stone-400">{team.ownerId?.mobileNumber}</div>
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {[team.teamLocation?.village, team.teamLocation?.district, team.teamLocation?.state]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openTeam(team)}
                        className="font-medium text-amber-700 hover:text-amber-900 hover:underline"
                        title={`View and manage ${team.membersCount || 0} team members`}
                      >
                        {team.membersCount || 0} · Manage
                      </button>
                    </td>
                    <td className="px-5 py-4">{team.bullsCount || 0}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                        {team.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 rounded-md hover:bg-stone-100" onClick={() => openTeam(team)} title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-md hover:bg-stone-100" onClick={() => openEditTeam(team)} title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-md text-red-600 hover:bg-red-50" onClick={() => deleteTeam(team)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} setPagination={setPagination} />
      </section>

      <section className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Bulls</h2>
          <span className="text-sm text-stone-500">{bullPagination.total} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-5 py-3 font-medium">Bull</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Breed</th>
                <th className="px-5 py-3 font-medium">Age</th>
                <th className="px-5 py-3 font-medium">Weight</th>
                <th className="px-5 py-3 font-medium">Health</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bullLoading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-stone-500">
                    Loading bulls...
                  </td>
                </tr>
              ) : bulls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-stone-500">
                    No bulls found.
                  </td>
                </tr>
              ) : (
                bulls.map((bull) => (
                  <tr key={bull._id} className="hover:bg-stone-50">
                    <td className="px-5 py-4 font-medium text-stone-900">{bull.name}</td>
                    <td className="px-5 py-4 text-stone-600">{bull.teamName || "-"}</td>
                    <td className="px-5 py-4 text-stone-600">{bull.breed || "-"}</td>
                    <td className="px-5 py-4">{bull.age ?? "-"}</td>
                    <td className="px-5 py-4">{bull.weight ? `${bull.weight} kg` : "-"}</td>
                    <td className="px-5 py-4">{bull.healthStatus}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 rounded-md hover:bg-stone-100" onClick={() => openBullForm(bull, bull.teamId)} title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-md text-red-600 hover:bg-red-50" onClick={() => deleteBull(bull)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={bullPagination} setPagination={setBullPagination} />
      </section>

      {activeModal === "teamDetails" && selectedTeam && (
        <Modal title={selectedTeam.teamName} onClose={() => setActiveModal(null)}>
          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 rounded-md bg-stone-50 px-4 py-3 text-sm text-stone-600">
            <span>Location: {[selectedTeam.teamLocation?.village, selectedTeam.teamLocation?.district, selectedTeam.teamLocation?.state].filter(Boolean).join(", ") || "Not provided"}</span>
            <span>Status: {renderText(selectedTeam.status)}</span>
            <span>{selectedTeam.isActive ? "Active" : "Inactive"}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-stone-900">Members</h3>
                <button className="inline-flex items-center gap-2 text-sm text-amber-700" onClick={() => openMemberForm()}>
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(selectedTeam.members || []).map((member) => (
                  <div key={member._id} className="flex items-center justify-between rounded-md border border-stone-200 p-3">
                    <div>
                      <p className="font-medium text-stone-900">{renderText(member.name || member.personId?.name, "Unnamed member")}</p>
                      <p className="text-xs text-stone-500">{renderText(member.role)} {member.phone ? `- ${renderText(member.phone)}` : ""}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 rounded-md hover:bg-stone-100" onClick={() => openMemberForm(member)}>
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-md text-red-600 hover:bg-red-50" onClick={() => deleteMember(member)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {selectedTeam.members.length === 0 && <p className="text-sm text-stone-500">No members yet. Use Add to create the team roster.</p>}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-stone-900">Bulls</h3>
                <button className="inline-flex items-center gap-2 text-sm text-amber-700" onClick={() => openBullForm(null, selectedTeam._id)}>
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(selectedTeam.bulls || []).map((bull) => (
                  <div key={bull._id} className="flex items-center justify-between rounded-md border border-stone-200 p-3">
                    <div>
                      <p className="font-medium text-stone-900">{renderText(bull.name, "Unnamed bull")}</p>
                      <p className="text-xs text-stone-500">{renderText(bull.breed, "Breed not set")} - {renderText(bull.healthStatus)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 rounded-md hover:bg-stone-100" onClick={() => openBullForm(bull, selectedTeam._id)}>
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-md text-red-600 hover:bg-red-50" onClick={() => deleteBull(bull)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {selectedTeam.bulls?.length === 0 && <p className="text-sm text-stone-500">No bulls yet.</p>}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "teamForm" && (
        <Modal title="Edit Team" onClose={() => setActiveModal(null)}>
          <form onSubmit={saveTeam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Team name" value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} required />
            <SelectInput label="Status" value={teamForm.status} onChange={(e) => setTeamForm({ ...teamForm, status: e.target.value })}>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </SelectInput>
            <TextInput label="Village" value={teamForm.village} onChange={(e) => setTeamForm({ ...teamForm, village: e.target.value })} />
            <TextInput label="District" value={teamForm.district} onChange={(e) => setTeamForm({ ...teamForm, district: e.target.value })} />
            <TextInput label="State" value={teamForm.state} onChange={(e) => setTeamForm({ ...teamForm, state: e.target.value })} />
            <TextInput label="Rejection reason" value={teamForm.rejectedReason} onChange={(e) => setTeamForm({ ...teamForm, rejectedReason: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={teamForm.isActive} onChange={(e) => setTeamForm({ ...teamForm, isActive: e.target.checked })} />
              Active team
            </label>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="rounded-md border border-stone-300 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white">Save Team</button>
            </div>
          </form>
        </Modal>
      )}

      {activeModal === "memberForm" && (
        <Modal title={editingMember ? "Edit Member" : "Add Member"} onClose={() => setActiveModal("teamDetails")}>
          <form onSubmit={saveMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Name" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} required />
            <TextInput label="Phone" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
            <SelectInput label="Role" value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
              {["OWNER", "DRIVER", "TRAINER", "HELPER", "CAPTAIN", "OTHER"].map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </SelectInput>
            <TextInput label="Info" value={memberForm.info} onChange={(e) => setMemberForm({ ...memberForm, info: e.target.value })} />
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveModal("teamDetails")} className="rounded-md border border-stone-300 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white">Save Member</button>
            </div>
          </form>
        </Modal>
      )}

      {activeModal === "bullForm" && (
        <Modal title={editingBull ? "Edit Bull" : "Add Bull"} onClose={() => setActiveModal(selectedTeam ? "teamDetails" : null)}>
          <form onSubmit={saveBull} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Bull name" value={bullForm.name} onChange={(e) => setBullForm({ ...bullForm, name: e.target.value })} required />
            <SelectInput label="Team" value={bullForm.teamId} onChange={(e) => setBullForm({ ...bullForm, teamId: e.target.value })} required>
              <option value="">Select team</option>
              {teamOptions.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </SelectInput>
            <TextInput label="Age" type="number" min="0" value={bullForm.age} onChange={(e) => setBullForm({ ...bullForm, age: e.target.value })} />
            <TextInput label="Breed" value={bullForm.breed} onChange={(e) => setBullForm({ ...bullForm, breed: e.target.value })} />
            <TextInput label="Weight (kg)" type="number" min="0" value={bullForm.weight} onChange={(e) => setBullForm({ ...bullForm, weight: e.target.value })} />
            <SelectInput label="Health status" value={bullForm.healthStatus} onChange={(e) => setBullForm({ ...bullForm, healthStatus: e.target.value })}>
              <option value="HEALTHY">Healthy</option>
              <option value="INJURED">Injured</option>
              <option value="UNDER_OBSERVATION">Under observation</option>
              <option value="UNFIT">Unfit</option>
            </SelectInput>
            <SelectInput
              label="Category type"
              value={bullForm.categoryType}
              onChange={(e) => setBullForm({ ...bullForm, categoryType: e.target.value, categoryValue: categoryValues[e.target.value][0] })}
            >
              <option value="DENTITION">Dentition</option>
              <option value="AGE_GROUP">Age group</option>
              <option value="CLASS">Class</option>
            </SelectInput>
            <SelectInput label="Category value" value={bullForm.categoryValue} onChange={(e) => setBullForm({ ...bullForm, categoryValue: e.target.value })}>
              {categoryValues[bullForm.categoryType].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </SelectInput>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-stone-700">Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBullForm({ ...bullForm, image: e.target.files?.[0] || null })}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveModal(selectedTeam ? "teamDetails" : null)} className="rounded-md border border-stone-300 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white">Save Bull</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Pagination({ pagination, setPagination }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-stone-200 px-5 py-4 text-sm">
      <span className="text-stone-500">
        Page {pagination.page} of {pagination.pages || 1}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
          className="rounded-md border border-stone-300 px-3 py-1.5 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={pagination.page >= (pagination.pages || 1)}
          onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
          className="rounded-md border border-stone-300 px-3 py-1.5 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
