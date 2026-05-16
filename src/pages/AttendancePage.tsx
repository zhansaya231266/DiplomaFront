import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Search,
  Filter,
  Calendar as CalendarIcon,
  ChevronDown,
  UserCheck,
  UserMinus,
  AlertCircle,
  Check,
  ArrowLeft,
  Loader2,
  FileText,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../components/context/useAuth";
import { normalizeRole } from "../shared/utils/roles";
import {
  attendanceApi,
  employeesApi,
  profileApi,
  type AttendanceItem,
  type EmployeeItem,
  type LeaveRequestItem,
  type UserProfileResponse,
  type WorkScheduleItem,
  getApiErrorMessage,
} from "../api";

const mapProfileToEmployee = (profile: UserProfileResponse): EmployeeItem => ({
  id: profile.employeeId || profile.id,
  orgId: profile.organizationId,
  userId: profile.id,
  departmentId: profile.departmentId || "",
  positionId: "",
  role: profile.role || "EMPLOYEE",
  salaryRate: profile.salary || "0",
  status: profile.verificationStatus || "Active",
  firstName: profile.firstname,
  lastName: profile.lastname,
  email: profile.email,
  phoneNumber: profile.phoneNumber || profile.phone || "",
  departmentName: profile.department,
  positionName: profile.position,
});

const EmployeeAttendancePage = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [employee, setEmployee] = useState<EmployeeItem | null>(null);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadEmployeeAttendance = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const profile = await profileApi.getMe();
      const currentEmployee = mapProfileToEmployee(profile);
      setEmployee(currentEmployee);

      if (!currentEmployee.id) {
        setAttendance([]);
        setLeaveRequests([]);
        setErrorMessage("Employee profile was not found for this account.");
        return;
      }

      const [attendanceResult, leaveResult] = await Promise.allSettled([
        attendanceApi.listForEmployee(currentEmployee.id, {
          startDate: getDefaultStartDate(),
          endDate: getDefaultEndDate(),
        }),
        attendanceApi.listMyLeaveRequests(currentEmployee.id),
      ]);

      if (attendanceResult.status === "fulfilled") {
        const attendanceItems = attendanceResult.value;
        setAttendance(attendanceItems);
        setIsCheckedIn(
          attendanceItems.some((item) => item.checkIn && !item.checkOut),
        );
      } else {
        setAttendance([]);
        setErrorMessage(
          getApiErrorMessage(attendanceResult.reason, "Failed to load attendance records"),
        );
      }

      if (leaveResult.status === "fulfilled") {
        setLeaveRequests(leaveResult.value);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load profile"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployeeAttendance();
  }, [loadEmployeeAttendance]);

  const handleSkudEvent = async (eventType: "ENTER" | "EXIT") => {
    setIsActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (eventType === "ENTER") {
        await attendanceApi.checkIn();
      } else {
        await attendanceApi.checkOut();
      }
      setSuccessMessage(
        eventType === "ENTER"
          ? "Check-in registered successfully."
          : "Check-out registered successfully.",
      );
      setIsCheckedIn(eventType === "ENTER");
      await loadEmployeeAttendance();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to register attendance event"),
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeaveSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!employee) {
      setErrorMessage("Employee profile was not found for this account.");
      return;
    }

    const formData = new FormData(form);
    const type = String(formData.get("type") || "");
    const startDate = String(formData.get("startDate") || "");
    const endDate = String(formData.get("endDate") || "");
    const reason = String(formData.get("reason") || "").trim();
    const documentUrl = String(formData.get("documentUrl") || "").trim();

    if (!type || !startDate || !endDate) {
      setErrorMessage("Leave type, start date and end date are required.");
      return;
    }

    setIsActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await attendanceApi.createLeaveRequest({
        employeeId: employee.id,
        type,
        startDate,
        endDate,
        reason,
        documentUrl,
      });
      form.reset();
      setSuccessMessage("Leave request submitted successfully.");
      await loadEmployeeAttendance();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to submit leave request"),
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const todayRecord = attendance[0];
  const totalPresent = attendance.filter(
    (item) => normalizeAttendanceStatus(item.status) === "Present",
  ).length;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Attendance
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Check in, check out and review your worked hours calendar
          </p>
        </header>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Today Status",
              value: isLoading
                ? "Loading..."
                : isCheckedIn
                  ? "Checked In"
                  : "Not Checked In",
              icon: CheckCircle2,
            },
            {
              label: "Today Check-in",
              value: formatTime(todayRecord?.checkIn || ""),
              icon: Clock,
            },
            {
              label: "Recent Present Days",
              value: String(totalPresent),
              icon: CalendarDays,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                <card.icon size={20} />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {card.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => void handleSkudEvent("ENTER")}
            disabled={isCheckedIn || isActionLoading || !employee}
            className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-sm font-bold text-white disabled:bg-gray-300 dark:disabled:bg-gray-800"
          >
            {isActionLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            Check-in
          </button>
          <button
            type="button"
            onClick={() => void handleSkudEvent("EXIT")}
            disabled={!isCheckedIn || isActionLoading || !employee}
            className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-6 py-3 text-sm font-bold text-white disabled:bg-gray-300 dark:bg-white dark:text-gray-900 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
          >
            {isActionLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogOut size={18} />
            )}
            Check-out
          </button>
        </div>

        {(errorMessage || successMessage) && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              errorMessage
                ? "border-red-100 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
                : "border-green-100 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400"
            }`}
          >
            {errorMessage || successMessage}
          </div>
        )}

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-5 text-base font-bold text-gray-900 dark:text-white">
            Worked Hours
          </h3>
          {attendance.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm font-semibold text-gray-400 dark:border-gray-800">
              No attendance records from backend yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {attendance.map((item) => ({
                  date: item.date,
                  checkIn: formatTime(item.checkIn),
                  checkOut: formatTime(item.checkOut),
                  hours: item.note || item.source || "Recorded",
                  status: item.status,
                })).map((day) => (
                <div
                  key={day.date}
                  className="rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-800/50"
                >
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {day.date}
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Check-in: {day.checkIn}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Check-out: {day.checkOut}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {day.hours}
                  </p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    {day.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <form
            onSubmit={handleLeaveSubmit}
            className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-5 flex items-center gap-3">
              <FileText className="text-blue-600" size={20} />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Leave Request
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="type"
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
                defaultValue="VACATION"
              >
                <option value="VACATION">Vacation</option>
                <option value="SICK_LEAVE">Sick leave</option>
                <option value="REMOTE">Remote</option>
                <option value="BUSINESS_TRIP">Business trip</option>
                <option value="UNPAID_LEAVE">Unpaid leave</option>
              </select>
              <input
                name="documentUrl"
                placeholder="Document URL"
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
              />
              <input
                name="startDate"
                type="date"
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
              />
              <input
                name="endDate"
                type="date"
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
              />
            </div>
            <textarea
              name="reason"
              rows={3}
              placeholder="Reason"
              className="mt-4 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={isActionLoading || !employee}
              className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Request
            </button>
          </form>

          <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-5 text-base font-bold text-gray-900 dark:text-white">
              My Leave Requests
            </h3>
            <div className="space-y-3">
              {leaveRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 dark:border-gray-800">
                  No leave requests yet.
                </div>
              ) : (
                leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {request.type.replace(/_/g, " ")}
                      </p>
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {request.startDate} - {request.endDate}
                    </p>
                    {request.reason && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {request.reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

type AttendanceRow = {
  id: string;
  employeeId: string;
  name: string;
  dept: string;
  checkIn: string;
  checkOut: string;
  status: "Present" | "Late" | "On Leave";
  note: string;
};

const formatTime = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const getDefaultStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return formatDateInput(date);
};

const getDefaultEndDate = () => formatDateInput(new Date());

const normalizeAttendanceStatus = (status: string): AttendanceRow["status"] => {
  const normalized = status.toLowerCase();

  if (normalized.includes("leave") || normalized.includes("absence")) {
    return "On Leave";
  }

  if (normalized.includes("late")) {
    return "Late";
  }

  return "Present";
};

const getEmployeeName = (employee?: EmployeeItem) =>
  employee
    ? `${employee.firstName} ${employee.lastName}`.trim() || employee.email
    : "Unknown employee";

const buildAttendanceRows = (
  records: AttendanceItem[],
  employees: EmployeeItem[],
) => {
  const employeeById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );

  return records.map((record) => {
    const employee = employeeById.get(record.employeeId);

    return {
      id: record.id,
      employeeId: record.employeeId,
      name: getEmployeeName(employee),
      dept: employee?.departmentName || "Unassigned",
      checkIn: formatTime(record.checkIn),
      checkOut: formatTime(record.checkOut),
      status: normalizeAttendanceStatus(record.status),
      note: record.note || record.source || record.type,
    };
  });
};

const TeamAttendancePage = ({
  title,
  subtitle,
  lockedDepartment,
}: {
  title: string;
  subtitle: string;
  lockedDepartment?: string;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState(
    lockedDepartment || "All Departments",
  );
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [dateDisplay, setDateDisplay] = useState("Last 7 Days");
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(getDefaultEndDate);

  const periods = [
    { id: "Today", label: "Today", date: "March 14, 2026" },
    { id: "Yesterday", label: "Yesterday", date: "March 13, 2026" },
    { id: "7days", label: "Last 7 Days", date: "Mar 07 - Mar 14, 2026" },
    { id: "30days", label: "Last 30 Days", date: "Feb 14 - Mar 14, 2026" },
  ];

  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [leaveReviewOverrides, setLeaveReviewOverrides] = useState<
    Record<string, string>
  >({});
  const [scheduleByEmployeeId, setScheduleByEmployeeId] = useState<
    Record<string, WorkScheduleItem>
  >({});
  const [scheduleEmployeeId, setScheduleEmployeeId] = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    workStart: "",
    workEnd: "",
    lateThresholdMinutes: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadAttendance = useCallback(async (range = { startDate, endDate }) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [employeeItems, attendanceItems, leaveItems] = await Promise.all([
        employeesApi.list(),
        attendanceApi.list({
          startDate: range.startDate,
          endDate: range.endDate,
        }),
        attendanceApi.listLeaveRequests(),
      ]);
      const visibleEmployees = lockedDepartment
        ? employeeItems.filter(
            (employee) => employee.departmentName === lockedDepartment,
          )
        : employeeItems;
      const visibleEmployeeIds = new Set(
        visibleEmployees.map((employee) => employee.id),
      );

      setEmployees(visibleEmployees);
      setScheduleEmployeeId((currentEmployeeId) =>
        currentEmployeeId &&
        visibleEmployees.some((employee) => employee.id === currentEmployeeId)
          ? currentEmployeeId
          : visibleEmployees[0]?.id || "",
      );
      setAttendanceData(
        buildAttendanceRows(
          attendanceItems.filter((item) =>
            lockedDepartment ? visibleEmployeeIds.has(item.employeeId) : true,
          ),
          visibleEmployees,
        ),
      );
      setLeaveRequests(
        leaveItems
          .filter((item) =>
            lockedDepartment ? visibleEmployeeIds.has(item.employeeId) : true,
          )
          .map((item) => ({
            ...item,
            status: leaveReviewOverrides[item.id] || item.status,
          })),
      );

      const scheduleResults = await Promise.allSettled(
        visibleEmployees.map((employee) =>
          attendanceApi.getWorkSchedule(employee.id),
        ),
      );
      const nextSchedules = scheduleResults.reduce<
        Record<string, WorkScheduleItem>
      >((acc, result, index) => {
        if (result.status === "fulfilled") {
          const employeeId =
            result.value.employeeId || visibleEmployees[index]?.id;

          if (employeeId) {
            acc[employeeId] = {
              ...result.value,
              employeeId,
            };
          }
        }

        return acc;
      }, {});
      setScheduleByEmployeeId(nextSchedules);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load attendance"));
    } finally {
      setIsLoading(false);
    }
  }, [endDate, leaveReviewOverrides, lockedDepartment, startDate]);

  useEffect(() => {
    void loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    const schedule = scheduleByEmployeeId[scheduleEmployeeId];

    setScheduleForm({
      workStart: schedule?.workStart || "",
      workEnd: schedule?.workEnd || "",
      lateThresholdMinutes: schedule?.lateThresholdMinutes
        ? String(schedule.lateThresholdMinutes)
        : "",
    });
  }, [scheduleByEmployeeId, scheduleEmployeeId]);

  const departments = [
    "All Departments",
    ...Array.from(new Set(attendanceData.map((item) => item.dept))),
  ];

  const handlePeriodChange = (period: {
    id: string;
    label: string;
    date: string;
  }) => {
    const today = new Date();
    const rangeEnd = formatDateInput(today);
    const rangeStart = new Date(today);

    if (period.id === "Yesterday") {
      rangeStart.setDate(today.getDate() - 1);
    } else if (period.id === "7days") {
      rangeStart.setDate(today.getDate() - 7);
    } else if (period.id === "30days") {
      rangeStart.setDate(today.getDate() - 30);
    }

    const nextStartDate = formatDateInput(rangeStart);
    const nextEndDate = period.id === "Yesterday" ? nextStartDate : rangeEnd;

    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setSelectedPeriod(period.label);
    setDateDisplay(period.date);
    setIsCustomMode(false);
    setShowPeriodMenu(false);
    void loadAttendance({
      startDate: nextStartDate,
      endDate: nextEndDate,
    });
  };

  const applyCustomRange = () => {
    if (startDate && endDate) {
      setSelectedPeriod("Custom");
      setDateDisplay(`${startDate} - ${endDate}`);
      setShowPeriodMenu(false);
      setIsCustomMode(false);
      void loadAttendance({ startDate, endDate });
    }
  };

  const handleReviewLeave = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await attendanceApi.reviewLeaveRequest(requestId, action);
      const nextStatus = action === "approve" ? "Approved" : "Rejected";
      setLeaveReviewOverrides((current) => ({
        ...current,
        [requestId]: nextStatus,
      }));
      setLeaveRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: nextStatus }
            : request,
        ),
      );
      setSuccessMessage(
        result.locallyResolved
          ? `Backend returned 500, so this request was marked ${nextStatus.toLowerCase()} locally.`
          : action === "approve"
            ? "Leave request approved."
            : "Leave request rejected.",
      );
      if (!result.locallyResolved) {
        await loadAttendance();
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to review leave request"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const employeeId = String(formData.get("employeeId") || "");
    const workStart = String(formData.get("workStart") || "");
    const workEnd = String(formData.get("workEnd") || "");
    const lateThresholdMinutes = Number(formData.get("lateThresholdMinutes"));

    if (!employeeId || !workStart || !workEnd) {
      setErrorMessage("Employee, work start and work end are required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await attendanceApi.setWorkSchedule({
        employeeId,
        workStart,
        workEnd,
        lateThresholdMinutes: Number.isFinite(lateThresholdMinutes)
          ? lateThresholdMinutes
          : 15,
      });
      setScheduleByEmployeeId((current) => ({
        ...current,
        [employeeId]: {
          employeeId,
          workStart,
          workEnd,
          lateThresholdMinutes: Number.isFinite(lateThresholdMinutes)
            ? lateThresholdMinutes
            : 15,
        },
      }));
      setScheduleEmployeeId(employeeId);
      setSuccessMessage("Work schedule saved successfully.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to save work schedule"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = attendanceData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDept = lockedDepartment
      ? item.dept === lockedDepartment
      : selectedDept === "All Departments" || item.dept === selectedDept;
    return matchesSearch && matchesDept;
  });
  const employeeById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );
  const canReviewLeave = (request: LeaveRequestItem) => {
    const requesterRole = normalizeRole(
      employeeById.get(request.employeeId)?.role,
    );

    if (lockedDepartment) {
      return requesterRole === "Employee";
    }

    return requesterRole === "Admin";
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-8 text-left">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {subtitle}
            </p>
          </div>

          {!lockedDepartment && (
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 pl-10 pr-10 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="dark:bg-gray-900">
                    {d}
                  </option>
                ))}
              </select>
              <Filter
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <ChevronDown
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
          {[
            {
              label: "Total Present",
              value: String(
                attendanceData.filter((item) => item.status === "Present")
                  .length,
              ),
              icon: UserCheck,
              color: "text-green-600 dark:text-green-400",
              bg: "bg-green-50 dark:bg-green-900/10",
            },
            {
              label: "Late Arrivals",
              value: String(
                attendanceData.filter((item) => item.status === "Late").length,
              ),
              icon: Clock,
              color: "text-orange-600 dark:text-orange-400",
              bg: "bg-orange-50 dark:bg-orange-900/10",
            },
            {
              label: "On Leave",
              value: String(
                attendanceData.filter((item) => item.status === "On Leave")
                  .length,
              ),
              icon: UserMinus,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-900/10",
            },
            {
              label: "Absent",
              value: "0",
              icon: AlertCircle,
              color: "text-red-600 dark:text-red-400",
              bg: "bg-red-50 dark:bg-red-900/10",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-6 rounded-[22px] ${stat.bg} border border-white dark:border-gray-800 shadow-sm transition-colors`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    {stat.label}
                  </p>
                </div>
                <div className={`${stat.color} opacity-80`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 bg-gray-50/50 dark:bg-gray-800/50">
              <CalendarIcon className="text-gray-400" size={18} />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {dateDisplay}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-100 dark:shadow-none"
              >
                Change Period <ChevronDown size={14} />
              </button>

              {showPeriodMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowPeriodMenu(false);
                      setIsCustomMode(false);
                    }}
                  ></div>
                  <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-150 text-left overflow-hidden">
                    {!isCustomMode ? (
                      <>
                        <div className="px-5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Select Period
                        </div>
                        {periods.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handlePeriodChange(p)}
                            className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            {p.label}
                            {selectedPeriod === p.label && (
                              <Check
                                size={16}
                                className="text-blue-600 dark:text-blue-400"
                              />
                            )}
                          </button>
                        ))}
                        <hr className="my-1 border-gray-50 dark:border-gray-700" />
                        <button
                          onClick={() => setIsCustomMode(true)}
                          className="w-full text-left px-5 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between"
                        >
                          Custom Range... <CalendarDays size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="p-5 space-y-4">
                        <button
                          onClick={() => setIsCustomMode(false)}
                          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-2 transition-colors"
                        >
                          <ArrowLeft size={14} /> Back to presets
                        </button>
                        <div className="space-y-3">
                          {["From", "To"].map((label, idx) => (
                            <div key={label}>
                              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">
                                {label}
                              </label>
                              <input
                                type="date"
                                onChange={(e) =>
                                  idx === 0
                                    ? setStartDate(e.target.value)
                                    : setEndDate(e.target.value)
                                }
                                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs dark:text-white outline-none focus:border-blue-500 transition-all"
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={applyCustomRange}
                          disabled={!startDate || !endDate}
                          className="w-full py-3 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 transition-all shadow-lg shadow-blue-50 dark:shadow-none"
                        >
                          Apply Custom Range
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full max-w-xs group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 dark:text-white rounded-xl text-sm outline-none focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {(errorMessage || successMessage) && !isLoading && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              errorMessage
                ? "border-red-100 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
                : "border-green-100 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400"
            }`}
          >
            {errorMessage || successMessage}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
          <form
            onSubmit={handleScheduleSubmit}
            className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-5 flex items-center gap-3">
              <Clock className="text-blue-600" size={20} />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Work Schedule
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="employeeId"
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
                value={scheduleEmployeeId}
                onChange={(event) => setScheduleEmployeeId(event.target.value)}
              >
                <option value="" disabled>
                  Select employee
                </option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {getEmployeeName(employee)}
                  </option>
                ))}
              </select>
              <input
                name="lateThresholdMinutes"
                type="number"
                min={0}
                value={scheduleForm.lateThresholdMinutes}
                onChange={(event) =>
                  setScheduleForm((current) => ({
                    ...current,
                    lateThresholdMinutes: event.target.value,
                  }))
                }
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
                placeholder="Late threshold"
              />
              <input
                name="workStart"
                type="time"
                value={scheduleForm.workStart}
                onChange={(event) =>
                  setScheduleForm((current) => ({
                    ...current,
                    workStart: event.target.value,
                  }))
                }
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
              />
              <input
                name="workEnd"
                type="time"
                value={scheduleForm.workEnd}
                onChange={(event) =>
                  setScheduleForm((current) => ({
                    ...current,
                    workEnd: event.target.value,
                  }))
                }
                className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving || employees.length === 0}
              className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Save Schedule
            </button>
          </form>

          <div className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={20} />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Leave Requests
                </h3>
              </div>
              <span className="rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-black text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {leaveRequests.length}
              </span>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {leaveRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 dark:border-gray-800">
                  No leave requests.
                </div>
              ) : (
                leaveRequests.map((request) => {
                  const employee = employeeById.get(request.employeeId);
                  const isPending = request.status.toLowerCase() === "pending";
                  const canReviewRequest = canReviewLeave(request);

                  return (
                    <div
                      key={request.id}
                      className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {getEmployeeName(employee)}
                          </p>
                          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {request.type.replace(/_/g, " ")} ·{" "}
                            {request.startDate} - {request.endDate}
                          </p>
                        </div>
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          {request.status}
                        </span>
                      </div>
                      {request.reason && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {request.reason}
                        </p>
                      )}
                      {isPending && canReviewRequest && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleReviewLeave(request.id, "approve")
                            }
                            disabled={isSaving}
                            className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void handleReviewLeave(request.id, "reject")
                            }
                            disabled={isSaving}
                            className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-white dark:text-gray-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {isPending && !canReviewRequest && (
                        <p className="mt-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                          {lockedDepartment
                            ? "Pending SuperAdmin review"
                            : "Visible for SuperAdmin"}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  {[
                    "Employee",
                    "Department",
                    "Check In",
                    "Check Out",
                    "Status",
                    "Note",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider ${h === "Status" ? "text-center" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-8 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-8 py-12 text-center text-sm text-red-600 dark:text-red-400"
                    >
                      {errorMessage}
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-8 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No attendance records found for this period.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                            {row.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {row.dept}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {row.checkIn}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {row.checkOut}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide ${
                            row.status === "Present"
                              ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                              : row.status === "Late"
                                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {row.note || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export const AttendancePage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (role === "Employee" || role === "Admin")
    return <EmployeeAttendancePage />;

  return (
    <TeamAttendancePage
      title="Attendance"
      subtitle="Monitor daily employee presence"
    />
  );
};

export const TeamAttendanceManagementPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (role === "Admin") {
    return (
      <TeamAttendancePage
        title="Department Attendance"
        subtitle={`Monitor attendance for ${user?.department || "your department"}`}
        lockedDepartment={user?.department}
      />
    );
  }

  return (
    <TeamAttendancePage
      title="Attendance"
      subtitle="Monitor daily employee presence"
    />
  );
};
