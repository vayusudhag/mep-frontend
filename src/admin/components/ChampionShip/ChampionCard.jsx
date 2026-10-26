import { Edit2, Trophy } from "lucide-react";

export default function ChampionCard({ champion, onEdit }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 hover:border-amber-400 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>

          <div>
            <h3 className="text-lg font-serif font-medium text-stone-900">{champion.eventName}</h3>
            <p className="text-stone-500 text-sm">
              {new Date(champion.eventDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Field label="Winner" value={champion.winnerName} />
        <Field label="Bull" value={champion.bullName} />
        <Field label="Time" value={champion.raceTime} />
        <Field label="Prize" value={champion.prizeAmount} />
      </div>

      {champion.notes && (
        <div className="bg-stone-50 rounded-lg p-4 border border-stone-100">
          <p className="text-stone-500 text-xs font-medium uppercase tracking-wide mb-1">Notes</p>
          <p className="text-stone-700 text-sm">{champion.notes}</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="bg-stone-50/50 rounded-lg p-3 border border-stone-100">
      <p className="text-stone-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-stone-900 font-medium">{value}</p>
    </div>
  );
}
