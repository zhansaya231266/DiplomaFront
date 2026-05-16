import { useEffect, useState } from "react";
import { Mail, Eye, EyeOff, ChevronLeft, Loader2, Phone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  employeesApi,
  getApiErrorMessage,
  inviteApi,
  type InviteVerificationResponse,
} from "../api";
import {
  getInviteEmployeeDraft,
  removeInviteEmployeeDraft,
} from "../shared/utils/inviteEmployeeDraft";

type ActivateAccountState = {
  code: string;
  invite: InviteVerificationResponse;
};

const VERIFIED_INVITE_STORAGE_KEY = "verified_invite";

const getStoredInviteState = (): ActivateAccountState | null => {
  const raw = sessionStorage.getItem(VERIFIED_INVITE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ActivateAccountState;
  } catch {
    sessionStorage.removeItem(VERIFIED_INVITE_STORAGE_KEY);
    return null;
  }
};

export const ActivateAccountPage = () => {
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+7");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteState, setInviteState] = useState<ActivateAccountState | null>(
    null,
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const routeState = location.state as ActivateAccountState | null;
    const nextState =
      routeState?.code && routeState?.invite ? routeState : getStoredInviteState();

    if (!nextState?.code || !nextState?.invite) {
      navigate("/enter-code", { replace: true });
      return;
    }

    sessionStorage.setItem(
      VERIFIED_INVITE_STORAGE_KEY,
      JSON.stringify(nextState),
    );
    setInviteState(nextState);
  }, [location.state, navigate]);

  if (!inviteState?.code || !inviteState?.invite) {
    return null;
  }

  const { code, invite } = inviteState;

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setApiError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const result = await inviteApi.completeRegistration({
        code,
        password,
        phoneNumber,
      });

      const draft = getInviteEmployeeDraft({ code, email: invite.email });
      if (result?.userId && draft?.departmentId && draft?.positionId) {
        try {
          await employeesApi.create({
            userId: result.userId,
            departmentId: draft.departmentId,
            positionId: draft.positionId,
            role: draft.role || invite.role,
            salaryRate: draft.salaryRate || "0",
            status: draft.status || "Active",
          });
        } catch {
          // Non-fatal: employee profile will show "Not set" until admin assigns it
        }
      }

      removeInviteEmployeeDraft({ code, email: invite.email });

      sessionStorage.removeItem(VERIFIED_INVITE_STORAGE_KEY);
      navigate("/login");
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Failed to activate account"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 font-medium text-gray-500"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-900/20">
              <Mail size={32} />
            </div>
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Activate Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              You&apos;re joining{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {invite.organizationName}
              </span>
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Employee Information
            </p>
            <div className="space-y-1">
              <p className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
                {invite.fullName}
              </p>
              <p className="text-sm text-gray-500">{invite.email}</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {invite.position || invite.role}
              </p>
            </div>
          </div>

          <div className="mb-8 space-y-5">
            <div className="relative">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <Phone
                size={18}
                className="absolute left-4 top-[45px] text-gray-400"
              />
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-5 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="+77001234567"
              />
            </div>

            <div className="relative">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Create Password
              </label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPass ? "text" : "password"}
                className="w-full rounded-xl border border-gray-200 px-5 py-3.5 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-blue-600"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                className="w-full rounded-xl border border-gray-200 px-5 py-3.5 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <p className="mb-6 text-xs text-gray-400">
            Password must be at least 8 characters and include a special
            character. Phone number should be in international format, for
            example `+77001234567`.
          </p>

          {apiError && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !password ||
              !confirmPassword ||
              !phoneNumber.trim()
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Activating...
              </>
            ) : (
              "Activate Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
