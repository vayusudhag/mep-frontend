export default function StatusBadge({ status }) {
  const colors = {
    upcoming: "border-blue-300 bg-blue-100 text-blue-800",
    ongoing: "border-green-300 bg-green-100 text-green-800",
    completed: "border-gray-300 bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-sm border-2 ${colors[status.toLowerCase()] || "border-gray-300 bg-gray-100 text-gray-800"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
