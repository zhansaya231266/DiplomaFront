import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const InvitationCodePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  // Форматирование кода (например, ABCD-1234)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-0]/g, "");
    setCode(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white mb-8 transition-colors font-medium"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Enter Invitation Code
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
            Enter the unique code provided by your administrator to join the
            company
          </p>

          <div className="mb-10">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Invitation Code
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="ABCD-1234-EFGH"
              className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white text-center text-2xl font-mono tracking-[0.3em] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-4 text-center">
              The invitation code was sent to your email by your company
              administrator
            </p>
          </div>

          <button
            disabled={code.length < 4}
            onClick={() => navigate("/activate-account")}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
          >
            Continue
          </button>

          <div className="mt-8 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 leading-normal">
              <span className="font-bold text-gray-900 dark:text-white">
                Don't have a code?
              </span>{" "}
              Contact your company administrator to receive an invitation code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
