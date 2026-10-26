import React from "react";
import { motion } from "motion/react";

export default function StatCard({ title, value, subValue, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start justify-between"
    >
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
      {Icon && (
        <div className={`p-2 rounded-lg ${selectedColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </motion.div>
  );
}
