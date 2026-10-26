export default function BullInfo({ team }) {
  return (
    <div className="mt-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
      <h3 className="text-gray-900 mb-4">Bull Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Info label="Bulls" value={team.bullNames} />
        <Info label="Events Participated" value={team.totalEvents} />
        <Info label="Podium Finishes" value={team.podiums} />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}
