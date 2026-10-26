import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  createAdminBullAPI,
  deleteAdminBullAPI,
  getAdminBullsAPI,
  getAdminTeamsAPI,
  updateAdminBullAPI,
} from "../../services/admin/adminManagement.api";

const categoryValues = {
  DENTITION: ["MILK", "TWO", "FOUR", "SIX"],
  AGE_GROUP: ["SUB_JUNIOR", "JUNIOR", "SENIOR"],
  CLASS: ["GENERAL", "NEW", "OLD"],
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

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 px-4 py-6 overflow-y-auto">
      <div className="mx-auto max-w-2xl bg-white border border-stone-200 shadow-xl rounded-lg">
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

function HealthBadge({ status }) {
  const colors =
    status === "HEALTHY"
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-700";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors}`}>
      {status}
    </span>
  );
}

export default function AdminBullsPage() {
  const [bulls, setBulls] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBull, setEditingBull] = useState(null);
  const [bullForm, setBullForm] = useState(emptyBullForm);
  const [saving, setSaving] = useState(false);

  const loadBulls = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
      };
      if (teamFilter) params.teamId = teamFilter;
      const res = await getAdminBullsAPI(params);
      setBulls(res.data || []);
      setPagination((prev) => res.pagination || prev);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load bulls");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, teamFilter]);

  useEffect(() => {
    const timer = setTimeout(loadBulls, 250);
    return () => clearTimeout(timer);
  }, [loadBulls]);

  useEffect(() => {
    getAdminTeamsAPI({ limit: 200, status: "ALL" })
      .then((res) => setTeams(res.data || []))
      .catch(() => {});
  }, []);

  const teamOptions = useMemo(
    () =>
      teams
        .filter((t) => !t.deletedAt)
        .map((t) => ({ id: t._id, name: t.teamName })),
    [teams],
  );

  const openCreate = () => {
    setEditingBull(null);
    setBullForm({ ...emptyBullForm, teamId: teamOptions[0]?.id || "" });
    setShowForm(true);
  };

  const openEdit = (bull) => {
    setEditingBull(bull);
    setBullForm({
      name: bull.name || "",
      teamId: bull.teamId || "",
      age: bull.age ?? "",
      breed: bull.breed || "",
      weight: bull.weight ?? "",
      healthStatus: bull.healthStatus || "HEALTHY",
      status: bull.status || "ACTIVE",
      categoryType: bull.currentCategory?.type || "AGE_GROUP",
      categoryValue: bull.currentCategory?.value || "JUNIOR",
      image: null,
    });
    setShowForm(true);
  };

  const handleDelete = async (bull) => {
    if (!window.confirm(`Delete "${bull.name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminBullAPI(bull._id);
      toast.success("Bull deleted");
      loadBulls();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setSaving(true);
      if (editingBull) {
        await updateAdminBullAPI(editingBull._id, payload);
        toast.success("Bull updated");
      } else {
        await createAdminBullAPI(payload);
        toast.success("Bull added");
      }
      setShowForm(false);
      loadBulls();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save bull");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 font-medium">
            Bulls Management
          </h1>
          <p className="text-stone-600 mt-1">
            Add, edit, or remove bulls from the registry.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
        >
          <Plus className="h-4 w-4" />
          Add Bull
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
          <div className="flex items-center gap-3 rounded-md border border-stone-300 px-3 py-2">
            <Search className="h-4 w-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              placeholder="Search by bull name..."
              className="w-full outline-none text-sm"
            />
          </div>
          <select
            value={teamFilter}
            onChange={(e) => {
              setTeamFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Teams</option>
            {teamOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulls Table */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">All Bulls</h2>
          <span className="text-sm text-stone-500">{pagination.total} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-5 py-3 font-medium">Bull</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Breed</th>
                <th className="px-5 py-3 font-medium">Age</th>
                <th className="px-5 py-3 font-medium">Weight</th>
                <th className="px-5 py-3 font-medium">Health</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-10 text-center text-stone-500"
                  >
                    Loading bulls...
                  </td>
                </tr>
              ) : bulls.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-10 text-center text-stone-500"
                  >
                    No bulls found.
                  </td>
                </tr>
              ) : (
                bulls.map((bull) => (
                  <tr key={bull._id} className="hover:bg-stone-50">
                    <td className="px-5 py-4 font-medium text-stone-900">
                      {bull.name}
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {bull.teamName || "-"}
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {bull.currentCategory
                        ? `${bull.currentCategory.type}: ${bull.currentCategory.value}`
                        : "-"}
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {bull.breed || "-"}
                    </td>
                    <td className="px-5 py-4">{bull.age ?? "-"}</td>
                    <td className="px-5 py-4">
                      {bull.weight ? `${bull.weight} kg` : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <HealthBadge status={bull.healthStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          bull.status === "ACTIVE"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {bull.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 rounded-md hover:bg-stone-100"
                          onClick={() => openEdit(bull)}
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-md text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(bull)}
                          title="Delete"
                        >
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

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-stone-200 px-5 py-4 text-sm">
          <span className="text-stone-500">
            Page {pagination.page} of {pagination.pages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((p) => ({ ...p, page: p.page - 1 }))
              }
              className="rounded-md border border-stone-300 px-3 py-1.5 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= (pagination.pages || 1)}
              onClick={() =>
                setPagination((p) => ({ ...p, page: p.page + 1 }))
              }
              className="rounded-md border border-stone-300 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bull Form Modal */}
      {showForm && (
        <Modal
          title={editingBull ? "Edit Bull" : "Add Bull"}
          onClose={() => setShowForm(false)}
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <TextInput
              label="Bull name"
              value={bullForm.name}
              onChange={(e) =>
                setBullForm({ ...bullForm, name: e.target.value })
              }
              required
            />
            <SelectInput
              label="Team"
              value={bullForm.teamId}
              onChange={(e) =>
                setBullForm({ ...bullForm, teamId: e.target.value })
              }
              required
            >
              <option value="">Select team</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </SelectInput>
            <TextInput
              label="Age (years)"
              type="number"
              min="0"
              value={bullForm.age}
              onChange={(e) =>
                setBullForm({ ...bullForm, age: e.target.value })
              }
            />
            <TextInput
              label="Breed"
              value={bullForm.breed}
              onChange={(e) =>
                setBullForm({ ...bullForm, breed: e.target.value })
              }
            />
            <TextInput
              label="Weight (kg)"
              type="number"
              min="0"
              value={bullForm.weight}
              onChange={(e) =>
                setBullForm({ ...bullForm, weight: e.target.value })
              }
            />
            <SelectInput
              label="Health status"
              value={bullForm.healthStatus}
              onChange={(e) =>
                setBullForm({ ...bullForm, healthStatus: e.target.value })
              }
            >
              <option value="HEALTHY">Healthy</option>
              <option value="INJURED">Injured</option>
              <option value="UNDER_OBSERVATION">Under observation</option>
              <option value="UNFIT">Unfit</option>
            </SelectInput>
            <SelectInput
              label="Category type"
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
            </SelectInput>
            <SelectInput
              label="Category value"
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
            </SelectInput>
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
                onClick={() => setShowForm(false)}
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
