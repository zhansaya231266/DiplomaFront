import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { UpcomingEvents } from "../components/UpcomingEvents";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Bell,
  Building2,
  CheckCheck,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import { useAuth } from "../components/context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { normalizeRole } from "../shared/utils/roles";
import { getDepartmentOverview } from "../shared/constants/adminPanel";
import { employeeTasks } from "../shared/constants/employeePanel";

const attendanceData = [
  { name: "Mon", present: 230, absent: 5, late: 12 },
  { name: "Tue", present: 235, absent: 3, late: 8 },
  { name: "Wed", present: 232, absent: 4, late: 15 },
  { name: "Thu", present: 238, absent: 2, late: 5 },
  { name: "Fri", present: 234, absent: 3, late: 10 },
  { name: "Sat", present: 120, absent: 110, late: 2 },
  { name: "Sun", present: 10, absent: 230, late: 0 },
];

const payrollData = [
  { name: "Jan", amount: 2000000 },
  { name: "Feb", amount: 2150000 },
  { name: "Mar", amount: 2845000 },
];

const notificationColors: Record<string, string> = {
  payroll: "bg-green-500",
  salary: "bg-blue-500",
  system: "bg-purple-500",
};

const formatRelativeTime = (isoDate: string) => {
  const input = new Date(isoDate).getTime();
  const diffInMinutes = Math.max(1, Math.floor((Date.now() - input) / 60000));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(employeeTasks);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const {
    notifications,
    isLoading: isLoadingNotifications,
    isUpdating: isUpdatingNotifications,
    error: notificationsError,
    reload: reloadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ limit: 6, pollIntervalMs: 30000 });
  const hasUnreadNotifications = notifications.some((item) => !item.is_read);

  const submitReport = (taskId: number) => {
    const report = drafts[taskId]?.trim();
    if (!report) return;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: "Completed", report } : task,
      ),
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-[15px] font-medium text-gray-500 dark:text-gray-400">
            Personal workspace for{" "}
            {user?.firstname || user?.email || "employee"}.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-center gap-3">
                <ClipboardList
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                  Tasks From Admin
                </h3>
              </div>
              <div className="space-y-5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-gray-100 p-5 dark:border-gray-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[14px] font-bold text-gray-900 dark:text-white">
                          {task.title}
                        </p>
                        <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                          {task.assignedBy} / Due {task.dueDate}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                        {task.status}
                      </span>
                    </div>

                    {task.status !== "Completed" ? (
                      <div className="mt-4">
                        <textarea
                          value={drafts[task.id] || ""}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [task.id]: event.target.value,
                            }))
                          }
                          placeholder="Write a short report after completing the task..."
                          className="min-h-[100px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => submitReport(task.id)}
                          className="mt-3 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"
                        >
                          Submit Report
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-700 dark:bg-gray-800/50 dark:text-gray-200">
                        {task.report}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bell
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isLoadingNotifications || isUpdatingNotifications}
                    onClick={() => void reloadNotifications()}
                    className="text-xs font-bold text-gray-500 hover:text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                  <button
                    type="button"
                    disabled={
                      !hasUnreadNotifications || isUpdatingNotifications
                    }
                    onClick={() => void markAllAsRead()}
                    className="text-xs font-bold text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                </div>
              </div>

              {notificationsError && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {notificationsError}
                </div>
              )}

              {isLoadingNotifications ? (
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        !notification.is_read &&
                        void markAsRead(notification.id)
                      }
                      className={`w-full text-left flex gap-4 rounded-2xl px-3 py-3 transition-all ${
                        notification.is_read
                          ? "opacity-70"
                          : "bg-gray-50/70 dark:bg-gray-800/40"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notificationColors[notification.type] || "bg-gray-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <UpcomingEvents />
          </div>
        </div>
      </main>
    </div>
  );
};

const AdminOverviewDashboard = () => {
  const { user } = useAuth();
  const departmentName = user?.department || "Engineering";
  const overview = getDepartmentOverview(departmentName);
  const {
    notifications,
    isLoading: isLoadingNotifications,
    isUpdating: isUpdatingNotifications,
    error: notificationsError,
    reload: reloadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ limit: 6, pollIntervalMs: 30000 });
  const hasUnreadNotifications = notifications.some((item) => !item.is_read);
  const reportedTasks = overview.employees
    .flatMap((employee) =>
      employee.tasks
        .filter((task) => task.report)
        .map((task) => ({ ...task, employeeName: employee.name })),
    )
    .slice(0, 4);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">
            Dept Overview
          </h1>
          <p className="mt-1 text-[15px] font-medium text-gray-500 dark:text-gray-400">
            {departmentName} department snapshot for today.
          </p>
        </header>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              label: "Team Members",
              value: overview.totalEmployees,
              icon: Users,
            },
            {
              label: "Present Today",
              value: overview.inOffice,
              icon: Building2,
            },
            { label: "Remote Today", value: overview.remote, icon: UserCheck },
            { label: "Absent Today", value: overview.absent, icon: Clock },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                <card.icon size={20} />
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 dark:text-white">
                {card.value}
              </h3>
              <p className="mt-2 text-[13px] font-semibold text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-center gap-3">
                <FileText
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                  Recent Task Reports
                </h3>
              </div>
              <div className="space-y-4">
                {reportedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-800/50"
                  >
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </p>
                    <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                      {task.employeeName}
                    </p>
                    <p className="mt-3 text-[12px] text-gray-600 dark:text-gray-300">
                      {task.report?.summary}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bell
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isLoadingNotifications || isUpdatingNotifications}
                    onClick={() => void reloadNotifications()}
                    className="text-xs font-bold text-gray-500 hover:text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                  <button
                    type="button"
                    disabled={
                      !hasUnreadNotifications || isUpdatingNotifications
                    }
                    onClick={() => void markAllAsRead()}
                    className="text-xs font-bold text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                </div>
              </div>

              {notificationsError && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {notificationsError}
                </div>
              )}

              {isLoadingNotifications ? (
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        !notification.is_read &&
                        void markAsRead(notification.id)
                      }
                      className={`w-full text-left flex gap-4 rounded-2xl px-3 py-3 transition-all ${
                        notification.is_read
                          ? "opacity-70"
                          : "bg-gray-50/70 dark:bg-gray-800/40"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notificationColors[notification.type] || "bg-gray-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
            <UpcomingEvents />
          </div>
        </div>
      </main>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const {
    notifications,
    isLoading: isLoadingNotifications,
    isUpdating: isUpdatingNotifications,
    error: notificationsError,
    reload: reloadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ limit: 6, pollIntervalMs: 30000 });

  const hasUnreadNotifications = notifications.some((item) => !item.is_read);
  const userDisplayName = user?.firstname || user?.email || "User";

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Welcome back, {userDisplayName}. Here&apos;s what&apos;s happening
            today.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Employees",
              val: "248",
              icon: Users,
              color: "text-blue-600 dark:text-blue-400",
              bgColor: "bg-blue-50 dark:bg-blue-900/20",
              trend: "+12",
            },
            {
              label: "Present Today",
              val: "236",
              icon: UserCheck,
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-50 dark:bg-green-900/20",
              trend: "95.2%",
            },
            {
              label: "On Leave",
              val: "12",
              icon: Clock,
              color: "text-orange-600 dark:text-orange-400",
              bgColor: "bg-orange-50 dark:bg-orange-900/20",
              trend: "-3",
            },
            {
              label: "Monthly Payroll",
              val: "10,000,500 KZT",
              icon: CreditCard,
              color: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-50 dark:bg-purple-900/20",
              trend: "+8.2%",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span
                  className={`text-[12px] font-bold ${
                    stat.trend.startsWith("+") || stat.trend.includes("%")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 dark:text-white leading-none">
                {stat.val}
              </h3>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 font-medium mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                  Weekly Attendance Overview
                </h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                      className="dark:stroke-gray-800"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        backgroundColor: "var(--tw-colors-gray-900)",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="present"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10B981" }}
                      name="Present"
                    />
                    <Line
                      type="monotone"
                      dataKey="absent"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#EF4444" }}
                      name="Absent"
                    />
                    <Line
                      type="monotone"
                      dataKey="late"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#F59E0B" }}
                      name="Late"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all">
              <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-6">
                Payroll Expenses
              </h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payrollData}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(248, 250, 252, 0.05)" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: "#111827",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#8B5CF6"
                      radius={[6, 6, 0, 0]}
                      barSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="flex flex-col">
              <UpcomingEvents />
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bell
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isLoadingNotifications || isUpdatingNotifications}
                    onClick={() => void reloadNotifications()}
                    className="text-xs font-bold text-gray-500 hover:text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                  <button
                    type="button"
                    disabled={
                      !hasUnreadNotifications || isUpdatingNotifications
                    }
                    onClick={() => void markAllAsRead()}
                    className="text-xs font-bold text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                </div>
              </div>

              {notificationsError && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {notificationsError}
                </div>
              )}

              {isLoadingNotifications ? (
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        !notification.is_read &&
                        void markAsRead(notification.id)
                      }
                      className={`w-full text-left flex gap-4 rounded-2xl px-3 py-3 transition-all ${
                        notification.is_read
                          ? "opacity-70"
                          : "bg-gray-50/70 dark:bg-gray-800/40"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notificationColors[notification.type] || "bg-gray-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (role === "Employee") return <EmployeeDashboard />;
  if (role === "Admin") return <AdminOverviewDashboard />;
  return <SuperAdminDashboard />;
};
