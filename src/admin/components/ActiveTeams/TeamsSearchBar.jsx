import { Search } from "lucide-react";

export default function TeamsSearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          placeholder="Search teams by name, owner, bull, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-700 placeholder:text-stone-400 bg-white shadow-sm"
        />
      </div>
    </div>
  );
}
