import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllDriversAPI } from "../services/drivers/driver.api";

const DriversPage = ({ loading }) => {
  const [drivers, setDrivers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        setPageLoading(true);
        const res = await getAllDriversAPI();
        setDrivers(res.data.data || []);
      } catch {
        setDrivers([]);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, []);

  const isLoading = loading || pageLoading;

  // 🔍 Search
  const filteredDrivers = useMemo(() => {
    return drivers.filter(
      (d) =>
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.teamsPlayed || []).join(", ").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.bullsPlayed || []).join(", ").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, drivers]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredDrivers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentDrivers = filteredDrivers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf6ee] flex justify-center items-center">
        <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
          <p className="text-stone-500 font-medium">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-serif font-medium text-stone-800 mb-4">Drivers</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search drivers, teams, or bulls..."
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 text-stone-600 uppercase text-xs border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Teams</th>
                  <th className="px-4 py-3">Bulls</th>
                  <th className="px-4 py-3">Events Played</th>
                  <th className="px-4 py-3">Best Rank</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-stone-700">
                {currentDrivers.length > 0 ? (
                  currentDrivers.map((driver) => (
                    <tr
                      key={driver.id}
                      className="hover:bg-stone-50 border-b border-stone-100 last:border-none transition"
                    >
                      <td className="px-4 py-3 font-medium text-stone-800">
                        {driver.name}
                      </td>
                      <td className="px-4 py-3">
                        {(driver.teamsPlayed || []).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {(driver.bullsPlayed || []).join(" + ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {driver.eventsParticipated || 0}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {driver.bestRank ? `#${driver.bestRank}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                            driver.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {driver.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-stone-500">
                      No drivers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-3 border-t border-stone-200 bg-stone-50">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-stone-200 rounded hover:bg-stone-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-stone-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-stone-200 rounded hover:bg-stone-100 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriversPage;
