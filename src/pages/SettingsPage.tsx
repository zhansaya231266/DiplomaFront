import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import {
  Building2,
  Calculator,
  Clock,
  Save,
  Globe,
  Mail,
  Percent,
} from "lucide-react";

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [workMode, setWorkMode] = useState("full-time");

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-8 text-left">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Configure your HRMS platform and system preferences
            </p>
          </div>
          <button className="px-8 py-3 bg-blue-600 text-white text-[14px] font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none">
            <Save size={18} /> Save Changes
          </button>
        </header>

        <div className="flex gap-8">
          {/* LEFT COLUMN: NAVIGATION */}
          <div className="w-1/4">
            <div className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
              {[
                { id: "company", label: "Company Info", icon: Building2 },
                { id: "payroll", label: "Payroll Logic", icon: Calculator },
                { id: "work", label: "Work Schedule", icon: Clock },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[14px] font-bold transition-all mb-1 ${
                    activeTab === item.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: FORMS */}
          <div className="w-3/4 space-y-6">
            {/* 1. COMPANY INFORMATION */}
            <section className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 shadow-sm text-left">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="text-blue-600" size={22} />
                <h3 className="text-[18px] font-black text-gray-900 dark:text-white">
                  Company Information
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-400 uppercase ml-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Acme Corporation"
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-400 uppercase ml-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-5 top-4 text-gray-400"
                    />
                    <input
                      type="email"
                      defaultValue="hr@acme.com"
                      className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-[14px] font-bold outline-none dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-400 uppercase ml-1">
                    Website
                  </label>
                  <div className="relative">
                    <Globe
                      size={16}
                      className="absolute left-5 top-4 text-gray-400"
                    />
                    <input
                      type="text"
                      defaultValue="www.acme.com"
                      className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-[14px] font-bold outline-none dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. PAYROLL LOGIC & FORMULA */}
            <section className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 shadow-sm text-left">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="text-green-600" size={22} />
                <h3 className="text-[18px] font-black text-gray-900 dark:text-white">
                  Payroll Formula & Tax
                </h3>
              </div>
              <div className="space-y-6">
                <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                  <label className="text-[13px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2 mb-3">
                    Active Formula
                  </label>
                  <p className="text-[16px] font-black text-gray-800 dark:text-white font-mono">
                    Net Salary = (Base Salary + Bonuses) - (Tax Rate + Social
                    Deductions)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase ml-1">
                      Income Tax Rate (%)
                    </label>
                    <div className="relative">
                      <Percent
                        size={16}
                        className="absolute right-5 top-4 text-gray-400"
                      />
                      <input
                        type="number"
                        defaultValue="10"
                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-[14px] font-bold outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-400 uppercase ml-1">
                      Pension Fund (OPV %)
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-[14px] font-bold outline-none dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. WORK SCHEDULE */}
            <section className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 shadow-sm text-left">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-orange-500" size={22} />
                <h3 className="text-[18px] font-black text-gray-900 dark:text-white">
                  Work Schedule Type
                </h3>
              </div>
              <div className="flex gap-4 mb-8">
                {["full-time", "part-time", "flexible"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setWorkMode(mode)}
                    className={`px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all ${
                      workMode === mode
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {mode.replace("-", " ")}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[14px] font-bold text-gray-500">
                      Standard Daily Hours
                    </span>
                    <span className="text-[14px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                      {workMode === "full-time"
                        ? "8.0 hrs"
                        : workMode === "part-time"
                          ? "4.0 hrs"
                          : "Custom"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black border ${
                          ["Sat", "Sun"].includes(day)
                            ? "border-gray-100 text-gray-300 dark:border-gray-800"
                            : "border-blue-100 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:border-blue-900/30"
                        }`}
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
