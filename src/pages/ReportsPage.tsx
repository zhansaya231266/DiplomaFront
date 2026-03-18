import { Sidebar } from "../components/Sidebar";
import {
  FileText,
  ArrowUpRight,
  Users,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const ReportsPage = () => {
  // Данные для графиков
  const deptData = [
    { name: "Engineering", count: 85 },
    { name: "Marketing", count: 32 },
    { name: "Sales", count: 45 },
    { name: "HR", count: 18 },
    { name: "Finance", count: 24 },
    { name: "Operations", count: 44 },
  ];

  const attendanceData = [
    { name: "Present", value: 236, color: "#10B981" },
    { name: "Absent", value: 4, color: "#EF4444" },
    { name: "On Leave", value: 12, color: "#3B82F6" },
    { name: "Late", value: 8, color: "#F59E0B" },
  ];

  const formatKZT = (amount: number) => {
    return new Intl.NumberFormat("kk-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-8 text-left">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
              View and export detailed workforce insights
            </p>
          </div>
          <button className="px-6 py-2.5 bg-blue-600 text-white text-[14px] font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none">
            <Download size={18} /> Export All Data
          </button>
        </header>

        {/* QUICK REPORT CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-10 text-left">
          {[
            {
              title: "Payroll Summary",
              desc: "Full breakdown for March 2026",
              icon: FileText,
              color: "text-purple-500",
              bg: "bg-purple-50 dark:bg-purple-900/10",
            },
            {
              title: "Attendance Report",
              desc: "Analysis for last 30 days",
              icon: Calendar,
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-900/10",
            },
            {
              title: "Performance",
              desc: "Workforce productivity metrics",
              icon: BarChart3,
              color: "text-green-500",
              bg: "bg-green-50 dark:bg-green-900/10",
            },
          ].map((report, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer"
            >
              <div
                className={`w-12 h-12 ${report.bg} ${report.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
              >
                <report.icon size={24} />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1">
                {report.title}
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4 font-medium">
                {report.desc}
              </p>
              <span className="text-[13px] font-black text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Generate <ArrowUpRight size={14} />
              </span>
            </div>
          ))}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* Department Distribution (Bar Chart) */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm text-left">
            <div className="flex items-center gap-3 mb-8">
              <Users className="text-blue-500" size={20} />
              <h3 className="text-[18px] font-extrabold text-gray-900 dark:text-white">
                Department Distribution
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                    className="dark:stroke-gray-800"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#4B5563",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6", opacity: 0.1 }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      backgroundColor: "#ffffff",
                      padding: "10px",
                    }}
                    labelStyle={{
                      color: "#111827",
                      fontWeight: "800",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "#3B82F6",
                      fontSize: "13px",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3B82F6"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Attendance (Pie Chart) */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm text-left">
            <div className="flex items-center gap-3 mb-8">
              <PieChartIcon className="text-green-500" size={20} />
              <h3 className="text-[18px] font-extrabold text-gray-900 dark:text-white">
                Today's Attendance
              </h3>
            </div>
            <div className="h-[300px] w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{ paddingLeft: "20px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* DEPARTMENT PAYROLL SUMMARY TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-[18px] font-extrabold text-gray-900 dark:text-white">
              Department Payroll Summary
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
              Average monthly payroll by department
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                {[
                  "Department",
                  "Employees",
                  "Avg. Salary",
                  "Total Monthly",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {[
                {
                  name: "Engineering",
                  count: 85,
                  avg: 950000,
                  total: 80750000,
                },
                { name: "Marketing", count: 32, avg: 720000, total: 23040000 },
                { name: "Sales", count: 45, avg: 780000, total: 35100000 },
                { name: "HR", count: 18, avg: 650000, total: 11700000 },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-8 py-5 font-bold text-gray-900 dark:text-white text-[14px]">
                    {row.name}
                  </td>
                  <td className="px-8 py-5 text-gray-500 dark:text-gray-400 text-[14px] font-medium">
                    {row.count}
                  </td>
                  <td className="px-8 py-5 text-gray-900 dark:text-gray-300 text-[14px]">
                    {formatKZT(row.avg)}
                  </td>
                  <td className="px-8 py-5 text-gray-900 dark:text-white text-[14px] font-black">
                    {formatKZT(row.total)}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                <td className="px-8 py-5 font-black text-blue-600 dark:text-blue-400 text-[14px]">
                  Total
                </td>
                <td className="px-8 py-5 font-black text-blue-600 dark:text-blue-400 text-[14px]">
                  180
                </td>
                <td className="px-8 py-5">-</td>
                <td className="px-8 py-5 font-black text-blue-600 dark:text-blue-400 text-[15px]">
                  {formatKZT(150590000)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
