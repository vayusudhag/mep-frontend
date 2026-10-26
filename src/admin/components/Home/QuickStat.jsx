export default function QuickStat({ label, value, icon, color }) {
  // Map legacy color prop to stone/amber theme if needed, or just ignore and use consistent styling
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex items-center justify-between hover:border-amber-300 transition-colors">
      <div>
        <p className="text-stone-500 mb-1 text-sm font-medium uppercase tracking-wide">{label}</p>
        <p className="text-stone-900 text-2xl font-serif font-medium">{value}</p>
      </div>
      <div
        className="w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-100 text-2xl"
      >
        <span>{icon}</span>
      </div>
    </div>
  );
}
