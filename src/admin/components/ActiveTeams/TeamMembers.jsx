export default function TeamMembers({ members }) {
  return (
    <div>
      <h3 className="text-gray-900 mb-4">Team Members</h3>

      <div className="space-y-2">
        {members.map((m, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white">
              {m.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm truncate">{m.name}</p>
              <p className="text-gray-600 text-xs">{m.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
