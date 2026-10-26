import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  UserIcon,
  History,
  YoutubeIcon,
  Contact,
  CalendarDays,
  Trophy,
  Instagram,
  HandCoins,
} from "lucide-react";

import Header from "../components/Header";
import Navigation from "../components/Navigation";
import DashboardCard from "../components/DashboardCard";
import { CardSkeleton } from "../components/ShimmerEffect";

import { getDashboardCountsAPI } from "../services/dashboard/dashboard.api";

const YOUTUBE_LIVE_URL = "https://www.youtube.com/@pnr0463";
const INSTAGRAM_URL = "https://www.instagram.com/mana_edla_pandalu/";
const WHATSAPP_URL = "https://wa.me/9154143819";

const HomePage = ({ loading }) => {
  const navigate = useNavigate();

  const [dashboardCounts, setDashboardCounts] = useState({
    activeTeams: 0,
    activeBulls: 0,
    totalEvents: 0,
  });

  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const res = await getDashboardCountsAPI();
        setDashboardCounts(res.data.data);
      } catch (err) {
        console.error("Dashboard count fetch failed", err);
        // setError("Failed to load dashboard data");
      } finally {
        setCountsLoading(false);
      }
    };

    fetchDashboardCounts();
  }, []);

  if (loading || countsLoading) {
    return (
      <>
        <Header />
        <Navigation />
        <div className="min-h-screen bg-[#fbf6ee]">
          <div className="max-w-7xl mx-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  const cards = [
    {
      title: "Active Teams",
      value: dashboardCounts.activeTeams ?? 0,
      icon: UserIcon,
      accentBorder: "border-emerald-500",
      bgTint: "bg-linear-to-br from-emerald-200 via-emerald-50 to-teal-300",
      iconColor: "text-emerald-700",
      to: "/active-teams",
    },
    {
      title: "Active Bulls",
      value: dashboardCounts.activeBulls ?? 0,
      icon: Trophy,
      accentBorder: "border-rose-500",
      bgTint: "bg-linear-to-br from-rose-200 via-rose-50 to-orange-300",
      iconColor: "text-rose-700",
      to: "/bulls",
    },
    {
      title: "Total Events",
      value: dashboardCounts.totalEvents ?? 0,
      icon: CalendarDays,
      accentBorder: "border-sky-500",
      bgTint: "bg-linear-to-br from-sky-200 via-sky-50 to-blue-300",
      iconColor: "text-sky-700",
      to: "/events",
    },
    {
      title: "YouTube Live",
      icon: YoutubeIcon,
      accentBorder: "border-red-500",
      bgTint: "bg-linear-to-br from-red-200 via-red-50 to-orange-300",
      iconColor: "text-red-700",
      pulse: true,
      onClick: () => window.open(YOUTUBE_LIVE_URL, "_blank"),
    },
    {
      title: "History",
      icon: History,
      accentBorder: "border-violet-500",
      bgTint: "bg-linear-to-br from-violet-200 via-violet-50 to-purple-300",
      iconColor: "text-violet-700",
      onClick: () => navigate("/history"),
    },
    {
      title: "Contact & Help",
      icon: Contact,
      accentBorder: "border-cyan-500",
      bgTint: "bg-linear-to-br from-cyan-200 via-cyan-50 to-teal-300",
      iconColor: "text-cyan-700",
      expandable: true,
      actions: [
        {
          icon: Instagram,
          label: "Instagram",
          color: "text-rose-500",
          onClick: () => window.open(INSTAGRAM_URL, "_blank"),
        },
        {
          icon: Contact,
          label: "WhatsApp",
          color: "text-green-500",
          onClick: () => window.open(WHATSAPP_URL, "_blank"),
        },
      ],
    },
    // {
    //   title: "Help Us",
    //   icon: HandCoins,
    //   accentBorder: "border-amber-500",
    //   bgTint: "bg-linear-to-br from-amber-200 via-amber-50 to-orange-300",
    //   iconColor: "text-amber-700",
    //   onClick: () => window.open(UPI, "_blank"),
    // },
  ];

  return (
    <>
      <Header />
      <Navigation />

      <div className="min-h-screen bg-linear-to-b from-[#fffaf0] via-[#fbf6ee] to-[#f5eee3]">
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-r from-amber-100 via-orange-100 to-yellow-100 p-6 md:p-8 shadow-sm"
          >
            <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
            <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-orange-200/40 blur-2xl" />
            <h1 className="relative text-2xl md:text-3xl font-serif text-stone-800">
              Mana Edla Pandalu
            </h1>
            <p className="relative mt-2 text-stone-600">
              Track teams, bulls, events and live updates in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: index * 0.05,
                }}
              >
                <DashboardCard {...card} loading={false} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
