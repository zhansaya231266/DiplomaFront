import { useState } from "react";
import { Mail, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ActivateAccountPage = () => {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 mb-8 font-medium"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500">
              <Mail size={32} />
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Activate Your Account
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              You're joining{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                Acme Corporation
              </span>
            </p>
          </div>

          {/* Карточка данных из инвайта */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Employee Information
            </p>
            <div className="space-y-1">
              <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                Sarah Johnson
              </p>
              <p className="text-sm text-gray-500">sarah.johnson@company.kz</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Engineering Department
              </p>
            </div>
          </div>

          <div className="space-y-5 mb-10">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Create Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-blue-600"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            Activate Account
          </button>
        </div>
      </div>
    </div>
  );
};
