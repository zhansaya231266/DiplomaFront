import {
  LayoutDashboard,
  Users,
  Clock,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Employees", path: "/employees" },
  { icon: Clock, label: "Attendance", path: "/attendance" },
  { icon: CreditCard, label: "Payroll", path: "/payroll" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen z-20">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
            HR
          </div>
          <span className="font-bold text-[18px] text-gray-900 tracking-tight">
            HRMS Platform
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[14px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="mt-auto p-4 border-t border-gray-50">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-900 truncate">
              Admin User
            </p>
            <p className="text-[11px] text-gray-400 truncate font-medium tracking-tighter">
              admin@company.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
