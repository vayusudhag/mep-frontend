import { useEffect, useState } from "react";
import UserEventCard from "../components/UserEventCard";
import EventRegistrationForm from "../components/EventRegistrationForm";

import { registerForEvent } from "../services/events/eventRegistraion.api";
import { toast } from "react-hot-toast";
import { useEventsDashboard } from "../hooks/useEventsDashboard";

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const {
    events,
    team,
    teamBulls,
    allBulls,
    registrations,
    alreadyRegistered,
    loading,
    error,
  } = useEventsDashboard();
  const isApprovedTeam =
    team?.status && team.status.toUpperCase() === "APPROVED";

  useEffect(() => {
    const approved = (registrations || []).filter(
      (reg) => reg?.status?.toUpperCase() === "APPROVED" && reg?._id,
    );

    approved.forEach((reg) => {
      const key = `event-registration-approved-notified:${reg._id}`;
      if (localStorage.getItem(key) === "1") return;

      const eventTitle =
        typeof reg?.event === "object" ? reg?.event?.title : null;

      toast.success(
        eventTitle
          ? `Your registration is approved for ${eventTitle}`
          : "Your event registration has been approved",
      );
      localStorage.setItem(key, "1");
    });
  }, [registrations]);

  // REGISTER HANDLER

  const handleRegister = async (data) => {
    await registerForEvent(selectedEvent._id, data);
    toast.success("Registered successfully (Pending approval)");
    setSelectedEvent(null);
  };

  // RENDER GUARDS

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf6ee] flex justify-center items-center">
        <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mb-4"></div>
          <p className="text-stone-500 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* No team warning */}
        {!team && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-stone-800">
            You must be part of an approved team to register for events.
          </div>
        )}
        {team && !isApprovedTeam && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-stone-800">
            Your team is pending approval. You can register for events once it
            is approved.
          </div>
        )}

        {/* Events */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm">
            <p className="text-stone-500 font-medium">No upcoming events</p>
          </div>
        ) : (
          events.map((event) => (
            <UserEventCard
              key={event._id}
              event={event}
              canRegister={isApprovedTeam && !alreadyRegistered[event._id]}
              onRegister={setSelectedEvent}
            />
          ))
        )}

        {/* Registration modal */}
        {selectedEvent && isApprovedTeam && (
          <EventRegistrationForm
            event={selectedEvent}
            team={team}
            bulls={teamBulls}
            allBulls={allBulls}
            teamMembers={team.teamMembers}
            onSubmit={handleRegister}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </div>
  );
}
