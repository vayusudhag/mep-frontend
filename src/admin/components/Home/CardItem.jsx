export default function CardItem({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
  pulse,
  loading = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-stone-200 rounded-xl p-6 hover:border-amber-400 hover:shadow-md transition-all duration-300 flex flex-col h-full ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-stone-600 font-medium text-sm uppercase tracking-wide">
          {title}
        </h3>
        {pulse && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-auto">
        <div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-stone-200 rounded w-16 mb-1"></div>
              <div className="h-4 bg-stone-200 rounded w-24"></div>
            </div>
          ) : (
            <>
              <div className="text-4xl font-serif text-stone-800 font-medium mb-1">
                {value}
              </div>
              <p className="text-stone-500 text-sm">{subtitle}</p>
            </>
          )}
        </div>
        <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {onClick && (
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-amber-700 text-sm font-medium group">
          <span>View details</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
