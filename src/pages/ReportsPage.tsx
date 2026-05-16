import { useEffect, useState } from "react";
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
import {
  getApiErrorMessage,
  reportsApi,
  type DepartmentPayrollRow,
} from "../api";

const attendanceColors: Record<string, string> = {
  Present: "#10B981",
  Absent: "#EF4444",
  "On Leave": "#3B82F6",
  Late: "#F59E0B",
  Remote: "#8B5CF6",
};

export const ReportsPage = () => {
  // Данные для графиков
  const [deptData, setDeptData] = useState<{ name: string; count: number }[]>(
    [],
  );
  const [attendanceData, setAttendanceData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [departmentPayroll, setDepartmentPayroll] = useState<
    DepartmentPayrollRow[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setErrorMessage("");

      const [employeeStatsResult, attendanceTodayResult, payrollByDepartmentResult] =
        await Promise.allSettled([
          reportsApi.getEmployeeStatistics(),
          reportsApi.getAttendanceToday(),
          reportsApi.getDepartmentPayroll(),
        ]);

      const errors: string[] = [];

      if (employeeStatsResult.status === "fulfilled") {
        const employeeStats = employeeStatsResult.value;
        const departmentSeries = employeeStats.byDepartment.series[0]?.data || [];

        if (employeeStats.byDepartment.labels.length > 0) {
          setDeptData(
            employeeStats.byDepartment.labels.map((label, index) => ({
              name: label,
              count: departmentSeries[index] || 0,
            })),
          );
        }
      } else {
        errors.push(getApiErrorMessage(employeeStatsResult.reason, "Failed to load employee statistics"));
      }

      if (attendanceTodayResult.status === "fulfilled") {
        const attendanceToday = attendanceTodayResult.value;

        if (attendanceToday.chart.items.length > 0) {
          setAttendanceData(
            attendanceToday.chart.items.map((item) => ({
              name: item.label,
              value: item.value,
              color: attendanceColors[item.label] || "#64748B",
            })),
          );
        }
      } else {
        errors.push(getApiErrorMessage(attendanceTodayResult.reason, "Failed to load attendance report"));
      }

      if (payrollByDepartmentResult.status === "fulfilled") {
        setDepartmentPayroll(payrollByDepartmentResult.value.rows);
      } else {
        errors.push(getApiErrorMessage(payrollByDepartmentResult.reason, "Failed to load payroll report"));
      }

      if (errors.length > 0) {
        setErrorMessage(errors.join(" | "));
      }
    };

    void loadReports();
  }, []);

  const payrollRows =
    departmentPayroll.length > 0
      ? departmentPayroll.map((row) => ({
          name: row.departmentName,
          count: row.employeesCount,
          avg: row.averageSalary,
          total: row.netSalaryTotal,
        }))
      : [];
  const payrollEmployeesTotal = payrollRows.reduce(
    (total, row) => total + row.count,
    0,
  );
  const payrollNetTotal = payrollRows.reduce(
    (total, row) => total + row.total,
    0,
  );

  const formatKZT = (amount: number) => {
    return new Intl.NumberFormat("kk-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = async (format: "csv" | "pdf") => {
    setExportFormat(format);
    setExportMessage("");

    try {
      const { blob, filename } = await reportsApi.downloadExport(format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportMessage(`${format.toUpperCase()} export downloaded.`);
    } catch (error) {
      setExportMessage(getApiErrorMessage(error, "Failed to export report"));
    } finally {
      setExportFormat(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-8 text-left">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              View and export detailed workforce insights
            </p>
          </div>
          <div className="flex gap-3">
            {(["csv", "pdf"] as const).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => void handleExport(format)}
                disabled={exportFormat !== null}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-60 dark:shadow-none ${
                  format === "csv"
                    ? "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                    : "bg-gray-900 shadow-gray-200 hover:bg-black dark:bg-white dark:text-gray-900"
                }`}
              >
                <Download size={18} />
                {exportFormat === format
                  ? "Exporting..."
                  : `Export ${format.toUpperCase()}`}
              </button>
            ))}
          </div>
        </header>

        {(errorMessage || exportMessage) && (
          <div className="mb-6 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-400">
            {errorMessage || exportMessage}
          </div>
        )}

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
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {report.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
                {report.desc}
              </p>
              <span className="text-xs font-black text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
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
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
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
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
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
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Department Payroll Summary
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
              {payrollRows.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-8 py-5 font-bold text-gray-900 dark:text-white text-sm">
                    {row.name}
                  </td>
                  <td className="px-8 py-5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {row.count}
                  </td>
                  <td className="px-8 py-5 text-gray-900 dark:text-gray-300 text-sm">
                    {formatKZT(row.avg)}
                  </td>
                  <td className="px-8 py-5 text-gray-900 dark:text-white text-sm font-black">
                    {formatKZT(row.total)}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                <td className="px-8 py-5 font-black text-blue-600 dark:text-blue-400 text-sm">
                  Total
                </td>
                <td className="px-8 py-5 font-black text-blue-600 dark:text-blue-400 text-sm">
                  {payrollEmployeesTotal}
                </td>
                <td className="px-8 py-5">-</td>
                <td className="px-8 py-5 font-black text-blue-600 dark:text-blue-400 text-sm">
                  {formatKZT(payrollNetTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
