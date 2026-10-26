import { useState } from "react";
import { createTeamAPI } from "../services/teams/index";
import { useTeams } from "../context/TeamContext";
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

const CreateTeam = ({ onSubmit, onCancel }) => {
  const { refreshTeams } = useTeams();
  const [form, setForm] = useState({
    teamName: "",
    ownerName: "",
    village: "",
    district: "",
    state: "",
    bulls: [{ name: "", categoryKey: "senior" }],
    teamMembers: [{ name: "", role: "DRIVER", info: "" }], // additional members (non-owner)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- BASIC HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "teamName") {
      formattedValue = value.toUpperCase();
    } else if (["village", "district", "state", "ownerName"].includes(name)) {
      // Capitalize first letter of each word
      formattedValue = value
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    setForm((p) => ({ ...p, [name]: formattedValue }));
  };

  /* ---------------- BULL HANDLERS ---------------- */

  const handleBullChange = (i, field, value) => {
    const bulls = [...form.bulls];
    let formattedValue = value;
    if (field === "name") {
      formattedValue = value
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
    bulls[i][field] = formattedValue;
    setForm((p) => ({ ...p, bulls }));
  };

  const addBull = () => {
    setForm((p) => ({
      ...p,
      bulls: [...p.bulls, { name: "", categoryKey: "senior" }],
    }));
  };
  const removeBull = (i) => {
    setForm((p) => ({
      ...p,
      bulls: p.bulls.filter((_, idx) => idx !== i),
    }));
  };

  /* ---------------- TEAM MEMBER HANDLERS ---------------- */

  const addMember = () => {
    setForm((p) => ({
      ...p,
      teamMembers: [...p.teamMembers, { name: "", role: "DRIVER", info: "" }],
    }));
  };

  const updateMember = (i, field, value) => {
    const teamMembers = [...form.teamMembers];
    let formattedValue = value;
    if (field === "name") {
      formattedValue = value
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
    teamMembers[i][field] = formattedValue;
    setForm((p) => ({ ...p, teamMembers }));
  };

  const removeMember = (i) => {
    setForm((p) => ({
      ...p,
      teamMembers: p.teamMembers.filter((_, idx) => idx !== i),
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const validateForm = () => {
    if (!form.teamName.trim()) {
      return "Team name is required";
    }

    if (!form.ownerName.trim()) {
      return "Owner name is required";
    }

    if (!form.village.trim()) return "Village is required";
    if (!form.district.trim()) return "District is required";
    if (!form.state.trim()) return "State is required";

    if (!form.bulls.length) {
      return "At least one bull is required";
    }
    for (const bull of form.bulls) {
      if (!bull.name.trim()) {
        return "Each bull must have a name";
      }
      if (!CATEGORY_MAP[bull.categoryKey]) {
        return "Invalid category selected";
      }
    }
    const validMembers = form.teamMembers.filter(
      (m) => m.name.trim().length > 0,
    );

    if (validMembers.length < 1) {
      return "At least one additional team member is required";
    }

    const hasCaptain = validMembers.some((m) => m.role === "CAPTAIN");
    if (!hasCaptain) {
      return "At least one team member must be selected as Captain";
    }

    return null; // valid
  };

  const isFormValid = !validateForm();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return; // STOP SUBMISSION
    }

    const payload = {
      teamName: form.teamName.trim(),

      bulls: form.bulls.map((b) => ({
        name: b.name.trim(),
        currentCategory: {
          type: CATEGORY_MAP[b.categoryKey]?.type,
          value: CATEGORY_MAP[b.categoryKey]?.value,
        },
      })),

      teamMembers: [
        // OWNER (always exactly one)
        {
          name: form.ownerName.trim(),
          role: "OWNER",
        },

        // Other members
        ...form.teamMembers
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name.trim(),
            role: m.role,
            info: m.info.trim(),
          })),
      ],
      teamLocation: {
        village: form.village.trim(),
        district: form.district.trim(),
        state: form.state.trim(),
      },
    };

    setLoading(true);
    setError("");
    try {
      // console.log("FINAL PAYLOAD", JSON.stringify(payload, null, 2));

      const result = await createTeamAPI(payload);
      toast.success("Team saved successfully! Waiting for approval.");
      // await refreshTeams();
      onSubmit?.(result);
      // On success, perhaps reset form or call onSubmit
      setForm({
        teamName: "",
        ownerName: "",
        village: "",
        district: "",
        state: "",
        bulls: [{ name: "", categoryKey: "senior" }],
        teamMembers: [{ name: "", role: "DRIVER", info: "" }],
      });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create team";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Add Your Team</h3>

        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-700 text-xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Team + Owner */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="teamName"
            placeholder="Company Name"
            value={form.teamName}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            name="ownerName"
            placeholder="Owner Name"
            value={form.ownerName}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input
            name="village"
            placeholder="Village"
            value={form.village}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            name="district"
            placeholder="District"
            value={form.district}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Bulls */}
        <div className="space-y-3">
          <p className="font-semibold text-gray-700 text-sm">
            Bulls ({form.bulls.length})
          </p>

          {form.bulls.map((bull, i) => (
            <div key={i} className="space-y-2 rounded-lg">
              {/* Category */}
              <select
                value={bull.categoryKey}
                onChange={(e) =>
                  handleBullChange(i, "categoryKey", e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
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

              {/* Bull Name + Remove */}
              <div className="flex items-center gap-3">
                <input
                  placeholder="Bull Name"
                  value={bull.name}
                  onChange={(e) => handleBullChange(i, "name", e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeBull(i)}
                  className="text-red-500 text-lg px-2 hover:text-red-700"
                  title="Remove bull"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addBull}
            className="text-sm text-orange-600 font-medium"
          >
            + Add Bull
          </button>
        </div>

        {/* Team Members */}
        <div className="space-y-2">
          <p className="font-semibold text-gray-700 text-sm">
            Team Members (excluding owner)
          </p>
          <p className="text-xs text-gray-500">
            At least one member must have role as Captain
          </p>

          {form.teamMembers.map((m, i) => (
            <div key={i} className="flex gap-3">
              <input
                placeholder="Member Name"
                value={m.name}
                onChange={(e) => updateMember(i, "name", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMember();
                  }
                }}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />

              <select
                value={m.role}
                onChange={(e) => updateMember(i, "role", e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="DRIVER">Driver</option>
                <option value="TRAINER">Trainer</option>
                <option value="CAPTAIN">Captain</option>
                <option value="HELPER">Helper</option>
              </select>
              <input
                placeholder="Info (optional)"
                value={m.info}
                onChange={(e) => updateMember(i, "info", e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={() => removeMember(i)}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addMember}
            className="text-sm text-orange-600 font-medium"
          >
            + Add Member
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="px-5 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Team"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeam;
