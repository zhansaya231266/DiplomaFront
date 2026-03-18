import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  ChevronRightIcon,
  Building2,
  Hash,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Type,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, organizationApi, persistAuth } from "../api";
import { useAuth } from "../components/context/AuthContext";

const registerSchema = z
  .object({
    // Admin Account
    firstname: z.string().min(2, "First name is too short"),
    lastname: z.string().min(2, "Last name is too short"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z
      .string()
      .min(11, "Phone number is too short")
      .refine((val) => val.startsWith("+7"), "Phone must start with +7"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),

    // Organization Profile
    organizationName: z.string().min(2, "Company name is required"),
    vat: z.string().length(12, "BIN/VAT must be exactly 12 digits"),
    streetAddress: z.string().min(5, "Enter full legal address"),
    organizationDescription: z
      .string()
      .min(10, "Description is too short (min 10 chars)")
      .max(250, "Description is too long"),

    cityId: z.number(),
    // Consents
    privacyPolicyAccepted: z
      .boolean()
      .refine((value) => value, "You must accept the Privacy Policy"),
    termsAndConditionsAccepted: z
      .boolean()
      .refine((value) => value, "You must accept the Terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterOrgPage = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [consentDocs, setConsentDocs] = useState<any[]>([]);
  const [otpCode, setOtpCode] = useState("");
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    trigger,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phoneNumber: "+7",
      organizationDescription: "",
      cityId: 1,
      privacyPolicyAccepted: false,
      termsAndConditionsAccepted: false,
    },
  });

  // Загрузка активных документов с бэкенда
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await organizationApi.getActiveDocuments();
        if (response?.data) setConsentDocs(response.data);
      } catch (e) {
        console.error("Failed to load consent documents", e);
      }
    };
    fetchDocs();
  }, []);

  const handleNextStep = async () => {
    const isStepValid = await trigger([
      "firstname",
      "lastname",
      "email",
      "phoneNumber",
      "password",
      "confirmPassword",
    ]);
    if (isStepValid) setStep(2);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await organizationApi.create(data);
      setPendingCredentials({
        email: data.email,
        password: data.password,
      });
      setStep(3);
    } catch (error: any) {
      // 1. Извлекаем текст ошибки из разных возможных полей бэкенда
      // Твой Go-код использует "details" для валидации и "error" для общих ошибок
      const responseData = error.response?.data;
      const serverMessage =
        responseData?.details || responseData?.error || "Registration failed";

      const msg = serverMessage.toLowerCase();

      // Функция для установки ошибки в конкретное поле и возврата на нужный шаг
      const setFieldError = (
        field: keyof RegisterFormValues,
        backToStep1: boolean = false,
      ) => {
        setError(field, { type: "server", message: serverMessage });
        if (backToStep1) setStep(1);
      };

      // 2. Маппинг на основе текстов из твоего файла errors.go
      // Ищем ключевые слова в строке, которую прислал Go
      if (msg.includes("first name")) {
        setFieldError("firstname", true);
      } else if (msg.includes("last name")) {
        setFieldError("lastname", true);
      } else if (msg.includes("email")) {
        setFieldError("email", true);
      } else if (msg.includes("phone number")) {
        setFieldError("phoneNumber", true);
      } else if (msg.includes("password")) {
        setFieldError("password", true);
      } else if (msg.includes("organization name")) {
        setFieldError("organizationName");
      } else if (msg.includes("vat") || msg.includes("bin")) {
        setFieldError("vat");
      } else if (msg.includes("description")) {
        setFieldError("organizationDescription");
      } else if (msg.includes("street address") || msg.includes("address")) {
        setFieldError("streetAddress");
      } else if (msg.includes("privacy policy") || msg.includes("terms")) {
        // Мапим на чекбоксы согласия
        if (msg.includes("privacy"))
          setError("privacyPolicyAccepted", { message: serverMessage });
        if (msg.includes("terms"))
          setError("termsAndConditionsAccepted", { message: serverMessage });
      } else {
        // 3. Если это общая ошибка (например, 500 или Conflict), выводим в apiError
        setApiError(serverMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!pendingCredentials) {
      setApiError("Registration session expired. Please register again.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      await organizationApi.verifyOtp(pendingCredentials.email, otpCode);
      const { token, user, refreshToken } = await authApi.login({
        email: pendingCredentials.email,
        password: pendingCredentials.password,
      });
      persistAuth(token, user, refreshToken);
      setUser(user);
      navigate("/dashboard");
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Failed to verify account",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDocUrl = (type: string) =>
    consentDocs.find((d) => d.documentType === type)?.url || "#";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 transition-all">
      <div className="max-w-md mx-auto text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Building2 size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          HRMS Registration
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Setup your organization workspace
        </p>
      </div>

      {step < 3 && (
        <div className="max-w-xs mx-auto mb-12 flex items-center justify-between relative">
          {[1, 2].map((num) => (
            <div key={num} className="z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= num
                    ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-50 dark:ring-blue-900/20"
                    : "bg-white border dark:bg-gray-800 dark:border-gray-700 text-gray-400"
                }`}
              >
                {step > num ? <CheckIcon size={18} /> : num}
              </div>
            </div>
          ))}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 dark:bg-gray-800 -z-0" />
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 shadow-2xl shadow-blue-500/5">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-blue-600 pl-4 uppercase tracking-wider text-sm">
              Administrator Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <input
                  {...register("firstname")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                  placeholder="First Name"
                />
                {errors.firstname && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">
                    {errors.firstname.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <input
                  {...register("lastname")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                  placeholder="Last Name"
                />
                {errors.lastname && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">
                    {errors.lastname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("email")}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                  placeholder="Work Email"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 font-bold ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("phoneNumber")}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                  placeholder="+7"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-[10px] text-red-500 font-bold ml-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPass ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                placeholder="Confirm Password"
              />
            </div>
            {(errors.password || errors.confirmPassword) && (
              <p className="text-[10px] text-red-500 font-bold ml-1">
                {errors.password?.message || errors.confirmPassword?.message}
              </p>
            )}

            <button
              onClick={handleNextStep}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-[0.99]"
            >
              Continue to Organization
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-blue-600 pl-4 uppercase tracking-wider text-sm">
              Organization Profile
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="relative">
                  <Building2
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    {...register("organizationName")}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                    placeholder="Company Name"
                  />
                </div>
                {errors.organizationName && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Hash
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    {...register("vat")}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                    placeholder="BIN (12 digits)"
                  />
                </div>
                {errors.vat && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">
                    {errors.vat.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Type
                  className="absolute left-4 top-4 text-gray-400"
                  size={18}
                />
                <textarea
                  {...register("organizationDescription")}
                  rows={2}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 resize-none transition"
                  placeholder="Short business description..."
                />
              </div>
              {errors.organizationDescription && (
                <p className="text-[10px] text-red-500 font-bold ml-1">
                  {errors.organizationDescription.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  {...register("streetAddress")}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500 transition"
                  placeholder="Legal Address"
                />
              </div>
              {errors.streetAddress && (
                <p className="text-[10px] text-red-500 font-bold ml-1">
                  {errors.streetAddress.message}
                </p>
              )}
            </div>

            {/* Consents Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacyPolicy"
                  {...register("privacyPolicyAccepted")}
                  className="mt-1 w-5 h-5 rounded border-gray-200 text-blue-600 focus:ring-blue-500 transition"
                />
                <label
                  htmlFor="privacyPolicy"
                  className="text-xs text-gray-500 leading-normal"
                >
                  I agree to the{" "}
                  <a
                    href={getDocUrl("PrivacyPolicy")}
                    target="_blank"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.privacyPolicyAccepted && (
                <p className="text-[10px] text-red-500 font-bold ml-8">
                  {errors.privacyPolicyAccepted.message}
                </p>
              )}

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  {...register("termsAndConditionsAccepted")}
                  className="mt-1 w-5 h-5 rounded border-gray-200 text-blue-600 focus:ring-blue-500 transition"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-gray-500 leading-normal"
                >
                  I agree to the{" "}
                  <a
                    href={getDocUrl("TermsAndConditions")}
                    target="_blank"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>
              {errors.termsAndConditionsAccepted && (
                <p className="text-[10px] text-red-500 font-bold ml-8">
                  {errors.termsAndConditionsAccepted.message}
                </p>
              )}
            </div>

            {apiError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                {apiError}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 border border-gray-100 dark:border-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm ring-8 ring-blue-50">
              <ShieldCheck size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-500 mb-10 font-medium">
              We created your organization and sent a verification code to{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {pendingCredentials?.email}
              </span>
              . Enter the OTP below and we&apos;ll sign you in automatically.
            </p>

            <div className="max-w-sm mx-auto text-left">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Verification Code
              </label>
              <input
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-xl tracking-[0.35em] font-semibold"
              />
            </div>

            {apiError && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 text-left">
                {apiError}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otpCode.length < 4}
              className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Verify and Enter Dashboard <ChevronRightIcon size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already have a workspace?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-bold hover:underline ml-1"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};
