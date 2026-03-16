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
  // Состояния фильтрации
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  // Состояния периода
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [dateDisplay, setDateDisplay] = useState("March 14, 2026");

  // Состояния кастомных дат
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
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-8 text-left">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
              Attendance
            </h1>
            <p className="text-[15px] text-gray-500 mt-1 font-medium">
              Monitor daily employee presence
            </p>
          </div>

          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="appearance-none bg-white border border-gray-200 pl-10 pr-10 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 outline-none shadow-sm hover:border-gray-300 transition-all cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
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
        <div className="grid grid-cols-4 gap-6 mb-8 text-left">
          {[
            {
              label: "Total Present",
              value: "236",
              icon: UserCheck,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Late Arrivals",
              value: "8",
              icon: Clock,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              label: "On Leave",
              value: "12",
              icon: UserMinus,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Absent",
              value: "4",
              icon: AlertCircle,
              color: "text-red-600",
              bg: "bg-red-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-6 rounded-[22px] ${stat.bg} border border-white shadow-sm`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[26px] font-black text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-[14px] font-medium text-gray-500 mt-1">
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

        {/* CONTROLS: PERIOD & SEARCH */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50/50">
              <CalendarIcon className="text-gray-400" size={18} />
              <span className="text-[14px] font-bold text-gray-700">
                {dateDisplay}
              </span>
            </div>

            {/* PERIOD DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                className="px-4 py-2.5 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-100"
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
                  <div className="absolute top-full mt-2 left-0 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-150 text-left overflow-hidden">
                    {!isCustomMode ? (
                      <>
                        <div className="px-5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Select Period
                        </div>
                        {periods.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handlePeriodChange(p)}
                            className="w-full flex items-center justify-between px-5 py-3 text-[14px] font-medium text-gray-700 hover:bg-blue-50 transition-colors"
                          >
                            {p.label}
                            {selectedPeriod === p.label && (
                              <Check size={16} className="text-blue-600" />
                            )}
                          </button>
                        ))}
                        <hr className="my-1 border-gray-50" />
                        <button
                          onClick={() => setIsCustomMode(true)}
                          className="w-full text-left px-5 py-3 text-[14px] font-bold text-blue-600 hover:bg-blue-50 flex items-center justify-between"
                        >
                          Custom Range... <CalendarDays size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="p-5 space-y-4">
                        <button
                          onClick={() => setIsCustomMode(false)}
                          className="flex items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-gray-600 mb-2 transition-colors"
                        >
                          <ArrowLeft size={14} /> Back to presets
                        </button>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">
                              From
                            </label>
                            <input
                              type="date"
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">
                              To
                            </label>
                            <input
                              type="date"
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>
                        <button
                          onClick={applyCustomRange}
                          disabled={!startDate || !endDate}
                          className="w-full py-3 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-lg shadow-blue-50"
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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] outline-none focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ATTENDANCE TABLE */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden text-left">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[12px]">
                        {row.name.charAt(0)}
                      </div>
                      <span className="text-[14px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-gray-500 font-medium">
                    {row.dept}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-gray-700 font-medium">
                    {row.checkIn}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-gray-700 font-medium">
                    {row.checkOut}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide ${
                        row.status === "Present"
                          ? "bg-green-50 text-green-600"
                          : row.status === "Late"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <Search size={32} />
              </div>
              <p className="text-gray-400 font-medium text-[15px]">
                No attendance records match your search.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
