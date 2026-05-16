import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  DollarSign,
  Loader2,
  Calendar,
  RefreshCcw,
  Send,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import {
  employeesApi,
  payrollApi,
  type EmployeeItem,
  type PayrollCycleItem,
  type PayrollItem,
  type PayslipItem,
  getApiErrorMessage,
} from "../api";
import { useAuth } from "../components/context/useAuth";
import { normalizeRole } from "../shared/utils/roles";

type PayrollRow = {
  id: string;
  name: string;
  dept: string;
  base: number;
  bonus: number;
  deduct: number;
  net: number;
  status: "Processed" | "Pending";
  isSent: boolean;
  payslipUrl: string;
};

const getCurrentMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatKZT = (amount: number) =>
  new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);

const parseSalary = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePayrollStatus = (status: string): PayrollRow["status"] => {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("processed") ||
    normalized.includes("paid") ||
    normalized.includes("completed") ||
    normalized.includes("sent")
  ) {
    return "Processed";
  }

  return "Pending";
};

const mapEmployeeToPayrollRow = (employee: EmployeeItem): PayrollRow => {
  const base = parseSalary(employee.salaryRate);
  const normalizedStatus = employee.status.toLowerCase();

  return {
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`.trim() || employee.email,
    dept: employee.departmentName || "Unassigned",
    base,
    bonus: 0,
    deduct: 0,
    net: base,
    status:
      normalizedStatus === "active" || normalizedStatus === "processed"
        ? "Processed"
        : "Pending",
    isSent: false,
    payslipUrl: "",
  };
};

const mapPayrollItemToRow = (item: PayrollItem): PayrollRow => ({
  id: item.id,
  name: item.employeeName || item.employeeId || "Unknown employee",
  dept: item.departmentName || "Unassigned",
  base: item.baseSalary,
  bonus: item.bonus,
  deduct: item.deductions,
  net: item.netSalary || item.baseSalary + item.bonus - item.deductions,
  status: normalizePayrollStatus(item.status),
  isSent: item.payslipSent,
  payslipUrl: item.payslipUrl,
});

const formatPayslipMonth = (value: string) => {
  if (!value) return "Payroll period";

  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const formatPayDate = (value: string) => {
  if (!value) return "Pending pay date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SuperAdminPayrollPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cycleAction, setCycleAction] = useState<"approve" | "reopen" | null>(
    null,
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [currentCycle, setCurrentCycle] = useState<PayrollCycleItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadPayroll = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        let payrollRows: PayrollItem[] = [];
        const currentCycleResult = await Promise.allSettled([
          payrollApi.getCurrentCycle(),
        ]);

        if (currentCycleResult[0].status === "fulfilled") {
          setCurrentCycle(currentCycleResult[0].value);
        }

        try {
          payrollRows = await payrollApi.list({ month: selectedMonth });
        } catch {
          payrollRows = [];
        }

        if (payrollRows.length > 0) {
          setRows(payrollRows.map(mapPayrollItemToRow));
          return;
        }

        const employees = await employeesApi.list();
        setRows(employees.map(mapEmployeeToPayrollRow));
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Failed to load payroll data"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadPayroll();
  }, [selectedMonth]);

  const confirmProcess = async () => {
    setIsModalOpen(false);
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await payrollApi.process({ month: selectedMonth });
      const payrollRows = await payrollApi.list({ month: selectedMonth });
      setRows(
        payrollRows.length > 0
          ? payrollRows.map(mapPayrollItemToRow)
          : rows.map((employee) => ({ ...employee, status: "Processed" })),
      );
      setSuccessMessage("Payroll processed successfully!");
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to process payroll"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendPayslip = async (id: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await payrollApi.sendPayslip(id);
      setRows((prev) =>
        prev.map((employee) =>
          employee.id === id ? { ...employee, isSent: true } : employee,
        ),
      );
      setSuccessMessage("Payslip sent successfully.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to send payslip"));
    }
  };

  const handleCycleAction = async (action: "approve" | "reopen") => {
    if (!currentCycle) {
      return;
    }

    setCycleAction(action);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedCycle =
        action === "approve"
          ? await payrollApi.approveCycle(currentCycle.id)
          : await payrollApi.reopenCycle(currentCycle.id);

      setCurrentCycle(
        updatedCycle || {
          ...currentCycle,
          status: action === "approve" ? "APPROVED" : "DRAFT",
        },
      );
      setSuccessMessage(
        action === "approve"
          ? "Payroll cycle approved."
          : "Payroll cycle reopened.",
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          action === "approve"
            ? "Failed to approve payroll cycle"
            : "Failed to reopen payroll cycle",
        ),
      );
    } finally {
      setCycleAction(null);
    }
  };

  const processedCount = rows.filter(
    (employee) => employee.status === "Processed",
  ).length;
  const pendingCount = rows.filter(
    (employee) => employee.status === "Pending",
  ).length;
  const totalBase = rows.reduce((total, employee) => total + employee.base, 0);
  const totalBonus = rows.reduce(
    (total, employee) => total + employee.bonus,
    0,
  );
  const totalDeductions = rows.reduce(
    (total, employee) => total + employee.deduct,
    0,
  );
  const totalNet = rows.reduce((total, employee) => total + employee.net, 0);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">
        <header className="mb-8 flex items-end justify-between text-left">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Payroll
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Manage employee payroll and salary processing
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isProcessing || pendingCount === 0 || rows.length === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:bg-gray-300 dark:shadow-none dark:disabled:bg-gray-800"
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CircleDollarSign size={18} />
            )}
            {isProcessing ? "Processing..." : "Process Payroll"}
          </button>
        </header>

        <div className="mb-8 grid grid-cols-4 gap-6 text-left">
          {[
            {
              label: "Total Base Salary",
              value: totalBase,
              icon: Wallet,
              color: "text-blue-600",
            },
            {
              label: "Total Bonuses",
              value: totalBonus,
              icon: TrendingDown,
              color: "text-green-600",
            },
            {
              label: "Total Deductions",
              value: totalDeductions,
              icon: TrendingDown,
              color: "text-red-600",
            },
            {
              label: "Net Payroll",
              value: totalNet,
              icon: DollarSign,
              color: "text-purple-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[22px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 flex items-start justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {stat.label}
                </p>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {formatKZT(stat.value)}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400">
                {selectedMonth}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6 text-left">
          <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-5 transition-all dark:border-green-900/20 dark:bg-green-900/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-green-100">
                {processedCount} Employees
              </p>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                Payroll Processed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-orange-50 p-5 transition-all dark:border-orange-900/20 dark:bg-orange-900/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-orange-100">
                {pendingCount} Employees
              </p>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                Pending Processing
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2 dark:border-gray-800 dark:bg-gray-800/50">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              Payroll Month:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="cursor-pointer border-none bg-transparent text-sm font-bold text-gray-900 outline-none dark:text-white"
            />
          </div>
          {currentCycle && (
            <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 dark:border-blue-900/30 dark:bg-blue-900/10">
              <div className="flex min-w-0 items-center gap-3">
              <Clock size={18} className="shrink-0 text-blue-600" />
              <div className="min-w-0">
                <p className="truncate text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">
                  Current cycle: {currentCycle.status}
                </p>
                <p className="truncate text-xs font-semibold text-blue-700/80 dark:text-blue-200/80">
                  {currentCycle.periodStart || "Start pending"} -{" "}
                  {currentCycle.periodEnd || "End pending"} ·{" "}
                  {currentCycle.currency}
                </p>
              </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleCycleAction("approve")}
                  disabled={cycleAction !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {cycleAction === "approve" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void handleCycleAction("reopen")}
                  disabled={cycleAction !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50 disabled:opacity-60 dark:border-blue-900/50 dark:bg-gray-900 dark:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  {cycleAction === "reopen" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={14} />
                  )}
                  Reopen
                </button>
              </div>
            </div>
          )}
        </div>

        {successMessage && !showSuccess && (
          <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
            {successMessage}
          </div>
        )}

        <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-white text-left shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
                {[
                  "Employee",
                  "Department",
                  "Base Salary",
                  "Bonus",
                  "Deductions",
                  "Net Salary",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 size={18} className="animate-spin" />
                      Loading payroll data...
                    </div>
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-sm font-medium text-red-600 dark:text-red-400"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    No employees found for payroll.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-gray-50/30 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">
                      {row.name}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">
                      {row.dept}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900 dark:text-gray-300">
                      {formatKZT(row.base)}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-green-600 dark:text-green-400">
                      +{formatKZT(row.bonus)}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-red-600 dark:text-red-400">
                      -{formatKZT(row.deduct)}
                    </td>
                    <td className="px-6 py-5 text-sm font-extrabold text-gray-900 dark:text-white">
                      {formatKZT(row.net)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                          row.status === "Processed"
                            ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                            : "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => void handleSendPayslip(row.id)}
                        disabled={row.status !== "Processed" || row.isSent}
                        className={`flex items-center gap-2 text-xs font-bold transition-all ${
                          row.isSent
                            ? "cursor-default text-gray-400"
                            : row.status === "Processed"
                              ? "cursor-pointer text-blue-600 hover:text-blue-700"
                              : "cursor-not-allowed text-gray-300 dark:text-gray-700"
                        }`}
                      >
                        {row.isSent ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <Send size={14} />
                        )}
                        {row.isSent ? "Sent" : "Send"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-md rounded-[32px] border border-gray-100 bg-white p-8 text-center shadow-2xl duration-200 animate-in zoom-in-95 dark:border-gray-800 dark:bg-gray-900">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <CircleDollarSign size={32} />
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-gray-900 dark:text-white">
                Process Payroll?
              </h3>
              <p className="mb-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                Are you sure to process payroll for{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedMonth}
                </span>
                ? This will mark all pending employees as processed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmProcess}
                  className="flex-1 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 dark:shadow-none"
                >
                  Yes, Process
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed bottom-10 left-1/2 z-[100] -translate-x-1/2 duration-300 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900 px-6 py-4 text-white shadow-2xl dark:border-gray-200 dark:bg-white dark:text-gray-900">
              <div className="rounded-full bg-green-500 p-1">
                <CheckCircle2 size={18} className="text-white" />
              </div>
              <span className="text-sm font-bold">
                {successMessage || "Payroll processed successfully!"}
              </span>
              <button
                onClick={() => setShowSuccess(false)}
                className="ml-4 text-gray-400 transition-colors hover:text-white dark:hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const EmployeePayrollPage = () => {
  const [payslips, setPayslips] = useState<PayslipItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadPayslips = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const items = await payrollApi.listMyPayslips();
        setPayslips(items);
      } catch (error) {
        setPayslips([]);
        setErrorMessage(getApiErrorMessage(error, "Failed to load payslips"));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPayslips();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Payroll
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            History of your payslips with PDF download by month
          </p>
        </header>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="space-y-5">
          {isLoading ? (
            <div className="rounded-[28px] border border-gray-100 bg-white p-10 text-center text-sm font-medium text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <div className="flex items-center justify-center gap-3">
                <Loader2 size={18} className="animate-spin" />
                Loading payslips...
              </div>
            </div>
          ) : payslips.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-10 text-center text-sm font-medium text-gray-400 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              No payslips yet.
            </div>
          ) : (
            payslips.map((payslip) => (
            <div
              key={payslip.id}
              className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPayslipMonth(payslip.month)}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Paid on {formatPayDate(payslip.payDate)}
                  </p>
                </div>

                <div className="flex flex-col md:items-end">
                  <p className="text-xl font-black text-gray-900 dark:text-white">
                    {formatKZT(payslip.netSalary)}
                  </p>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    {payslip.status}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={payslip.pdfUrl || "#"}
                  target={payslip.pdfUrl ? "_blank" : undefined}
                  rel={payslip.pdfUrl ? "noreferrer" : undefined}
                  aria-disabled={!payslip.pdfUrl}
                  onClick={(event) => {
                    if (!payslip.pdfUrl) {
                      event.preventDefault();
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white ${
                    payslip.pdfUrl
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "cursor-not-allowed bg-gray-300 dark:bg-gray-800"
                  }`}
                >
                  <Download size={16} />
                  {payslip.pdfLabel || "Download PDF"}
                </a>
              </div>
            </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export const PayrollPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (role === "Employee" || role === "Admin") {
    return <EmployeePayrollPage />;
  }

  return <SuperAdminPayrollPage />;
};
