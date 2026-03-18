import React from "react";
import {
  User,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  LogOut,
  Phone,
  Wallet,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../components/context/AuthContext";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fullName =
    [user?.firstname, user?.lastname].filter(Boolean).join(" ") ||
    user?.email ||
    "User";
  const userData = {
    email: user?.email || "No email",
    role: user?.role || "EMPLOYEE",
    position: "Not specified",
    department: "Not specified",
    joinedDate: "Not specified",
    salary: "Not specified",
    phone: "Not specified",
    location: "Not specified",
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-8 py-10 space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <div className="relative">
              <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center text-blue-600 shadow-inner">
                <User size={60} strokeWidth={1.2} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  {fullName}
                </h1>
                <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                  {userData.role}
                </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-500 font-bold text-sm">
                <span className="flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-500" />
                  {userData.position}
                </span>
                <span className="flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" />
                  {userData.department}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm group"
              title="Logout"
            >
              <LogOut
                size={22}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-10 flex items-center gap-4">
                Personal Info
                <div className="h-px flex-1 bg-gray-50 dark:bg-gray-800" />
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <ProfileItem
                  icon={<Mail />}
                  label="Email Address"
                  value={userData.email}
                />
                <ProfileItem
                  icon={<Phone />}
                  label="Phone Number"
                  value={userData.phone}
                />
                <ProfileItem
                  icon={<Calendar />}
                  label="Joining Date"
                  value={userData.joinedDate}
                />
                <ProfileItem
                  icon={<MapPin />}
                  label="Work Location"
                  value={userData.location}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-10 flex items-center gap-4">
                Financials
                <div className="h-px flex-1 bg-gray-50 dark:bg-gray-800" />
              </h3>
              <div className="flex-1 flex flex-col justify-center">
                <div className="p-10 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                  <Wallet className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-2">
                    Monthly Net Salary
                  </p>
                  <p className="text-4xl font-black tracking-tight">
                    {userData.salary}
                  </p>
                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-black">
                    <span className="opacity-60 uppercase tracking-widest">
                      PAYMENT STATUS
                    </span>
                    <span className="bg-white/20 px-4 py-1.5 rounded-xl">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ProfileItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement<{ size?: number }>;
  label: string;
  value: string;
}) => (
  <div className="flex gap-5 group">
    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-2xl flex items-center justify-center transition-all duration-300">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <p className="font-bold text-gray-800 dark:text-gray-100 text-[15px]">
        {value}
      </p>
    </div>
  </div>
);
