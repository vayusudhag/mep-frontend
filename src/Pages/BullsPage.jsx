import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getAllBullsAPI } from "../services/bulls/bulls.api";
import { CardSkeleton } from "../components/ShimmerEffect";

const BullsPage = () => {
  const [bulls, setBulls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBulls = async () => {
      try {
        setLoading(true);
        const res = await getAllBullsAPI();
        setBulls(res);
      } catch (error) {
        console.error("Failed to fetch bulls:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBulls();
  }, []);

  const filteredBulls = useMemo(() => {
    return bulls.filter((bull) => {
      const search = searchTerm.toLowerCase();
      const teamName =
        bull.teamName || bull.teamId?.teamName || bull.team?.teamName || "";
      return (
        bull.name?.toLowerCase().includes(search) ||
        teamName.toLowerCase().includes(search)
      );
    });
  }, [bulls, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf6ee] p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8 pt-0 md:px-10">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Back Link */}
        <Link
          to="/"
          className="text-sm text-amber-700 hover:text-amber-900 font-medium transition"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-serif text-stone-800 font-medium">
            All Bulls
          </h1>
          <p className="text-stone-600 mt-1">Browse all registered bulls</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by bull name or team name..."
            className="flex-1 outline-none text-stone-700 placeholder-stone-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
              <p className="text-stone-500">Loading bulls...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-stone-600">
                      Bull Name
                    </th>
                    <th className="px-6 py-4 font-medium text-stone-600">
                      Company Name (Team)
                    </th>
                    <th className="px-6 py-4 font-medium text-stone-600">
                      Category
                    </th>
                    <th className="px-6 py-4 font-medium text-stone-600 text-center">
                      Events Participated
                    </th>
                    <th className="px-6 py-4 font-medium text-stone-600 text-right">
                      Rank
                    </th>
                    <th className="px-6 py-4 font-medium text-stone-600 text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredBulls.length > 0 ? (
                    filteredBulls.map((bull) => (
                      <tr
                        key={bull._id}
                        className="hover:bg-stone-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-stone-900">
                          {bull.name}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {bull.teamName ||
                            bull.teamId?.teamName ||
                            bull.team?.teamName ||
                            "—"}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {bull.currentCategory?.value || "—"}
                        </td>
                        <td className="px-6 py-4 text-stone-600 text-center">
                          {bull.eventsPlayed ?? bull.totalEvents ?? 0}
                        </td>
                        <td className="px-6 py-4 text-stone-600 text-right font-mono">
                          {bull.bestRank ? `#${bull.bestRank}` : "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              bull.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bull.status || "UNKNOWN"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-stone-500"
                      >
                        No bulls found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BullsPage;
