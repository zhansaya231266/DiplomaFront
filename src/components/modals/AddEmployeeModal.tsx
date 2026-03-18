import React, { useState, useEffect } from "react";
import { X, Copy, Check, ShieldCheck, Building2 } from "lucide-react";

const EXAMPLE_DEPARTMENTS = [
  { id: "1", name: "Development" },
  { id: "2", name: "Human Resources" },
  { id: "3", name: "Marketing" },
  { id: "4", name: "Design" },
  { id: "5", name: "Sales" },
  { id: "6", name: "Finance" },
];

const SYSTEM_ROLES = ["EMPLOYEE", "HR", "MANAGER", "ADMIN"];

export const AddEmployeeModal = ({
  isOpen,
  onClose,
  onAdd,
  initialData,
}: any) => {
  const [step, setStep] = useState(1);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteCode] = useState(
    `HRMS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  );

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCopied(false);
      setIsCustomDept(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const deptValue = isCustomDept
        ? formData.get("customDeptName")
        : formData.get("departmentId");

      const emp = {
        id: initialData?.id || Date.now(),
        first_name: formData.get("firstName"),
        last_name: formData.get("lastName"),
        email: formData.get("email"),
        role: formData.get("role"),
        position: formData.get("position"),
        department_id: deptValue,
        is_new_dept: isCustomDept,
        salary: Number(formData.get("salary")),
        phone_number: formData.get("phone") || "+7 (700) 000-00-00",
        invite_code: inviteCode,
      };

      // Ждем завершения добавления в базу/стейт
      await onAdd(emp);

      if (isEdit) {
        onClose();
      } else {
        // Переходим к успеху только для новых сотрудников
        setStep(2);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to register employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-[500px] shadow-2xl animate-in zoom-in duration-200 overflow-hidden border border-gray-100 dark:border-gray-800">
        {step === 1 ? (
          <form onSubmit={handleSubmit}>
            <div className="px-10 py-7 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-sans">
                {isEdit ? "Edit Profile" : "Add New Employee"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-10 space-y-6 text-left max-h-[75vh] overflow-y-auto font-sans">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 ml-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    required
                    defaultValue={initialData?.first_name}
                    placeholder="John"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 ml-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    required
                    defaultValue={initialData?.last_name}
                    placeholder="Smith"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-[15px]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDept(!isCustomDept)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {isCustomDept ? "← back to list" : "+ create new"}
                  </button>
                </div>

                {!isCustomDept ? (
                  <select
                    name="departmentId"
                    required
                    defaultValue={initialData?.department_id || ""}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white appearance-none transition-all cursor-pointer text-[15px]"
                  >
                    <option value="" disabled>
                      Select from example list...
                    </option>
                    {EXAMPLE_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative animate-in slide-in-from-left-2 duration-300">
                    <Building2
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                      size={18}
                    />
                    <input
                      name="customDeptName"
                      required
                      autoFocus
                      placeholder="Enter new department name..."
                      className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-white transition-all text-[15px]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 ml-1">
                    Access Role
                  </label>
                  <select
                    name="role"
                    defaultValue={initialData?.role || "EMPLOYEE"}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-[15px]"
                  >
                    {SYSTEM_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 ml-1">
                    Job Title
                  </label>
                  <input
                    name="position"
                    required
                    defaultValue={initialData?.position}
                    placeholder="Lead Designer"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-[15px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 ml-1">
                    Work Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={initialData?.email}
                    placeholder="corp@mail.com"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 ml-1">
                    Monthly Salary
                  </label>
                  <div className="relative">
                    <input
                      name="salary"
                      type="number"
                      required
                      defaultValue={initialData?.salary}
                      placeholder="450000"
                      className="w-full pl-5 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all text-[15px]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                      ₸
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.75rem] font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all mt-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {loading
                  ? "Processing..."
                  : isEdit
                    ? "Save Changes"
                    : "Register Employee"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-12 text-center animate-in zoom-in duration-300 font-sans">
            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-100 dark:border-none">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Success!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium">
              We've created the employee profile. Now share this unique
              invitation code with your new team member.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-[2.2rem] p-8 mb-10 text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] text-center ml-1">
                Security Invite Code
              </p>
              <div className="flex gap-3">
                <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl py-5 px-4 font-mono font-bold text-center text-xl tracking-[0.3em] text-blue-600 shadow-sm">
                  {inviteCode}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    setCopied(true);
                  }}
                  className={`p-5 rounded-2xl transition-all shadow-lg ${
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
              className="w-full py-5 bg-gray-900 dark:bg-white dark:text-black text-white rounded-[1.75rem] font-black hover:opacity-90 transition-all text-lg shadow-2xl shadow-gray-200 dark:shadow-none"
            >
              Finish Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
