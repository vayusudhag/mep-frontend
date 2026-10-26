import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

export default function EventForm({ initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    locationName: "",
    googleMapUrl: "",
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
    prizeMoney: "",
  });
  const [timeError, setTimeError] = useState("");

  const pad2 = (n) => String(n).padStart(2, "0");
  const toLocalDateValue = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const toLocalTimeValue = (d) =>
    `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    return new Date(`${date}T${time}`);
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        locationName: initialData.location?.name || "",
        googleMapUrl: initialData.location?.googleMapUrl || "",
        fromDate: toLocalDateValue(new Date(initialData.timings.from)),
        fromTime: toLocalTimeValue(new Date(initialData.timings.from)),
        toDate: toLocalDateValue(new Date(initialData.timings.to)),
        toTime: toLocalTimeValue(new Date(initialData.timings.to)),
        prizeMoney: initialData.prizeMoney,
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.locationName || !formData.googleMapUrl) {
      return;
    }
    const from = combineDateTime(formData.fromDate, formData.fromTime);
    const to = combineDateTime(formData.toDate, formData.toTime);
    if (!from || !to) {
      setTimeError("Please select both date and time for start and end.");
      return;
    }
    if (from >= to) {
      setTimeError("End time must be after the start time.");
      return;
    }
    setTimeError("");
    onSubmit({
      title: formData.title,
      description: formData.description,
      location: {
        name: formData.locationName,
        googleMapUrl: formData.googleMapUrl,
      },
      timings: {
        from,
        to,
      },
      prizeMoney: Number(formData.prizeMoney),
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-stone-200 my-8">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
          <h3 className="text-xl font-serif font-medium text-stone-800">
            {initialData ? "Edit Event" : "Create Event"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Event Title
              </label>
              <input
                className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all placeholder:text-stone-400"
                required
                placeholder="e.g. Grand Bull Race 2024"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Description
              </label>
              <textarea
                className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all min-h-[100px] resize-y placeholder:text-stone-400"
                value={formData.description}
                placeholder="Describe the event details..."
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Location Name
                </label>
                <input
                  className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all placeholder:text-stone-400"
                  required
                  placeholder="e.g. Village Ground, District"
                  value={formData.locationName}
                  onChange={(e) =>
                    setFormData({ ...formData, locationName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Google Maps URL
                </label>
                <input
                  className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all placeholder:text-stone-400"
                  required
                  placeholder="https://maps.google.com/..."
                  value={formData.googleMapUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Start Date & Time
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-stone-500">Date</span>
                    <input
                      type="date"
                      className="mt-1 w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all"
                      required
                      value={formData.fromDate}
                      onChange={(e) =>
                        setFormData({ ...formData, fromDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-stone-500">Time</span>
                    <input
                      type="time"
                      className="mt-1 w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all"
                      required
                      value={formData.fromTime}
                      onChange={(e) =>
                        setFormData({ ...formData, fromTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  End Date & Time
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-stone-500">Date</span>
                    <input
                      type="date"
                      className="mt-1 w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all"
                      required
                      value={formData.toDate}
                      onChange={(e) =>
                        setFormData({ ...formData, toDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <span className="text-xs text-stone-500">Time</span>
                    <input
                      type="time"
                      className="mt-1 w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all"
                      required
                      value={formData.toTime}
                      onChange={(e) =>
                        setFormData({ ...formData, toTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            {timeError && <p className="text-sm text-red-600">{timeError}</p>}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Prize Money (₹)
              </label>
              <input
                type="number"
                className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-700 transition-all placeholder:text-stone-400"
                required
                placeholder="0.00"
                min="0"
                value={formData.prizeMoney}
                onChange={(e) =>
                  setFormData({ ...formData, prizeMoney: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-stone-600 hover:bg-stone-50 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
