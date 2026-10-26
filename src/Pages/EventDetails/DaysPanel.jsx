import DayList from "./DayList";
import CreateDayForm from "./CreateDayForm";
import DayEntriesSection from "./DayEntriesSection";
import {
  getEventDayEntries,
  updateEventDayStatus,
} from "../../services/events/event.api";

export default function DaysPanel({
  eventId,
  isAdmin,
  days,
  setDays,
  selectedDayId,
  setSelectedDayId,
  selectedDay,
  dayEntries,
  setDayEntries,
}) {
  const handleCreateDay = (day) => {
    setDays((prev) => [...prev, day]);
    setSelectedDayId(day._id);
  };

  const handleSelectDay = (dId) => {
    setSelectedDayId(dId);
    if (dId) {
      getEventDayEntries(eventId, dId).then((res) =>
        setDayEntries(Array.isArray(res) ? res : []),
      );
    } else {
      setDayEntries([]);
    }
  };

  const handleStatusChange = async (dayId, status) => {
    const res = await updateEventDayStatus(dayId, status);
    setDays((prev) => prev.map((d) => (d._id === dayId ? res : d)));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
        <h3 className="font-serif font-medium text-stone-800">
          Day-wise Gameplay
        </h3>
        <span className="text-sm text-stone-500">{days.length} Days</span>
      </div>
      {days.length === 0 ? (
        <div className="p-4">
          <div className="p-8 text-center text-stone-500">
            No event days yet.
          </div>
          {isAdmin && <CreateDayForm eventId={eventId} onCreated={handleCreateDay} />}
        </div>
      ) : (
        <div className="p-4">
          <DayList
            days={days}
            selectedDayId={selectedDayId}
            onSelect={handleSelectDay}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange}
          />
          {isAdmin && <CreateDayForm eventId={eventId} onCreated={handleCreateDay} />}
          {selectedDayId && (
            <DayEntriesSection
              eventId={eventId}
              dayId={selectedDayId}
              dayStatus={selectedDay?.status}
              selectedDay={selectedDay}
              entries={dayEntries}
              setEntries={setDayEntries}
              isAdmin={isAdmin}
            />
          )}
        </div>
      )}
    </div>
  );
}
