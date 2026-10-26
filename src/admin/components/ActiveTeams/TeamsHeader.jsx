import { ArrowLeft } from "lucide-react";

export default function TeamsHeader({ onBack, activeCount }) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 transition-colors font-medium text-sm group"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-stone-900 font-medium mb-2">Active Teams</h2>
          <p className="text-stone-600">
            Browse and manage all registered teams
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-medium text-sm">{activeCount} Active Teams</span>
        </div>
      </div>
    </div>
  );
}
