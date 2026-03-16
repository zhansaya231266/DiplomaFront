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
import { Users, UserCheck, CreditCard, Clock } from "lucide-react";

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

export const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-[15px] text-gray-500 mt-1 font-medium">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Employees",
              val: "248",
              icon: Users,
              color: "text-blue-600",
              trend: "+12",
            },
            {
              label: "Present Today",
              val: "236",
              icon: UserCheck,
              color: "text-green-600",
              trend: "95.2%",
            },
            {
              label: "On Leave",
              val: "12",
              icon: Clock,
              color: "text-orange-600",
              trend: "-3",
            },
            {
              label: "Monthly Payroll",
              val: "10,000,500 ₸",
              icon: CreditCard,
              color: "text-purple-600",
              trend: "+8.2%",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span
                  className={`text-[12px] font-bold ${stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 leading-none">
                {stat.val}
              </h3>
              <p className="text-[13px] text-gray-400 font-medium mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            {/* Attendance Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[16px] font-bold text-gray-900">
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

            {/* Payroll Bar Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-6">
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
                      cursor={{ fill: "#F8FAFC" }}
                      contentStyle={{ borderRadius: "12px", border: "none" }}
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

          <div className="col-span-1 space-y-8">
            {/* Upcoming Events */}
            <div className="max-h-[400px] overflow-hidden flex flex-col">
              <UpcomingEvents />
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-6">
                Recent Activity
              </h3>
              <div className="space-y-6">
                {[
                  {
                    t: "Sarah Johnson added to Engineering",
                    d: "2 hours ago",
                    c: "bg-blue-500",
                  },
                  {
                    t: "February payroll processed",
                    d: "1 day ago",
                    c: "bg-green-500",
                  },
                  {
                    t: "Q1 attendance report generated",
                    d: "2 days ago",
                    c: "bg-purple-500",
                  },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.c}`}
                    ></div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 leading-snug">
                        {act.t}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {act.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
