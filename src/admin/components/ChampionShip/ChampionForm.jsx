import { useState } from "react";
import { Save } from "lucide-react";

export default function ChampionForm({
  completedEvents,
  initialData,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState(
    initialData || {
      eventId: "",
      winnerName: "",
      bullName: "",
      raceTime: "",
      prizeAmount: "",
      notes: "",
    }
  );

  const update = (key, value) => setFormData({ ...formData, [key]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event */}
      <div>
        <label className="block text-stone-700 font-medium mb-2 text-sm">Event</label>
        <select
          required
          value={formData.eventId}
          onChange={(e) => update("eventId", e.target.value)}
          className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-white text-stone-900"
        >
          <option value="">Select an event</option>
          {completedEvents.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name} - {new Date(event.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* Winner + Bull */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-stone-700 font-medium mb-2 text-sm">Winner Name</label>
          <input
            type="text"
            required
            value={formData.winnerName}
            onChange={(e) => update("winnerName", e.target.value)}
            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            placeholder="e.g. Prakash Shetty"
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-2 text-sm">Bull Name</label>
          <input
            type="text"
            required
            value={formData.bullName}
            onChange={(e) => update("bullName", e.target.value)}
            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            placeholder="e.g. Thunderbolt"
          />
        </div>
      </div>

      {/* Race + Prize */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-stone-700 font-medium mb-2 text-sm">Race Time</label>
          <input
            type="text"
            required
            value={formData.raceTime}
            onChange={(e) => update("raceTime", e.target.value)}
            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            placeholder="e.g. 12.5s"
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-2 text-sm">Prize Amount</label>
          <input
            type="text"
            required
            value={formData.prizeAmount}
            onChange={(e) => update("prizeAmount", e.target.value)}
            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            placeholder="e.g. ₹50,000"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-stone-700 font-medium mb-2 text-sm">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
          placeholder="Add any additional details..."
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-stone-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-stone-200 rounded-lg text-stone-600 font-medium hover:bg-stone-50 hover:text-stone-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Save className="w-5 h-5" />
          {initialData ? "Update Champion" : "Add Champion"}
        </button>
      </div>
    </form>
  );
}
