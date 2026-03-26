import { useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getApiErrorMessage,
  inviteApi,
  type InviteVerificationResponse,
} from "../api";

type ActivateAccountState = {
  code: string;
  invite: InviteVerificationResponse;
};

const VERIFIED_INVITE_STORAGE_KEY = "verified_invite";

export const InvitationCodePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const normalized =
      raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4, 8)}` : raw;
    setCode(normalized.slice(0, 9));
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const invite = await inviteApi.verify(code);
      sessionStorage.setItem(
        VERIFIED_INVITE_STORAGE_KEY,
        JSON.stringify({ code, invite } satisfies ActivateAccountState),
      );
      navigate("/activate-account", {
        state: { code, invite } satisfies ActivateAccountState,
      });
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Failed to verify invite code"));
    } finally {
      setIsSubmitting(false);
    }
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
            Enter the code from your invitation email to verify your access and
            continue to account activation.
          </p>

          <div className="mb-8">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Invitation Code
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="ABCD-1234"
              className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white text-center text-2xl font-mono tracking-[0.3em] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-4 text-center">
              The invitation code was sent to your email by your company
              administrator.
            </p>
          </div>

          {apiError && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <button
            disabled={code.length !== 9 || isSubmitting}
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verifying...
              </>
            ) : (
              "Continue"
            )}
          </button>

          <div className="mt-8 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 leading-normal">
              <span className="font-bold text-gray-900 dark:text-white">
                Don&apos;t have a code?
              </span>{" "}
              Contact your company administrator to receive an invitation code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
