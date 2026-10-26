export default function RecentActivityItem({ action, team, time, color }) {
  // Map legacy color prop to stone/amber theme
  const dotColor = "bg-amber-500"; 
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200">
      <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      <div className="flex-1">
        <p className="text-stone-900 font-medium text-sm">{action}</p>
        <p className="text-stone-500 text-sm mt-0.5">{team}</p>
      </div>
      <span className="text-stone-400 text-xs font-medium bg-stone-100 px-2 py-1 rounded-full">{time}</span>
    </div>
  );
}
