import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarClock,
  CreditCard,
  BarChart3,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./context/useAuth";
import { normalizeRole } from "../shared/utils/roles";

const superAdminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Employees", path: "/employees" },
  { icon: Clock, label: "Attendance", path: "/attendance" },
  { icon: CreditCard, label: "Payroll", path: "/payroll" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dept Overview", path: "/dashboard" },
  { icon: Users, label: "My Team", path: "/employees" },
  { icon: Clock, label: "My Attendance", path: "/attendance" },
  { icon: CalendarClock, label: "Team Attendance", path: "/team-attendance" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const employeeMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Clock, label: "Attendance", path: "/attendance" },
  { icon: CreditCard, label: "Payroll", path: "/payroll" },
];

const getInitialDarkMode = () => {
  const savedTheme = localStorage.getItem("theme");

  return (
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const role = normalizeRole(user?.role);
  const menuItems =
    role === "Admin"
      ? adminMenuItems
      : role === "Employee"
        ? employeeMenuItems
        : superAdminMenuItems;

  // Состояние темы (инициализация из документа или localStorage)
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  // Синхронизация при загрузке
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const isProfileActive = location.pathname === "/profile";
  const userDisplayName =
    [user?.firstname, user?.lastname].filter(Boolean).join(" ") ||
    user?.email ||
    "User";
  const userInitial = userDisplayName.charAt(0).toUpperCase() || "U";
  const userEmail = user?.email || "No email";

  return (
    <aside className="w-[260px] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col sticky top-0 h-screen z-20 font-sans transition-colors duration-300">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
            EMP
          </div>
          <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
            Smart EMP
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {!isLoading &&
            menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={`text-sm ${isActive ? "font-bold" : "font-semibold"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <span className="text-xs font-bold">
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* User Section Section */}
        <div className="pt-2 border-t border-gray-50 dark:border-gray-800">
          <button
            onClick={() => navigate("/profile")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group ${
              isProfileActive
                ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-900/40"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {/* Аватар */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-105 duration-200 ${
                isProfileActive
                  ? "bg-blue-600 shadow-md"
                  : "bg-gray-900 dark:bg-blue-600"
              }`}
            >
              {userInitial}
            </div>

            {/* Информация о пользователе */}
            <div className="flex-1 min-w-0 text-left">
              <p
                className={`text-xs truncate transition-colors ${
                  isProfileActive
                    ? "font-black text-blue-600 dark:text-blue-400"
                    : "font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600"
                }`}
              >
                {userDisplayName}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate font-medium tracking-tight">
                {userEmail}
              </p>
            </div>

            <div
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                isProfileActive
                  ? "bg-blue-600"
                  : "bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600"
              }`}
            />
          </button>

        </div>
      </div>
    </aside>
  );
};
