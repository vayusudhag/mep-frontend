import { useState } from "react";
import { Link } from "react-router-dom";

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  accentBorder,
  bgTint,
  iconColor,
  dark = false,
  to,
  pulse,
  onClick,
  expandable = false,
  actions = [],
  loading = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = (e) => {
    if (to) return;
    e.stopPropagation();
    if (onClick) onClick();
    else if (expandable) setOpen((prev) => !prev);
  };

  const Wrapper = to ? Link : "div";
  const iconClass = iconColor ? iconColor : "text-amber-700";
  const titleClass = dark ? "text-amber-100" : "text-stone-900";
  const valueClass = dark
    ? "text-amber-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
    : "text-stone-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.55)]";
  const iconBadgeClass = dark
    ? "bg-white/10 border-white/25"
    : "bg-white/70 border-white/80";
  const borderClass = dark ? "border-white/20" : "border-white/70";
  const overlayClass = dark
    ? "from-white/10 via-transparent to-black/20"
    : "from-white/35 via-transparent to-black/[0.03]";
  const actionTextClass = dark ? "text-amber-100" : "text-blue-700";

  return (
    <Wrapper
      to={to}
      onClick={handleClick}
      className={`block relative overflow-hidden border ${borderClass} border-l-4 ${accentBorder}
        ${bgTint}
        p-6 rounded-2xl shadow-[0_8px_24px_-16px_rgba(15,23,42,0.45)]
        transition-[transform,box-shadow,filter] duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.01] hover:brightness-[1.02]
        hover:shadow-[0_18px_38px_-18px_rgba(124,45,18,0.55)]
        cursor-pointer`}
    >
      <div
        className={`absolute inset-0 bg-linear-to-br ${overlayClass} pointer-events-none`}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${titleClass}`}>{title}</p>
          {value !== undefined && (
            <p className={`text-3xl font-serif mt-1 ${valueClass}`}>
              {loading ? (
                <span className="h-8 bg-stone-200 rounded animate-pulse w-16"></span>
              ) : (
                (value ?? "—")
              )}
            </p>
          )}
        </div>

        {pulse ? (
          <div
            className={`relative w-12 h-12 rounded-xl border p-1 ${iconBadgeClass}`}
          >
            <span
              className="absolute inset-0 rounded-full bg-red-500/40 animate-ping"
              style={{ animationDuration: "3s" }}
            />
            <Icon
              className={`relative z-10 w-full h-full ${iconClass} transition-transform duration-300 hover:scale-105`}
            />
          </div>
        ) : (
          <div className={`rounded-xl border p-2 ${iconBadgeClass}`}>
            <Icon
              className={`w-6 h-6 ${iconClass} transition-transform duration-300 hover:scale-105`}
            />
          </div>
        )}
      </div>

      {open && actions.length > 0 && (
        <div className="mt-4 pt-3 flex gap-3">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={`text-sm hover:underline flex items-center gap-2 ${actionTextClass}`}
            >
              <action.icon className={`w-6 h-6 ${action.color}`} />

              {/* {typeof action.icon === "function" && (
                <action.icon className={`w-6 h-6 ${action.color}`} />
              )} */}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </Wrapper>
  );
};

export default DashboardCard;
