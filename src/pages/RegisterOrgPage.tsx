import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  ChevronRightIcon,
  Globe,
  Users,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  KZ_CITIES,
  INDUSTRIES,
  EMPLOYEE_COUNT_RANGES,
} from "../shared/constants/kazakhstan";

// Схема валидации
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string(),
    companyName: z.string().min(2, "Enter company name"),
    city: z.string().min(1, "Required"),
    employees: z.string(),
    industry: z.string(),
    payrollFrequency: z.string(),
    workingHours: z.number().min(1).max(24),
    currency: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterOrgPage = () => {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      currency: "KZT - Kazakhstani Tenge",
      payrollFrequency: "Monthly",
      workingHours: 8,
      city: "",
      industry: "Technology",
      employees: "1-50",
    },
  });

  const formData = watch();

  const onSubmit = (data: RegisterFormValues) => {
    console.log("Final Data:", data);
    setStep(4); // Переход на экран успеха
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 transition-colors duration-300">
      {/* Header Section */}
      <div className="max-w-md mx-auto text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Briefcase size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Register Organization
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Create your HRMS workspace in minutes
        </p>
      </div>

      {/* Stepper */}
      {step < 4 && (
        <div className="max-w-lg mx-auto mb-12 flex items-center justify-between relative">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="z-10 flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= num
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30"
                    : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {step > num ? <CheckIcon size={18} /> : num}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${step >= num ? "text-blue-600" : "text-gray-400"}`}
              >
                {num === 1
                  ? "Admin Info"
                  : num === 2
                    ? "Company Info"
                    : "Settings"}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 dark:bg-gray-800 -z-0" />
          <div
            className="absolute top-5 left-0 h-[2px] bg-blue-600 transition-all duration-500 -z-0"
            style={{ width: `${(step - 1) * 50}%` }}
          />
        </div>
      )}

      {/* Main Card */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 shadow-2xl shadow-blue-500/5">
        {/* STEP 1: Admin Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-blue-600 pl-4">
              Administrator Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    {...register("fullName")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="admin@company.kz"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    {...register("password")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-blue-600 transition"
                  >
                    {showPass ? (
                      <EyeOffIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? "border-red-500" : "border-gray-200"} dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition`}
                    placeholder="••••••••"
                  />

                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-[0.99]"
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 2: Company Info */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-blue-600 pl-4">
              Company Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Company Name
                </label>
                <input
                  {...register("companyName")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    <Globe size={16} className="text-blue-500" /> Industry
                  </label>
                  <select
                    {...register("industry")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    <Users size={16} className="text-blue-500" /> Number of
                    Employees
                  </label>
                  <select
                    {...register("employees")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {EMPLOYEE_COUNT_RANGES.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  City (Kazakhstan)
                </label>
                <input
                  {...register("city")}
                  list="cities"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Start typing city name..."
                />
                <datalist id="cities">
                  {KZ_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Settings */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-blue-600 pl-4">
              Initial Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Payroll Frequency
                </label>
                <select
                  {...register("payrollFrequency")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Standard Working Hours per Day
                </label>
                <input
                  type="number"
                  {...register("workingHours", { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <DollarSign size={16} className="text-blue-500" /> Currency
                </label>
                <select
                  {...register("currency")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="KZT">KZT - Kazakhstani Tenge</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>

              {/* Review Card */}
              <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
                  Review Your Information
                </h3>
                <div className="grid grid-cols-1 gap-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Admin:</span>{" "}
                    <span className="font-bold dark:text-white">
                      {formData.fullName} ({formData.email})
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Company:</span>{" "}
                    <span className="font-bold dark:text-white">
                      {formData.companyName}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Location:</span>{" "}
                    <span className="font-bold dark:text-white">
                      {formData.city}, Kazakhstan
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
              >
                Complete Registration
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div className="animate-in zoom-in duration-500 text-center">
            {/* Иконка успеха точно как на мокапе */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-sm">
                <CheckIcon size={32} strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Registration Successful!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Your HRMS workspace has been created and is ready to use
            </p>

            {/* Блок Quick Start Guide */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 text-left mb-8 border border-blue-100 dark:border-blue-900/30">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                Quick Start Guide
              </h4>
              <div className="space-y-4">
                {[
                  {
                    title: "Add Your Employees",
                    desc: "Start by adding your team members to the system",
                  },
                  {
                    title: "Configure Departments",
                    desc: "Set up your organizational structure and departments",
                  },
                  {
                    title: "Start Tracking",
                    desc: "Begin monitoring attendance and processing payroll",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Три карточки функций внизу */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                {
                  icon: <Users size={20} />,
                  label: "Employee Management",
                  sub: "Manage your workforce",
                  color: "text-blue-600",
                },
                {
                  icon: <DollarSign size={20} />,
                  label: "Automated Payroll",
                  sub: "Process salaries easily",
                  color: "text-green-600",
                },
                {
                  icon: <Briefcase size={20} />,
                  label: "Reports & Analytics",
                  sub: "Track performance",
                  color: "text-purple-600",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex flex-col items-center"
                >
                  <div className={`${card.color} mb-2`}>{card.icon}</div>
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">
                    {card.label}
                  </p>
                  <p className="text-[8px] text-gray-500 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Кнопка действия */}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              Go to Dashboard <ChevronRightIcon size={18} />
            </button>

            <p className="text-[10px] text-gray-400 mt-6">
              You can always access these settings from your dashboard
            </p>
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
