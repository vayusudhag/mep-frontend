import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
} from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";

// shell (always visible — kept eager)
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { ShimmerTable } from "./components/ShimmerEffect";

// auth pages (lazy)
const Login = lazy(() => import("./Pages/auth/Login"));
const Register = lazy(() => import("./Pages/auth/Register"));
const ResetPassword = lazy(() => import("./Pages/auth/ResetPassword"));

// user pages (lazy)
const HomePage = lazy(() => import("./Pages/HomePage"));
const HistoryPage = lazy(() => import("./Pages/HistoryPage"));
const TeamsPage = lazy(() => import("./Pages/TeamsPage"));
const OwnersPage = lazy(() => import("./Pages/OwnersPage"));
const TeamDetailsPage = lazy(() => import("./Pages/TeamDetailsPage"));
const DriversPage = lazy(() => import("./Pages/DriversPage"));
const ProfilePage = lazy(() => import("./Pages/ProfilePage"));
const EventPage = lazy(() => import("./Pages/EventPage"));
const EventDetailsPage = lazy(() => import("./Pages/EventDetailsPage"));
const EventTeamDetailsPage = lazy(() => import("./Pages/EventTeamDetailsPage"));
const StatsPage = lazy(() => import("./Pages/StatsPage"));
const ActiveEventTeamsPage = lazy(() => import("./Pages/ActiveEventTeamsPage"));
const BullsPage = lazy(() => import("./Pages/BullsPage"));
const EditTeam = lazy(() => import("./Pages/user/EditTeam"));

// admin pages (lazy — kept out of the public bundle)
const Dashboard = lazy(() => import("./admin/pages/DashboardLayout"));
const TeamApproval = lazy(() => import("./admin/pages/TeamApproval"));
const EventManagement = lazy(() => import("./admin/pages/EventManagement"));
const TeamManagementPage = lazy(() => import("./admin/pages/TeamManagementPage"));
const AdminBullsPage = lazy(() => import("./admin/pages/AdminBullsPage"));
const TeamDetails = lazy(() =>
  import("./admin/components/ActiveTeams/TeamDetails"),
);
const Home = lazy(() => import("./admin/pages/HomePage"));
const AdminEventRegistrations = lazy(() =>
  import("./admin/pages/AdminEventRegistration"),
);

/* -------------------------
      SHARED FALLBACKS
------------------------- */
const PageFallback = () => (
  <div className="py-8">
    <ShimmerTable />
  </div>
);

const Unauthorized = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized</h1>
    <p className="text-gray-600 mb-6">
      You don't have permission to view this page.
    </p>
    <Link
      to="/"
      className="px-5 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
    >
      Go home
    </Link>
  </div>
);

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
    <p className="text-gray-600 mb-6">This page could not be found.</p>
    <Link
      to="/"
      className="px-5 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
    >
      Go home
    </Link>
  </div>
);

/* -------------------------
      LAYOUTS
------------------------- */
function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <div className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

function UserLayout({ mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <div className="min-h-screen bg-[#fbf6ee] flex flex-col">
      <Header />
      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

/* -------------------------
          MAIN APP
------------------------- */
function AppContent() {
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* -------- PUBLIC -------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route
            path="/edla-pandalu-2026-mellacheruvu"
            element={<HomePage />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* -------- USER -------- */}
        <Route
          element={
            <UserLayout
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          }
        >
          <Route path="/teams" element={<TeamsPage loading={loading} />} />
          <Route
            path="/active-teams"
            element={<ActiveEventTeamsPage loading={loading} />}
          />
          <Route path="/owners" element={<OwnersPage loading={loading} />} />
          <Route path="/bulls" element={<BullsPage loading={loading} />} />
          <Route path="/drivers" element={<DriversPage loading={loading} />} />
          <Route path="/events" element={<EventPage loading={loading} />} />
          <Route
            path="/events/:id"
            element={<EventDetailsPage loading={loading} />}
          />
          <Route
            path="/events/:eventId/teams/:teamId"
            element={<EventTeamDetailsPage loading={loading} />}
          />
          <Route path="/stats" element={<StatsPage />} />
          <Route
            path="/teams/:id"
            element={<TeamDetailsPage loading={loading} />}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage loading={loading} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/team/edit/:teamId"
            element={
              <ProtectedRoute>
                <EditTeam />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* -------- ADMIN -------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Suspense fallback={<PageFallback />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="team-approval" element={<TeamApproval />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="events/:eventId" element={<EventDetailsPage />} />
          <Route path="teams" element={<TeamManagementPage />} />
          <Route path="active-teams" element={<ActiveEventTeamsPage />} />
          <Route path="bulls" element={<AdminBullsPage />} />
          <Route path="teams-details/:id" element={<TeamDetails />} />
          <Route path="registrations" element={<AdminEventRegistrations />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* -------- 404 -------- */}
        <Route
          element={
            <UserLayout
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          }
        >
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
