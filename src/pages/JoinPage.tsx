import { Mail, Building2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export const JoinPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center py-12 px-4 transition-colors">
      {/* Логотип платформы */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
          EMP
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Smart EMP
        </h1>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center">
        <div className="text-4xl mb-4 animate-bounce">👋</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Smart EMP!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          What would you like to do?
        </p>

        <div className="space-y-4">
          {/* Кнопка "Присоединиться" */}
          <button
            onClick={() => navigate("/enter-code")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-50 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-900/20 hover:border-blue-500 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-blue-800">
              <Mail size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                Join a Company
              </p>
              <p className="text-xs text-gray-500">Using an invitation code</p>
            </div>
          </button>

          {/* Кнопка "Создать организацию" */}
          <button
            onClick={() => navigate("/register-org")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
              <Building2 size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                Create Organization
              </p>
              <p className="text-xs text-gray-500">
                Register as an administrator
              </p>
            </div>
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
