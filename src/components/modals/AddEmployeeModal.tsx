import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Copy, Check, Mail } from "lucide-react";

export const AddEmployeeModal = ({
  isOpen,
  onClose,
  onAdd,
  departments,
  initialData,
}: any) => {
  const [step, setStep] = useState(1);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newEmpData, setNewEmpData] = useState<any>(null);
  const [inviteCode] = useState(
    `HRMS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  );

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;
  const isEdit = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const dept = isCustomDept
      ? formData.get("customDept")
      : formData.get("department");

    const emp = {
      id: initialData?.id || Date.now(),
      name: formData.get("fullName"),
      role: formData.get("position"),
      email: formData.get("email"),
      dept: dept,
      salary: `${Number(formData.get("salary")).toLocaleString()} ₸,`,
      phone: initialData?.phone || "+7 (775) 000 0000",
      image:
        initialData?.image || `https://i.pravatar.cc/150?u=${Math.random()}`,
    };

    setNewEmpData(emp);
    onAdd(emp);
    if (isEdit) onClose();
    else setStep(2);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[440px] shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
        {step === 1 ? (
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-gray-900">
                {isEdit ? "Edit Employee" : "Add New Employee"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-8 space-y-5 text-left">
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  name="fullName"
                  required
                  defaultValue={initialData?.name}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={initialData?.email}
                  placeholder="john@company.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  {!isCustomDept ? (
                    <select
                      name="department"
                      defaultValue={initialData?.dept}
                      onChange={(e) =>
                        e.target.value === "custom" && setIsCustomDept(true)
                      }
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none cursor-pointer"
                    >
                      {departments
                        .filter((d: any) => d !== "All Departments")
                        .map((d: any) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      <option
                        value="custom"
                        className="text-blue-600 font-bold"
                      >
                        + New...
                      </option>
                    </select>
                  ) : (
                    <input
                      name="customDept"
                      autoFocus
                      placeholder="Dept name"
                      className="w-full px-4 py-3 border border-blue-400 rounded-xl outline-none"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    name="position"
                    required
                    defaultValue={initialData?.role}
                    placeholder="Engineer"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Annual Salary
                </label>
                <input
                  name="salary"
                  type="number"
                  required
                  defaultValue={initialData?.salary.replace(/\D/g, "")}
                  placeholder="75000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                {isEdit ? "Save Changes" : "Add Employee"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-10 text-center animate-in fade-in zoom-in">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">
              Employee Added!
            </h2>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 text-left">
              <p className="text-[12px] font-bold text-gray-400 uppercase mb-3">
                Invitation Code
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl py-3 px-4 font-mono font-bold text-center tracking-widest">
                  {inviteCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    setCopied(true);
                  }}
                  className="bg-blue-600 text-white p-3 rounded-xl"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
