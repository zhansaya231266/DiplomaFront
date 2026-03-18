import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  ChevronDown,
  UserCheck,
  UserMinus,
  Clock,
  AlertCircle,
  Check,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";

export const AttendancePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [dateDisplay, setDateDisplay] = useState("March 14, 2026");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const periods = [
    { id: "Today", label: "Today", date: "March 14, 2026" },
    { id: "Yesterday", label: "Yesterday", date: "March 13, 2026" },
    { id: "7days", label: "Last 7 Days", date: "Mar 07 - Mar 14, 2026" },
    { id: "30days", label: "Last 30 Days", date: "Feb 14 - Mar 14, 2026" },
  ];

  const attendanceData = [
    {
      id: 1,
      name: "Sarah Johnson",
      dept: "Engineering",
      checkIn: "08:45 AM",
      checkOut: "05:30 PM",
      hours: "8.75h",
      status: "Present",
    },
    {
      id: 2,
      name: "Michael Chen",
      dept: "Marketing",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      hours: "9.00h",
      status: "Present",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      dept: "Human Resources",
      checkIn: "08:30 AM",
      checkOut: "05:15 PM",
      hours: "8.75h",
      status: "Present",
    },
    {
      id: 4,
      name: "David Kim",
      dept: "Engineering",
      checkIn: "09:15 AM",
      checkOut: "06:30 PM",
      hours: "9.25h",
      status: "Late",
    },
    {
      id: 5,
      name: "Jessica Taylor",
      dept: "Sales",
      checkIn: "-",
      checkOut: "-",
      hours: "0.00h",
      status: "On Leave",
    },
    {
      id: 6,
      name: "Robert Brown",
      dept: "Engineering",
      checkIn: "08:50 AM",
      checkOut: "05:45 PM",
      hours: "8.92h",
      status: "Present",
    },
  ];

  const departments = [
    "All Departments",
    "Engineering",
    "Marketing",
    "Human Resources",
    "Sales",
  ];

  const handlePeriodChange = (period: any) => {
    setSelectedPeriod(period.label);
    setDateDisplay(period.date);
    setIsCustomMode(false);
    setShowPeriodMenu(false);
  };

  const applyCustomRange = () => {
    if (startDate && endDate) {
      setSelectedPeriod("Custom");
      setDateDisplay(`${startDate} — ${endDate}`);
      setShowPeriodMenu(false);
      setIsCustomMode(false);
    }
  };

  const filteredData = attendanceData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedDept === "All Departments" || item.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-8 text-left">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              Attendance
            </h1>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Monitor daily employee presence
            </p>
          </div>

          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 pl-10 pr-10 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 dark:text-gray-200 outline-none shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d} className="dark:bg-gray-900">
                  {d}
                </option>
              ))}
            </select>
            <Filter
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <ChevronDown
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </header>

        {/* ANALYTICS WIDGETS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
          {[
            {
              label: "Total Present",
              value: "236",
              icon: UserCheck,
              color: "text-green-600 dark:text-green-400",
              bg: "bg-green-50 dark:bg-green-900/10",
            },
            {
              label: "Late Arrivals",
              value: "8",
              icon: Clock,
              color: "text-orange-600 dark:text-orange-400",
              bg: "bg-orange-50 dark:bg-orange-900/10",
            },
            {
              label: "On Leave",
              value: "12",
              icon: UserMinus,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-900/10",
            },
            {
              label: "Absent",
              value: "4",
              icon: AlertCircle,
              color: "text-red-600 dark:text-red-400",
              bg: "bg-red-50 dark:bg-red-900/10",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-6 rounded-[22px] ${stat.bg} border border-white dark:border-gray-800 shadow-sm transition-colors`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[26px] font-black text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400 mt-1">
                    {stat.label}
                  </p>
                </div>
                <div className={`${stat.color} opacity-80`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 bg-gray-50/50 dark:bg-gray-800/50">
              <CalendarIcon className="text-gray-400" size={18} />
              <span className="text-[14px] font-bold text-gray-700 dark:text-gray-200">
                {dateDisplay}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                className="px-4 py-2.5 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-100 dark:shadow-none"
              >
                Change Period <ChevronDown size={14} />
              </button>

              {showPeriodMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowPeriodMenu(false);
                      setIsCustomMode(false);
                    }}
                  ></div>
                  <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-150 text-left overflow-hidden">
                    {!isCustomMode ? (
                      <>
                        <div className="px-5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Select Period
                        </div>
                        {periods.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handlePeriodChange(p)}
                            className="w-full flex items-center justify-between px-5 py-3 text-[14px] font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            {p.label}
                            {selectedPeriod === p.label && (
                              <Check
                                size={16}
                                className="text-blue-600 dark:text-blue-400"
                              />
                            )}
                          </button>
                        ))}
                        <hr className="my-1 border-gray-50 dark:border-gray-700" />
                        <button
                          onClick={() => setIsCustomMode(true)}
                          className="w-full text-left px-5 py-3 text-[14px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between"
                        >
                          Custom Range... <CalendarDays size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="p-5 space-y-4">
                        <button
                          onClick={() => setIsCustomMode(false)}
                          className="flex items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-2 transition-colors"
                        >
                          <ArrowLeft size={14} /> Back to presets
                        </button>
                        <div className="space-y-3">
                          {["From", "To"].map((label, idx) => (
                            <div key={label}>
                              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">
                                {label}
                              </label>
                              <input
                                type="date"
                                onChange={(e) =>
                                  idx === 0
                                    ? setStartDate(e.target.value)
                                    : setEndDate(e.target.value)
                                }
                                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-[13px] dark:text-white outline-none focus:border-blue-500 transition-all"
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={applyCustomRange}
                          disabled={!startDate || !endDate}
                          className="w-full py-3 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 transition-all shadow-lg shadow-blue-50 dark:shadow-none"
                        >
                          Apply Custom Range
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full max-w-xs group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl text-[14px] outline-none focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  {[
                    "Employee",
                    "Department",
                    "Check In",
                    "Check Out",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-8 py-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider ${h === "Status" ? "text-center" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px]">
                          {row.name.charAt(0)}
                        </div>
                        <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
                      {row.dept}
                    </td>
                    <td className="px-6 py-5 text-[14px] text-gray-700 dark:text-gray-300 font-medium">
                      {row.checkIn}
                    </td>
                    <td className="px-6 py-5 text-[14px] text-gray-700 dark:text-gray-300 font-medium">
                      {row.checkOut}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide ${
                          row.status === "Present"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                            : row.status === "Late"
                              ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                              : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4">
                <Search size={32} />
              </div>
              <p className="text-gray-400 dark:text-gray-500 font-medium text-[15px]">
                No attendance records match your search.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
