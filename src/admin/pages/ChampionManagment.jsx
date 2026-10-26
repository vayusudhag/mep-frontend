import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import ChampionForm from "../components/ChampionShip/ChampionForm";
import ChampionCard from "../components/ChampionShip/ChampionCard";
import Modal from "../components/ChampionShip/Modal";
import { getAllEvents } from "../../services/events/event.api";
import { getLeaderboard } from "../../services/events/event.api";

export default function ChampionManagement() {
  const [champions, setChampions] = useState([]);
  const [events, setEvents] = useState([]);
  const completedEvents = useMemo(
    () => events.filter((e) => e.state === "COMPLETED"),
    [events]
  );

  const [editingChampion, setEditingChampion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllEvents();
        setEvents(res.data.data || []);
        // Preload champions from leaderboards for completed events
        const completed = (res.data.data || []).filter((e) => e.state === "COMPLETED");
        const results = await Promise.all(
          completed.map(async (e) => {
            try {
              const lb = await getLeaderboard(e._id);
              const top = lb.data.data?.[0];
              if (!top) return null;
              
              // Handle new data structure from EventDayEntry
              const teamName = top.teams?.[0]?.teamName || top.team?.teamName || "Unknown";
              const bullName = top.bull1?.name || top.bullName || "N/A";
              const time = top.performance?.timeSeconds || top.timeTaken;
              
              return {
                id: `${e._id}`,
                eventId: e._id,
                eventName: e.title,
                eventDate: e.timings?.from,
                winnerName: teamName,
                bullName: bullName,
                raceTime: time ? `${time}s` : undefined,
                prizeAmount: top?.prizeAmount || undefined,
                notes: "Auto-derived from leaderboard",
              };
            } catch {
              return null;
            }
          })
        );
        setChampions(results.filter(Boolean));
      } catch {
        setEvents([]);
        setChampions([]);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    setEditingChampion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (champion) => {
    setEditingChampion(champion);
    setIsFormOpen(true);
  };

  const handleSave = (data) => {
    const existingEvent = completedEvents.find((e) => e._id === data.eventId);
    if (!existingEvent) return;

    const payload = {
      ...data,
      eventName: existingEvent.title,
      eventDate: existingEvent.timings?.from,
    };

    if (editingChampion) {
      setChampions(
        champions.map((c) => (c.id === editingChampion.id ? payload : c))
      );
    } else {
      setChampions([...champions, { ...payload, id: Date.now().toString() }]);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fbf6ee] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-stone-800 font-medium mb-2">
              Champions & Winners
            </h1>
            <p className="text-stone-600">
              Update champion details for completed races
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm font-medium"
          >
            <Trophy className="w-5 h-5" />
            Add Champion
          </button>
        </div>

        {/* Modal + Form */}
        {isFormOpen && (
          <Modal
            title={editingChampion ? "Edit Champion" : "Add Champion"}
            onClose={() => setIsFormOpen(false)}
          >
            <ChampionForm
              completedEvents={completedEvents.map((e) => ({
                id: e._id,
                name: e.title,
                date: e.timings?.from,
              }))}
              initialData={editingChampion}
              onSave={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </Modal>
        )}

        {/* Champion List */}
        <div className="space-y-6">
          {champions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
              <p className="text-stone-500 font-medium">
                No champions recorded yet. Add champion details for completed races.
              </p>
            </div>
          ) : (
            champions.map((champion) => (
              <ChampionCard
                key={champion.id}
                champion={champion}
                onEdit={() => handleEdit(champion)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
