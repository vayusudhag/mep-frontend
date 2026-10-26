import React from "react";

const Skeleton = ({ width = "w-full", height = "h-4", rounded = "rounded-md", className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-stone-200/60 ${width} ${height} ${rounded} ${className}`}
    >
      <div
        className="
          pointer-events-none
          absolute inset-y-0 left-0
          w-1/2
          bg-gradient-to-r from-transparent via-white/40 to-transparent
          animate-shimmer
        "
      />
    </div>
  );
};

const CardSkeleton = () => {
  return (
    <div aria-busy="true" className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton width="w-24" height="h-3" />
          <Skeleton width="w-32" height="h-7" />
        </div>
        <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
      </div>
    </div>
  );
};

const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div aria-busy="true" className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <Skeleton width="w-24" height="h-3" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton width="w-20" height="h-3" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton width="w-16" height="h-3" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton width="w-10" height="h-3" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {Array.from({ length: rows }).map((_, idx) => (
            <tr key={idx} className="hover:bg-stone-50 transition-colors">
              <td className="px-4 py-3">
                <Skeleton width="w-40" height="h-4" />
              </td>
              <td className="px-4 py-3">
                <Skeleton width="w-32" height="h-4" />
              </td>
              <td className="px-4 py-3">
                <Skeleton width="w-12" height="h-4" />
              </td>
              <td className="px-4 py-3 text-right">
                <Skeleton width="w-16" height="h-4" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ListSkeleton = ({ items = 5 }) => {
  return (
    <div aria-busy="true" className="space-y-3">
      {Array.from({ length: items }).map((_, idx) => (
        <Skeleton
          key={idx}
          width={idx % 3 === 0 ? "w-3/4" : idx % 3 === 1 ? "w-2/3" : "w-full"}
          height="h-4"
        />
      ))}
    </div>
  );
};

const ShimmerTable = TableSkeleton;

export { Skeleton, CardSkeleton, TableSkeleton, ListSkeleton, ShimmerTable };
