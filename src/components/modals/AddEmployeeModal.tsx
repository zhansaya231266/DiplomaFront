import { useEffect, useState, type FormEvent } from "react";
import { X, Copy, Check, ShieldCheck } from "lucide-react";

export type EmployeeModalData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  positionId?: string;
  position: string;
  departmentId?: string;
  department: string;
  salary: number;
  phoneNumber: string;
  status: string;
};

type EmployeeModalSubmitPayload = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  position: string;
  salary: number;
  status: string;
};

type AddEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    payload: EmployeeModalSubmitPayload,
  ) => Promise<{ inviteCode?: string } | void>;
  initialData: EmployeeModalData | null;
  departments: Array<{ id: string; name: string }>;
  positions: Array<{ id: string; name: string }>;
  isReferenceLoading?: boolean;
  referenceErrorMessage?: string;
};

const SYSTEM_ROLES = ["EMPLOYEE", "ADMIN"];
const EMPLOYEE_STATUSES = ["Active", "Inactive"];
const fieldClassName =
  "w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:text-gray-400 read-only:text-gray-400 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/30 dark:disabled:text-gray-500 dark:read-only:text-gray-500";

export const AddEmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departments,
  positions,
  isReferenceLoading = false,
  referenceErrorMessage = "",
}: AddEmployeeModalProps) => {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCopied(false);
      setLoading(false);
      setInviteCode("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) {
    return null;
  }

  const positionsPlaceholder = isReferenceLoading
    ? "Loading positions..."
    : positions.length === 0
      ? "No positions available"
      : "Select position";

  const departmentsPlaceholder = isReferenceLoading
    ? "Loading departments..."
    : departments.length === 0
      ? "No departments available"
      : "Select department";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await onSubmit({
        firstName: String(formData.get("firstName") || "").trim(),
        lastName: String(formData.get("lastName") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        role: String(formData.get("role") || "EMPLOYEE").trim(),
        departmentId: String(formData.get("departmentId") || "").trim() || undefined,
        departmentName:
          departments.find((department) => department.id === String(formData.get("departmentId") || ""))
            ?.name,
        positionId: String(formData.get("positionId") || "").trim() || undefined,
        position:
          positions.find((position) => position.id === String(formData.get("positionId") || ""))
            ?.name || String(formData.get("position") || "").trim(),
        salary: Number(formData.get("salary") || 0),
        status: String(formData.get("status") || "Active").trim(),
      });

      if (isEdit) {
        onClose();
        return;
      }

      setInviteCode(result?.inviteCode || "");
      setStep(2);
    } catch (error) {
      console.error("Employee action failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to process employee request.";
      window.alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-2xl duration-200 animate-in zoom-in-95 dark:border-gray-800 dark:bg-gray-900">
        {step === 1 ? (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6 dark:border-gray-800">
              <h2 className="font-sans text-xl font-extrabold text-gray-900 dark:text-white">
                {isEdit ? "Edit Employee" : "Invite Employee"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-8 text-left font-sans">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 ml-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    required
                    defaultValue={initialData?.firstName}
                    readOnly={isEdit}
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <label className="mb-2.5 ml-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    required
                    defaultValue={initialData?.lastName}
                    readOnly={isEdit}
                    className={fieldClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 ml-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Work Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={initialData?.email}
                    readOnly={isEdit}
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <label className="mb-2.5 ml-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Access Role
                  </label>
                  <select
                    name="role"
                    defaultValue={initialData?.role || "EMPLOYEE"}
                    className={fieldClassName}
                  >
                    {SYSTEM_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 ml-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Job Title
                  </label>
                  <select
                    name="positionId"
                    required
                    defaultValue={initialData?.positionId || ""}
                    disabled={isReferenceLoading || positions.length === 0}
                    className={fieldClassName}
                  >
                    <option value="" disabled>
                      {positionsPlaceholder}
                    </option>
                    {positions.map((position) => (
                      <option key={position.id} value={position.id}>
                        {position.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2.5 ml-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Monthly Salary
                  </label>
                  <div className="relative">
                    <input
                      name="salary"
                      type="number"
                      required
                      defaultValue={initialData?.salary ?? 0}
                      placeholder="450000"
                      className={`${fieldClassName} pr-14`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                      KZT
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 ml-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <select
                    name="departmentId"
                    required
                    defaultValue={initialData?.departmentId || ""}
                    disabled={isReferenceLoading || departments.length === 0}
                    className={fieldClassName}
                  >
                    <option value="" disabled>
                      {departmentsPlaceholder}
                    </option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                {isEdit && (
                  <div>
                    <label className="mb-2.5 ml-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={initialData?.status || "Active"}
                      className={fieldClassName}
                    >
                      {EMPLOYEE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {referenceErrorMessage && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  {referenceErrorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : isEdit
                    ? "Save Changes"
                    : "Send Invite"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-12 text-center font-sans duration-300 animate-in zoom-in">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-500 shadow-inner dark:border-none dark:bg-green-900/10">
              <ShieldCheck size={48} />
            </div>
            <h2 className="mb-3 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Invite Created
            </h2>
            <p className="mb-10 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
              Share this invitation code with the employee so they can complete
              registration.
            </p>

            <div className="mb-10 rounded-[2.2rem] border border-gray-100 bg-gray-50 p-8 text-left dark:border-gray-700 dark:bg-gray-800/50">
              <p className="mb-4 ml-1 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Invitation Code
              </p>
              <div className="flex gap-3">
                <div className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-5 text-center font-mono text-xl font-bold tracking-[0.3em] text-blue-600 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  {inviteCode || "N/A"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    setCopied(true);
                  }}
                  className={`rounded-2xl p-5 shadow-lg transition-all ${
                    copied
                      ? "bg-green-500 text-white shadow-green-200"
                      : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                  }`}
                >
                  {copied ? <Check size={28} /> : <Copy size={28} />}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-[1.75rem] bg-gray-900 py-4 text-base font-black text-white shadow-2xl shadow-gray-200 transition-all hover:opacity-90 dark:bg-white dark:text-black dark:shadow-none"
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
