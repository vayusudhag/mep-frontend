import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  UserSquare2,
  Trophy,
  Calendar,
  BarChart3,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLogin, user } = useAuth() || {};

  const baseNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "teams", label: "Teams", icon: UserSquare2, path: "/teams" },
    { id: "bulls", label: "Bulls", icon: Trophy, path: "/bulls" },
    { id: "owners", label: "Owners", icon: Users, path: "/owners" },
    { id: "drivers", label: "Drivers", icon: Trophy, path: "/drivers" },
    { id: "events", label: "Events", icon: Calendar, path: "/events" },
    { id: "statistics", label: "Statistics", icon: BarChart3, path: "/stats" },
    {
      id: `${isLogin ? "profile" : "register"}`,
      label: `${isLogin ? "Profile" : "Register"}`,
      icon: UserSquare2,
      path: `${isLogin ? "/profile" : "/register"}`,
    },
  ];

  const navItems = [
    ...baseNavItems,
    ...(isLogin && user?.role?.toLowerCase() === "admin"
      ? [{ id: "admin", label: "Admin", icon: Shield, path: "/admin/home" }]
      : []),
  ];

  return (
    <>
      <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <span className="font-semibold text-stone-700">Menu</span>

        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          className="text-stone-700 p-2 rounded-md hover:bg-stone-100 transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav className="hidden lg:block bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-6 py-4 font-medium transition-all rounded-lg ${
                      isActive
                        ? "text-amber-700 bg-amber-100 border border-amber-300 shadow-sm"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <nav className="lg:hidden bg-white/80 backdrop-blur-md border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-3 px-4 py-3 font-medium transition-all rounded-lg mb-1 ${
                      isActive
                        ? "text-amber-700 bg-amber-50 border border-amber-100"
                        : "text-stone-600 hover:bg-stone-50"
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};

export default Navigation;
