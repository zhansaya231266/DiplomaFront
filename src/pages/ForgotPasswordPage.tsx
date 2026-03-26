import { useState } from "react";
import {
  Mail,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки письма через API
    console.log("Reset link sent to:", email);
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center py-12 px-4 transition-colors">
      {/* Логотип */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          HR
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          HRMS Platform
        </h1>
      </div>

      <div className="max-w-md w-full">
        {/* Кнопка назад */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors font-medium group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Login
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
          {!isSent ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Forgot Password?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@company.kz"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    />
                    <Mail
                      className="absolute left-4 top-4 text-gray-400"
                      size={20}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Send Reset Link <ArrowRight size={18} />
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                We've sent a password reset link to <br />
                <span className="font-bold text-gray-900 dark:text-white">
                  {email}
                </span>
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setIsSent(false)}
                  className="w-full py-4 rounded-2xl font-bold text-blue-600 border border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  Resend Email
                </button>
                <Link
                  to="/login"
                  className="block text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register-org"
              className="text-blue-600 font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
