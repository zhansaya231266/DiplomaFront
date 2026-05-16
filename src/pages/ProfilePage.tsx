import React, { useEffect, useState } from "react";
import { User, Briefcase, Building2, MapPin, Calendar, LogOut, Phone, Mail, Clock, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import {
  attendanceApi,
  calendarApi,
  profileApi,
  type CalendarSummaryResponse,
  type UserProfileResponse,
  type WorkScheduleItem,
} from "../api";
import { useAuth } from "../components/context/useAuth";
import { normalizeRole } from "../shared/utils/roles";

const EMPTY_VALUE_LABEL = "Not set";

const formatJoinedDate = (value?: string) => {
  if (!value) {
    return EMPTY_VALUE_LABEL;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
};

const formatSalary = (value?: string) => {
  if (!value) {
    return EMPTY_VALUE_LABEL;
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return value;
  }

  return new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [workSchedule, setWorkSchedule] = useState<WorkScheduleItem | null>(null);
  const [calendarSummary, setCalendarSummary] =
    useState<CalendarSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await profileApi.getMe();
        setProfile(response);
        setUser(response);

        const currentRole = normalizeRole(response.role);
        if (currentRole !== "SuperAdmin") {
          const month = new Date().toISOString().slice(0, 7);

          try {
            setCalendarSummary(await calendarApi.getSummary(month));
          } catch {
            setCalendarSummary(null);
          }

          const employeeId = response.employeeId || response.id;
          if (employeeId) {
            try {
              setWorkSchedule(
                await attendanceApi.getMyWorkSchedule(employeeId),
              );
            } catch {
              setWorkSchedule(null);
            }
          }
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load profile",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [setUser]);

  const fullName =
    profile?.fullName ||
    [profile?.firstname || user?.firstname, profile?.lastname || user?.lastname]
      .filter(Boolean)
      .join(" ") ||
    profile?.email ||
    user?.email ||
    "User";
  const role = normalizeRole(profile?.role || user?.role);
  const normalizedRole = (profile?.role || user?.role || "EMPLOYEE").toUpperCase();
  const isSuperAdmin = role === "SuperAdmin";
  const getDisplayValue = (value?: string | null) =>
    value && value.trim() ? value : EMPTY_VALUE_LABEL;

  const userData = {
    email: profile?.email || user?.email || "No email",
    role: normalizedRole,
    position: getDisplayValue(profile?.position),
    department: getDisplayValue(profile?.department),
    joinedDate: formatJoinedDate(profile?.joinedDate),
    salary: formatSalary(profile?.salary),
    phone: getDisplayValue(profile?.phone || profile?.phoneNumber),
    location: getDisplayValue(profile?.location),
  };

  const personalInfoItems = [
    {
      icon: <Mail />,
      label: "Email Address",
      value: userData.email,
    },
    {
      icon: <Phone />,
      label: "Phone Number",
      value: userData.phone,
    },
    {
      icon: <Calendar />,
      label: "Joining Date",
      value: userData.joinedDate,
    },
    {
      icon: <MapPin />,
      label: "Work Location",
      value: userData.location,
    },
  ].filter((item) => !isSuperAdmin || item.value !== EMPTY_VALUE_LABEL);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const holidays =
    calendarSummary?.days.filter((day) => day.type === "HOLIDAY") || [];

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-8 py-10 space-y-8">
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <div className="relative">
              <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center text-blue-600 shadow-inner">
                <User size={60} strokeWidth={1.2} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left relative z-10">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                {isSuperAdmin ? "Profile" : "My Profile"}
              </p>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {isLoading ? "Loading profile..." : fullName}
                </h1>
                <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                  {userData.role}
                </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-500 font-bold text-sm">
                {(!isSuperAdmin || userData.position !== EMPTY_VALUE_LABEL) && (
                  <span className="flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-500" />
                    {userData.position}
                  </span>
                )}
                {(!isSuperAdmin || userData.department !== EMPTY_VALUE_LABEL) && (
                  <span className="flex items-center gap-2">
                    <Building2 size={16} className="text-blue-500" />
                    {userData.department}
                  </span>
                )}
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

          <div className={`grid grid-cols-1 ${isSuperAdmin ? "" : "lg:grid-cols-2"} gap-8 items-stretch`}>
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-10 flex items-center gap-4">
                Personal Info
                <div className="h-px flex-1 bg-gray-50 dark:bg-gray-800" />
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {personalInfoItems.map((item) => (
                  <ProfileItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </div>

            {!isSuperAdmin && (
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-10 flex items-center gap-4">
                Current Position
                <div className="h-px flex-1 bg-gray-50 dark:bg-gray-800" />
              </h3>
              <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 gap-6">
                  <div className="rounded-[2.5rem] bg-blue-600 p-8 text-white shadow-2xl shadow-blue-600/30">
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-[0.2em] mb-2">
                      Position
                    </p>
                    <p className="text-2xl font-black tracking-tight">
                      {userData.position}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-blue-100">
                      Department: {userData.department}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <ProfileItem
                      icon={<Building2 />}
                      label="Department"
                      value={userData.department}
                    />
                    <ProfileItem
                      icon={<Briefcase />}
                      label="Role"
                      value={userData.role}
                    />
                    <ProfileItem
                      icon={<MapPin />}
                      label="Work Location"
                      value={userData.location}
                    />
                    <ProfileItem
                      icon={<Calendar />}
                      label="Joining Date"
                      value={userData.joinedDate}
                    />
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {!isSuperAdmin && (
            <div className="grid grid-cols-1 gap-8">
              <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="mb-8 flex items-center gap-4 text-xl font-black text-gray-900 dark:text-white">
                  Work Schedule
                  <div className="h-px flex-1 bg-gray-50 dark:bg-gray-800" />
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <ProfileItem
                    icon={<Clock />}
                    label="Work Start"
                    value={workSchedule?.workStart || EMPTY_VALUE_LABEL}
                  />
                  <ProfileItem
                    icon={<Clock />}
                    label="Work End"
                    value={workSchedule?.workEnd || EMPTY_VALUE_LABEL}
                  />
                  <ProfileItem
                    icon={<Bell />}
                    label="Late Allowance"
                    value={
                      workSchedule
                        ? `${workSchedule.lateThresholdMinutes} min`
                        : EMPTY_VALUE_LABEL
                    }
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-300">
                  {holidays.length > 0
                    ? `Holiday notice: ${holidays
                        .map((day) => `${day.date} ${day.name || "Holiday"}`)
                        .join(", ")}.`
                    : "No holiday notices for the current month."}
                </div>
              </section>
            </div>
          )}
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
      <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
        {value}
      </p>
    </div>
  </div>
);
