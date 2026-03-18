import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import {
  DollarSign,
  Send,
  CheckCircle2,
  Clock,
  Calendar,
  Wallet,
  TrendingDown,
  CircleDollarSign,
  Loader2,
  X,
} from "lucide-react";

export const PayrollPage = () => {
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Основное состояние данных
  const [data, setData] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      dept: "Engineering",
      base: 916667,
      bonus: 20000,
      deduct: 15000,
      net: 921667,
      status: "Processed",
      isSent: false,
    },
    {
      id: 2,
      name: "Michael Chen",
      dept: "Marketing",
      base: 783333,
      bonus: 15000,
      deduct: 12000,
      net: 786333,
      status: "Processed",
      isSent: false,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      dept: "Human Resources",
      base: 600000,
      bonus: 10000,
      deduct: 10000,
      net: 600000,
      status: "Processed",
      isSent: false,
    },
    {
      id: 4,
      name: "David Kim",
      dept: "Engineering",
      base: 733333,
      bonus: 18000,
      deduct: 13000,
      net: 738333,
      status: "Pending",
      isSent: false,
    },
    {
      id: 5,
      name: "Jessica Taylor",
      dept: "Sales",
      base: 816667,
      bonus: 30000,
      deduct: 16000,
      net: 830667,
      status: "Pending",
      isSent: false,
    },
  ]);

  // Логика форматирования валюты
  const formatKZT = (amount: number) => {
    return new Intl.NumberFormat("kk-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Подтверждение и запуск процесса
  const confirmProcess = () => {
    setIsModalOpen(false);
    setIsProcessing(true);

    setTimeout(() => {
      setData((prev) => prev.map((emp) => ({ ...emp, status: "Processed" })));
      setIsProcessing(false);
      // Показываем сообщение об успехе
      setShowSuccess(true);
      // Автоматически скрываем через 3 секунды
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  // Отправка индивидуального листка
  const handleSendPayslip = (id: number) => {
    setData((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, isSent: true } : emp)),
    );
  };

  // Автоматический расчет статистики
  const processedCount = data.filter((e) => e.status === "Processed").length;
  const pendingCount = data.filter((e) => e.status === "Pending").length;
  const totalNet = data.reduce((acc, curr) => acc + curr.net, 0);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-8 text-left">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              Payroll
            </h1>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Manage employee payroll and salary processing
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isProcessing || pendingCount === 0}
            className="px-6 py-2.5 bg-blue-600 text-white text-[14px] font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CircleDollarSign size={18} />
            )}
            {isProcessing ? "Processing..." : "Process Payroll"}
          </button>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-4 gap-6 mb-8 text-left">
          {[
            {
              label: "Total Base Salary",
              value: 3650000,
              icon: Wallet,
              color: "text-blue-600",
            },
            {
              label: "Total Bonuses",
              value: 930000,
              icon: TrendingDown,
              color: "text-green-600",
            },
            {
              label: "Total Deductions",
              value: 660000,
              icon: TrendingDown,
              color: "text-red-600",
            },
            {
              label: "Net Payroll",
              value: totalNet,
              icon: DollarSign,
              color: "text-purple-600",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 p-6 rounded-[22px] border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-[24px] font-black text-gray-900 dark:text-white">
                {formatKZT(stat.value)}
              </p>
              <p className="text-[12px] text-gray-400 mt-1 font-medium">
                This month
              </p>
            </div>
          ))}
        </div>

        {/* STATUS BAR WIDGETS */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-left">
          <div className="flex items-center gap-4 p-5 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-2xl transition-all">
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[16px] font-bold text-gray-900 dark:text-green-100">
                {processedCount} Employees
              </p>
              <p className="text-[13px] text-green-600 dark:text-green-400 font-medium">
                Payroll Processed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-2xl transition-all">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[16px] font-bold text-gray-900 dark:text-orange-100">
                {pendingCount} Employees
              </p>
              <p className="text-[13px] text-orange-600 dark:text-orange-400 font-medium">
                Pending Processing
              </p>
            </div>
          </div>
        </div>

        {/* MONTH SELECTOR */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-[14px] font-bold text-gray-500 dark:text-gray-400">
              Payroll Month:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] font-bold text-gray-900 dark:text-white cursor-pointer"
            />
          </div>
        </div>

        {/* PAYROLL TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                {[
                  "Employee",
                  "Department",
                  "Base Salary",
                  "Bonus",
                  "Deductions",
                  "Net Salary",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors group"
                >
                  <td className="px-6 py-5 font-bold text-gray-900 dark:text-white text-[14px]">
                    {row.name}
                  </td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-[14px]">
                    {row.dept}
                  </td>
                  <td className="px-6 py-5 text-gray-900 dark:text-gray-300 text-[14px] font-medium">
                    {formatKZT(row.base)}
                  </td>
                  <td className="px-6 py-5 text-green-600 dark:text-green-400 text-[14px] font-bold">
                    +{formatKZT(row.bonus)}
                  </td>
                  <td className="px-6 py-5 text-red-600 dark:text-red-400 text-[14px] font-bold">
                    -{formatKZT(row.deduct)}
                  </td>
                  <td className="px-6 py-5 text-gray-900 dark:text-white text-[14px] font-extrabold">
                    {formatKZT(row.net)}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        row.status === "Processed"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                          : "bg-orange-50 dark:bg-orange-900/20 text-orange-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => handleSendPayslip(row.id)}
                      disabled={row.status !== "Processed" || row.isSent}
                      className={`flex items-center gap-2 text-[12px] font-bold transition-all ${
                        row.isSent
                          ? "text-gray-400 cursor-default"
                          : row.status === "Processed"
                            ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                            : "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      {row.isSent ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <Send size={14} />
                      )}
                      {row.isSent ? "Sent" : "Send"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL CONFIRMATION */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 text-center animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CircleDollarSign size={32} />
              </div>
              <h3 className="text-[20px] font-extrabold text-gray-900 dark:text-white mb-2">
                Process Payroll?
              </h3>
              <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8 font-medium">
                Are you sure to process payroll for{" "}
                <span className="text-gray-900 dark:text-white font-bold">
                  {selectedMonth}
                </span>
                ? This will calculate salaries for all employees.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 text-[14px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmProcess}
                  className="flex-1 py-3.5 text-[14px] font-bold bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                >
                  Yes, Process
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS TOAST */}
        {showSuccess && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 dark:border-gray-200">
              <div className="bg-green-500 rounded-full p-1">
                <CheckCircle2 size={18} className="text-white" />
              </div>
              <span className="text-[14px] font-bold">
                Payroll processed successfully!
              </span>
              <button
                onClick={() => setShowSuccess(false)}
                className="ml-4 text-gray-400 hover:text-white dark:hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
