import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  getEventById,
  getEventDays as getEventDaysPublic,
  getEventDayEntries,
} from "../services/events/event.api";
import { ArrowLeft } from "lucide-react";
import PageState from "./EventDetails/PageState";
import EventHeader from "./EventDetails/EventHeader";
import DaysPanel from "./EventDetails/DaysPanel";

export default function EventDetailsPage() {
  const routeParams = useParams();
  const eventId = routeParams.id || routeParams.eventId;
  const [event, setEvent] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [dayEntries, setDayEntries] = useState([]);
  const selectedDay = days.find((d) => d._id === selectedDayId) || null;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("days"); // 'days'
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    loadData();
  }, [eventId, isAdminRoute]);

  useEffect(() => {
    const loadDayEntries = async () => {
      if (!eventId || !selectedDayId) {
        setDayEntries([]);
        return;
      }

      try {
        const entries = await getEventDayEntries(eventId, selectedDayId);
        setDayEntries(Array.isArray(entries) ? entries : []);
      } catch {
        setDayEntries([]);
      }
    };

    loadDayEntries();
  }, [eventId, selectedDayId]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [eventRes, daysRes] = await Promise.all([
        getEventById(eventId),
        getEventDaysPublic(eventId),
      ]);
      const eventPayload =
        eventRes?.event ?? eventRes?.data?.event ?? eventRes?.data ?? eventRes;
      setEvent(eventPayload || null);
      const d = Array.isArray(daysRes)
        ? daysRes
        : Array.isArray(daysRes?.data)
          ? daysRes.data
          : [];
      setDays(d);

      setSelectedDayId(d.length > 0 ? d[0]._id : null);
      setErrorMsg("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load event details";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageState type="loading" />;
  if (!event) return <PageState type="not-found" />;

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </Link>
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
            {errorMsg}
          </div>
        )}
        <EventHeader event={event} />

        {/* Tabs */}
        <div className="flex border-b border-stone-200">
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "days"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
            onClick={() => setActiveTab("days")}
          >
            Event Days
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === "days" && (
            <DaysPanel
              eventId={eventId}
              isAdmin={isAdminRoute}
              days={days}
              setDays={setDays}
              selectedDayId={selectedDayId}
              setSelectedDayId={setSelectedDayId}
              selectedDay={selectedDay}
              dayEntries={dayEntries}
              setDayEntries={setDayEntries}
            />
          )}
        </div>
      </div>
    </div>
  );
}
