import { useState } from "react";
import { createEventDay } from "../../services/events/event.api";

export default function CreateDayForm({ eventId, onCreated }) {
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [prize, setPrize] = useState("");
  const [categoryType, setCategoryType] = useState("DENTITION");
  const [categoryValue, setCategoryValue] = useState("MILK");
  const CATEGORY_OPTIONS = {
    DENTITION: ["MILK", "TWO", "FOUR", "SIX"],
    AGE_GROUP: ["SUB_JUNIOR", "JUNIOR", "SENIOR"],
    CLASS: ["GENERAL", "NEW", "OLD"],
  };
  return (
    <div className="border border-stone-200 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-stone-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border border-stone-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">From</label>
          <input
            type="time"
            value={timeFrom}
            onChange={(e) => setTimeFrom(e.target.value)}
            className="p-2 border border-stone-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">To</label>
          <input
            type="time"
            value={timeTo}
            onChange={(e) => setTimeTo(e.target.value)}
            className="p-2 border border-stone-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">
            Prize Money (₹)
          </label>
          <input
            type="number"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            className="p-2 border border-stone-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">
            Category Type
          </label>
          <select
            value={categoryType}
            onChange={(e) => {
              const nextType = e.target.value;
              setCategoryType(nextType);
              const nextValues = CATEGORY_OPTIONS[nextType] || [];
              setCategoryValue(nextValues[0] || "");
            }}
            className="p-2 border border-stone-200 rounded-lg text-sm"
          >
            <option value="DENTITION">Dentition</option>
            <option value="AGE_GROUP">Age Group</option>
            <option value="CLASS">Class</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">
            Category Value
          </label>
          <select
            value={categoryValue}
            onChange={(e) => setCategoryValue(e.target.value)}
            className="p-2 border border-stone-200 rounded-lg text-sm"
          >
            {(CATEGORY_OPTIONS[categoryType] || []).map((v) => (
              <option key={v} value={v}>
                {v.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={async () => {
            const res = await createEventDay(eventId, {
              date,
              prizeMoney: Number(prize),
              timings: {
                from: timeFrom,
                to: timeTo,
              },
              category: {
                type: categoryType,
                value: categoryValue,
              },
            });
            onCreated(res);
            setDate("");
            setTimeFrom("");
            setTimeTo("");
            setPrize("");
            setCategoryType("DENTITION");
            setCategoryValue("MILK");
          }}
          className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm"
        >
          Create Day
        </button>
      </div>
    </div>
  );
}
