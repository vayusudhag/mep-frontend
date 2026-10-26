import toast from "react-hot-toast";

const parseEventDayDate = (rawDate) => {
  if (!rawDate) return null;

  const raw = String(rawDate);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, month, day);
  }

  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const formatDayName = (rawDate) => {
  const dt = parseEventDayDate(rawDate);
  if (!dt) return "Unknown Day";
  return dt.toLocaleDateString("en-US", { weekday: "long" });
};

const formatDateLabel = (rawDate) => {
  const dt = parseEventDayDate(rawDate);
  if (!dt) return "-";
  return dt.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCategoryValue = (value) => {
  return value ? String(value).replace(/_/g, " ") : "N/A";
};

const formatTiming = (timings) => {
  if (!timings?.from || !timings?.to) return "No timing";
  return `${timings.from} - ${timings.to}`;
};

export default function DayList({
  days,
  selectedDayId,
  onSelect,
  isAdmin,
  onStatusChange,
}) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d._id}
            onClick={() => onSelect(d._id)}
            className={`px-3 py-2 rounded-lg text-sm border text-left min-w-[220px] ${
              selectedDayId === d._id
                ? "bg-stone-100 border-stone-300 text-stone-800"
                : "bg-white border-stone-200 text-stone-700"
            }`}
          >
            <div className="font-semibold">
              {formatDateLabel(d.date)} : {formatDayName(d.date)}
            </div>
            <div className="text-xs text-stone-500 font-bold">
              PrizeMoney: ₹{(d.prizeMoney || 0).toLocaleString()}
            </div>
            <div className="text-xs text-stone-500">
              Time: {formatTiming(d.timings)}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                {d.status}
              </span>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                {formatCategoryValue(d.category?.value)}
              </span>
            </div>
          </button>
        ))}
      </div>
      {isAdmin && selectedDayId && (
        <div className="mt-3 flex gap-2">
          <select
            onChange={async (e) => {
              try {
                await onStatusChange(selectedDayId, e.target.value);
              } catch (err) {
                const msg =
                  err?.response?.data?.message ||
                  err?.message ||
                  "Failed to change day status";
                toast.error(msg);
              }
            }}
            defaultValue=""
            className="px-3 py-2 rounded-lg border border-stone-200 text-sm"
          >
            <option value="" disabled>
              Change day status...
            </option>
            <option value="ONGOING">Mark as ONGOING</option>
            <option value="COMPLETED">Mark as COMPLETED</option>
          </select>
        </div>
      )}
    </div>
  );
}
