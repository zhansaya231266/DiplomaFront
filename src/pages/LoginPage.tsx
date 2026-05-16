import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi, persistAuth } from "../api";
import { useAuth } from "../components/context/useAuth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);

    try {
      const { token, user, refreshToken } = await authApi.login(data);
      persistAuth(token, user, refreshToken);
      setUser(user);
      navigate(fromPath, { replace: true });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Failed to sign in",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center p-4 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-12 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
          EMP
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Smart EMP
        </h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Sign In to your account
      </p>

      <div className="bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-500/5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className={`block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 border ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {apiError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register-org"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register Organization
            </Link>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Have an invitation code?{" "}
            <Link
              to="/join"
              className="text-blue-600 font-semibold hover:underline"
            >
              Join Company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
