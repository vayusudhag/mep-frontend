export default function PositionBadge({ position }) {
  const colors = {
    1: "bg-amber-100 text-amber-800 border-amber-300",
    2: "bg-gray-100 text-gray-800 border-gray-300",
    3: "bg-orange-100 text-orange-800 border-orange-300",
  };

  const style = colors[position] || "bg-blue-100 text-blue-800 border-blue-300";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${style}`}>
      {position === 1
        ? "🥇"
        : position === 2
        ? "🥈"
        : position === 3
        ? "🥉"
        : `#${position}`}{" "}
      Position {position}
    </span>
  );
}
