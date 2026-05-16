import axios, { AxiosError } from "axios";

const DEFAULT_API_URL = "http://localhost:8080/v1";
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const API_TIMEOUT_MS = 15000;
const parseEndpointList = (value: string | undefined, fallback: string[]) => {
  const customEndpoints = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!customEndpoints?.length) {
    return fallback;
  }

  return Array.from(new Set([...customEndpoints, ...fallback]));
};

const DEPARTMENTS_ENDPOINTS = parseEndpointList(
  import.meta.env.VITE_DEPARTMENTS_ENDPOINTS as string | undefined,
  [
    "/organizations/departments",
    "/departments",
    "/reference/departments",
    "/references/departments",
    "/lookup/departments",
  ],
);

const POSITIONS_ENDPOINTS = parseEndpointList(
  import.meta.env.VITE_POSITIONS_ENDPOINTS as string | undefined,
  [
    "/organizations/positions",
    "/positions",
    "/reference/positions",
    "/references/positions",
    "/lookup/positions",
  ],
);

const PAYROLL_LIST_ENDPOINTS = parseEndpointList(
  import.meta.env.VITE_PAYROLL_LIST_ENDPOINTS as string | undefined,
  ["/payroll/cycles", "/payroll", "/payroll/runs", "/payroll/records"],
);

const PAYROLL_PROCESS_ENDPOINTS = parseEndpointList(
  import.meta.env.VITE_PAYROLL_PROCESS_ENDPOINTS as string | undefined,
  ["/payroll/process", "/payroll/runs/process", "/payroll"],
);

const PAYSLIPS_MY_ENDPOINTS = parseEndpointList(
  import.meta.env.VITE_PAYSLIPS_MY_ENDPOINTS as string | undefined,
  [
    "/me/payslips",
    "/payslips/my",
    "/payslips",
    "/payroll/payslips/my",
    "/payroll/payslips",
  ],
);

const TOKEN_STORAGE_KEY = "token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
const USER_STORAGE_KEY = "user";
const AUTH_CHANGE_EVENT = "auth:changed";

export interface User {
  id?: string;
  employeeId?: string;
  firstname: string;
  lastname: string;
  email: string;
  role?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  verificationStatus?: string;
  joinedDate?: string;
  department?: string;
  departmentId?: string;
  position?: string;
  salary?: string;
  location?: string;
  organizationId?: string;
  organizationName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

type LoginResponse = {
  idToken?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  jwt?: string;
  user?: Partial<User>;
  data?: {
    idToken?: string;
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    jwt?: string;
    user?: Partial<User>;
  };
};

type TokenClaims = {
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  "custom:role"?: string;
  "custom:userRole"?: string;
  "custom:user_role"?: string;
  "cognito:groups"?: string[];
  role?: string;
  roles?: string[];
  groups?: string[];
};

export interface InviteVerificationResponse {
  organizationId: string;
  organizationName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  position?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  salaryRate?: string | null;
  status?: string | null;
  expiresAt: string;
  message: string;
}

export interface CompleteInviteRegistrationPayload {
  code: string;
  password: string;
  phoneNumber: string;
}

export interface CompleteInviteRegistrationResponse {
  userId: string;
  organizationId: string;
  role: string;
}

export interface GenerateInvitePayload {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string;
  positionId?: string;
  position?: string;
  salaryRate?: string;
  status?: string;
}

export interface GenerateInviteResponse {
  inviteId: string;
  organizationId: string;
  organizationName: string;
  email: string;
  code: string;
  expiresAt: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  org_id?: string | null;
  type: string;
  title: string;
  message: string;
  metadata: unknown;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  scope: "global" | "department" | string;
  departmentId?: string | null;
  departmentName?: string | null;
  createdBy: string;
  createdByRole: string;
  organizationId: string;
  createdAt: string;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  scope: "global" | "department";
  departmentId?: string | null;
}

export interface UpdateEventPayload {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  departmentId?: string | null;
}

export interface UserProfileResponse {
  id: string;
  employeeId?: string;
  organizationId: string;
  organizationName: string;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  role: string;
  phone: string;
  phoneNumber: string;
  verificationStatus: string;
  joinedDate: string;
  department: string;
  departmentId?: string;
  position: string;
  salary: string;
  location: string;
}

export interface LegalDocumentItem {
  id: string;
  documentType: string;
  title?: string;
  url: string;
  isActive?: boolean;
}

export interface DepartmentItem {
  id: string;
  name: string;
}

export interface PositionItem {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
}

export interface CityItem {
  id: string;
  name: string;
}

export interface CreateDepartmentPayload {
  departmentName: string;
}

export interface CreatePositionPayload {
  positionName: string;
  departmentId?: string;
}

const extractCollection = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.items)) {
    return record.items;
  }

  if (Array.isArray(record.data)) {
    return record.data;
  }

  if (Array.isArray(record.content)) {
    return record.content;
  }

  if (Array.isArray(record.results)) {
    return record.results;
  }

  if (Array.isArray(record.rows)) {
    return record.rows;
  }

  if (record.data) {
    return extractCollection(record.data);
  }

  if (record.result) {
    return extractCollection(record.result);
  }

  if (record.payload) {
    return extractCollection(record.payload);
  }

  return [];
};

const normalizeReferenceItem = (
  item: unknown,
): {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
} | null => {
  if (typeof item === "string" && item.trim()) {
    return {
      id: item.trim(),
      name: item.trim(),
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id =
    record.id ??
    record.departmentId ??
    record.positionId ??
    record.department_id ??
    record.position_id ??
    record.uuid ??
    record.value ??
    record.code;
  const name =
    record.name ??
    record.title ??
    record.departmentName ??
    record.positionName ??
    record.department_name ??
    record.position_name ??
    record.label ??
    record.displayName ??
    record.display_name ??
    record.description;

  if (typeof id !== "string" && typeof id !== "number") {
    return null;
  }

  if (typeof name !== "string" || !name.trim()) {
    return null;
  }

  return {
    id: String(id),
    name: name.trim(),
    departmentId: getOptionalStringValue(record, [
      "departmentId",
      "department_id",
    ]),
    departmentName: getOptionalStringValue(record, [
      "departmentName",
      "department_name",
      "department",
    ]),
  };
};

const normalizeLegalDocumentItem = (
  item: unknown,
): LegalDocumentItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ["id", "documentId", "document_id"]);
  const documentType = getStringValue(record, [
    "documentType",
    "document_type",
    "type",
    "code",
  ]);
  const url = getStringValue(record, [
    "url",
    "fileUrl",
    "file_url",
    "documentUrl",
    "document_url",
    "path",
  ]);

  if (!documentType && !url) {
    return null;
  }

  return {
    id: id || documentType || url,
    documentType,
    title: getOptionalStringValue(record, ["title", "name", "label"]),
    url,
    isActive:
      typeof record.isActive === "boolean"
        ? record.isActive
        : typeof record.is_active === "boolean"
          ? record.is_active
          : undefined,
  };
};

const getStringValue = (
  record: Record<string, unknown>,
  keys: string[],
): string => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
};

const getOptionalStringValue = (
  record: Record<string, unknown>,
  keys: string[],
): string | undefined => {
  const value = getStringValue(record, keys);
  return value || undefined;
};

const getNumberValue = (
  record: Record<string, unknown>,
  keys: string[],
): number => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
};

const normalizeEmployeeItem = (item: unknown): EmployeeItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ["id", "employeeId", "employee_id"]);
  const email = getStringValue(record, ["email", "emailAddress", "email_address"]);

  if (!id && !email) {
    return null;
  }

  return {
    id: id || email,
    orgId: getStringValue(record, ["orgId", "org_id", "organizationId", "organization_id"]),
    userId: getStringValue(record, ["userId", "user_id"]),
    departmentId: getStringValue(record, ["departmentId", "department_id"]),
    positionId: getStringValue(record, ["positionId", "position_id"]),
    role: getStringValue(record, ["role", "userRole", "user_role"]) || "Employee",
    salaryRate: getStringValue(record, ["salaryRate", "salary_rate", "salary"]) || "0",
    status: getStringValue(record, ["status", "employeeStatus", "employee_status"]) || "Active",
    firstName: getStringValue(record, ["firstName", "first_name", "firstname", "givenName"]),
    lastName: getStringValue(record, ["lastName", "last_name", "lastname", "familyName"]),
    email,
    phoneNumber: getStringValue(record, ["phoneNumber", "phone_number", "phone"]),
    departmentName: getStringValue(record, [
      "departmentName",
      "department_name",
      "department",
    ]),
    positionName: getStringValue(record, ["positionName", "position_name", "position"]),
  };
};

const normalizeSingleEmployeeItem = (payload: unknown): EmployeeItem | null => {
  const directEmployee = normalizeEmployeeItem(payload);

  if (directEmployee) {
    return directEmployee;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  for (const key of ["data", "result", "payload", "employee"]) {
    const nestedEmployee = normalizeEmployeeItem(record[key]);

    if (nestedEmployee) {
      return nestedEmployee;
    }
  }

  return null;
};

const normalizeSinglePayrollCycle = (payload: unknown): PayrollCycleItem | null => {
  const directCycle = normalizePayrollCycle(payload);

  if (directCycle) {
    return directCycle;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  for (const key of ["data", "result", "payload", "cycle", "currentCycle"]) {
    const nestedCycle = normalizePayrollCycle(record[key]);

    if (nestedCycle) {
      return nestedCycle;
    }
  }

  return null;
};

const normalizeAttendanceItem = (item: unknown): AttendanceItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ["id"]);
  const employeeId = getStringValue(record, ["employee_id", "employeeId"]);
  const date = getStringValue(record, ["date"]);

  if (!id && !employeeId && !date) {
    return null;
  }

  return {
    id: id || `${employeeId}-${date}`,
    employeeId,
    date,
    checkIn: getStringValue(record, ["check_in", "checkIn"]),
    checkOut: getStringValue(record, ["check_out", "checkOut"]),
    status: getStringValue(record, ["status"]) || "Present",
    type: getStringValue(record, ["type"]),
    source: getStringValue(record, ["source"]),
    note: getStringValue(record, ["note"]),
  };
};

const normalizeLeaveRequestItem = (item: unknown): LeaveRequestItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ["id", "leave_request_id", "leaveRequestId"]);
  const employeeId = getStringValue(record, ["employee_id", "employeeId"]);

  if (!id && !employeeId) {
    return null;
  }

  return {
    id: id || `${employeeId}-${getStringValue(record, ["start_date", "startDate"])}`,
    employeeId,
    type: getStringValue(record, ["type"]),
    startDate: getStringValue(record, ["start_date", "startDate"]),
    endDate: getStringValue(record, ["end_date", "endDate"]),
    reason: getStringValue(record, ["reason"]),
    documentUrl: getStringValue(record, ["document_url", "documentUrl"]),
    status: getStringValue(record, ["status"]) || "Pending",
    createdAt: getStringValue(record, ["created_at", "createdAt"]),
    reviewedAt: getStringValue(record, ["reviewed_at", "reviewedAt"]),
    reviewedBy: getStringValue(record, ["reviewed_by", "reviewedBy"]),
  };
};

const normalizeWorkScheduleItem = (payload: unknown): WorkScheduleItem => {
  const rootRecord =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const nested =
    rootRecord.data ??
    rootRecord.schedule ??
    rootRecord.workSchedule ??
    rootRecord.work_schedule ??
    rootRecord.result;
  const record =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : rootRecord;
  const threshold = Number(
    record.late_threshold_minutes ?? record.lateThresholdMinutes ?? 15,
  );

  return {
    employeeId: getStringValue(record, ["employee_id", "employeeId"]),
    workStart: getStringValue(record, ["work_start", "workStart"]),
    workEnd: getStringValue(record, ["work_end", "workEnd"]),
    lateThresholdMinutes: Number.isFinite(threshold) ? threshold : 15,
  };
};

const normalizeCalendarSummary = (payload: unknown): CalendarSummaryResponse => {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const toNumber = (value: unknown) =>
    typeof value === "number" ? value : Number(value) || 0;

  return {
    year: toNumber(record.year),
    month: toNumber(record.month),
    totalDays: toNumber(record.total_days ?? record.totalDays),
    workingDays: toNumber(record.working_days ?? record.workingDays),
    weekends: toNumber(record.weekends),
    holidays: toNumber(record.holidays),
    workdayOverrides: toNumber(
      record.workday_overrides ?? record.workdayOverrides,
    ),
    days: extractCollection(record.days).map((day) => {
      const dayRecord =
        day && typeof day === "object" ? (day as Record<string, unknown>) : {};

      return {
        date: getStringValue(dayRecord, ["date"]),
        weekday: getStringValue(dayRecord, ["weekday"]),
        type: getStringValue(dayRecord, ["type"]),
        name: getStringValue(dayRecord, ["name"]),
        isWorking: Boolean(dayRecord.is_working ?? dayRecord.isWorking),
      };
    }),
  };
};

const normalizePayrollItem = (item: unknown): PayrollItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, [
    "id",
    "payrollId",
    "payroll_id",
    "recordId",
    "record_id",
  ]);
  const employeeId = getStringValue(record, [
    "employeeId",
    "employee_id",
    "employee",
  ]);
  const employeeName = getStringValue(record, [
    "employeeName",
    "employee_name",
    "fullName",
    "full_name",
    "name",
  ]);

  if (!id && !employeeId && !employeeName) {
    return null;
  }

  const status =
    getStringValue(record, ["status", "payrollStatus", "payroll_status"]) ||
    "Pending";

  return {
    id: id || employeeId || employeeName,
    cycleId: getOptionalStringValue(record, [
      "cycleId",
      "cycle_id",
      "payrollCycleId",
      "payroll_cycle_id",
    ]),
    payslipId: getOptionalStringValue(record, [
      "payslipId",
      "payslip_id",
      "payrollPayslipId",
      "payroll_payslip_id",
    ]),
    employeeId,
    employeeName,
    departmentName: getStringValue(record, [
      "departmentName",
      "department_name",
      "department",
    ]),
    baseSalary: getNumberValue(record, [
      "baseSalary",
      "base_salary",
      "salaryRate",
      "salary_rate",
      "salary",
      "base",
    ]),
    bonus: getNumberValue(record, ["bonus", "bonuses", "totalBonus"]),
    deductions: getNumberValue(record, [
      "deductions",
      "deduct",
      "totalDeductions",
      "total_deductions",
      "deductionsTotal",
      "deductions_total",
      "taxesTotal",
      "taxes_total",
    ]),
    netSalary: getNumberValue(record, [
      "netSalary",
      "net_salary",
      "net",
      "amount",
      "total",
    ]),
    status,
    payslipSent:
      Boolean(
        record.payslipSent ??
          record.payslip_sent ??
          record.isSent ??
          record.sent_at,
      ) ||
      status.toLowerCase().includes("sent"),
    payslipUrl: getStringValue(record, [
      "payslipUrl",
      "payslip_url",
      "pdfUrl",
      "pdf_url",
      "url",
    ]),
    payDate: getStringValue(record, [
      "payDate",
      "pay_date",
      "paidAt",
      "paid_at",
      "sentAt",
      "sent_at",
    ]),
    month: getStringValue(record, ["month", "period", "payrollMonth"]),
  };
};

const normalizePayslipItem = (item: unknown): PayslipItem | null => {
  const payrollItem = normalizePayrollItem(item);

  if (!payrollItem) {
    return null;
  }

  const record =
    item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const periodStart = getStringValue(record, ["period_start", "periodStart"]);
  const periodEnd = getStringValue(record, ["period_end", "periodEnd"]);
  const pdfFilename = getStringValue(record, [
    "pdfFilename",
    "pdf_filename",
    "pdfLabel",
    "pdf_label",
  ]);

  return {
    id: payrollItem.id,
    month: payrollItem.month || periodStart.slice(0, 7) || periodEnd.slice(0, 7),
    payDate: payrollItem.payDate,
    netSalary: payrollItem.netSalary || payrollItem.baseSalary,
    status: payrollItem.status,
    pdfUrl: payrollItem.payslipUrl,
    pdfLabel:
      pdfFilename ||
      (payrollItem.payslipUrl
        ? payrollItem.payslipUrl.split("/").pop() || "payslip.pdf"
        : "payslip.pdf"),
  };
};

const normalizePayrollCycle = (item: unknown): PayrollCycleItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ["id", "cycleId", "cycle_id"]);

  if (!id) {
    return null;
  }

  return {
    id,
    periodStart: getStringValue(record, ["periodStart", "period_start"]),
    periodEnd: getStringValue(record, ["periodEnd", "period_end"]),
    status: getStringValue(record, ["status"]) || "DRAFT",
    currency: getStringValue(record, ["currency"]) || "KZT",
  };
};

const getMonthPeriod = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const periodStart = `${month}-01`;
  const periodEnd = new Date(year, monthNumber, 0).toISOString().slice(0, 10);

  return { periodStart, periodEnd };
};

const cycleMatchesMonth = (cycle: PayrollCycleItem, month?: string) =>
  !month ||
  cycle.periodStart.slice(0, 7) === month ||
  cycle.periodEnd.slice(0, 7) === month;

const normalizeChartResponse = (payload: unknown): ChartResponse => {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const labels = Array.isArray(record.labels)
    ? record.labels.map(String)
    : [];
  const series = extractCollection(record.series)
    .map((item) => {
      const seriesRecord =
        item && typeof item === "object" ? (item as Record<string, unknown>) : {};

      return {
        name: getStringValue(seriesRecord, ["name", "label"]),
        data: Array.isArray(seriesRecord.data)
          ? seriesRecord.data.map((value) => Number(value) || 0)
          : [],
      };
    })
    .filter((item) => item.name || item.data.length > 0);

  return { labels, series };
};

const normalizePieChartResponse = (payload: unknown): PieChartResponse => ({
  items: extractCollection(
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>).items
      : payload,
  )
    .map((item) => {
      const record =
        item && typeof item === "object" ? (item as Record<string, unknown>) : {};

      return {
        label: getStringValue(record, ["label", "name"]),
        value: getNumberValue(record, ["value", "count"]),
      };
    })
    .filter((item) => item.label),
});

const normalizeDashboardReport = (payload: unknown): DashboardReportResponse => {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    totalEmployees: getNumberValue(record, ["total_employees", "totalEmployees"]),
    activeEmployees: getNumberValue(record, [
      "active_employees",
      "activeEmployees",
    ]),
    presentToday: getNumberValue(record, ["present_today", "presentToday"]),
    absentToday: getNumberValue(record, ["absent_today", "absentToday"]),
    lateToday: getNumberValue(record, ["late_today", "lateToday"]),
    onLeaveToday: getNumberValue(record, ["on_leave_today", "onLeaveToday"]),
    attendanceRate: getStringValue(record, [
      "attendance_rate",
      "attendanceRate",
    ]),
    monthlyPayroll: getNumberValue(record, [
      "monthly_payroll",
      "monthlyPayroll",
    ]),
    payrollCurrency:
      getStringValue(record, ["payroll_currency", "payrollCurrency"]) || "KZT",
    payrollGrowthPercent: getStringValue(record, [
      "payroll_growth_percent",
      "payrollGrowthPercent",
    ]),
    employeeGrowth: getNumberValue(record, ["employee_growth", "employeeGrowth"]),
  };
};

const normalizeAttendanceTodayReport = (
  payload: unknown,
): AttendanceTodayReport => {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    date: getStringValue(record, ["date"]),
    present: getNumberValue(record, ["present"]),
    absent: getNumberValue(record, ["absent"]),
    late: getNumberValue(record, ["late"]),
    onLeave: getNumberValue(record, ["on_leave", "onLeave"]),
    remote: getNumberValue(record, ["remote"]),
    totalActive: getNumberValue(record, ["total_active", "totalActive"]),
    attendanceRate: getStringValue(record, [
      "attendance_rate",
      "attendanceRate",
    ]),
    chart: normalizePieChartResponse(record.chart),
  };
};

const normalizeEmployeeStatisticsReport = (
  payload: unknown,
): EmployeeStatisticsReport => {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    totalEmployees: getNumberValue(record, ["total_employees", "totalEmployees"]),
    activeEmployees: getNumberValue(record, [
      "active_employees",
      "activeEmployees",
    ]),
    inactiveEmployees: getNumberValue(record, [
      "inactive_employees",
      "inactiveEmployees",
    ]),
    averageSalary: getNumberValue(record, ["average_salary", "averageSalary"]),
    byDepartment: normalizeChartResponse(
      record.by_department ?? record.byDepartment,
    ),
    byRole: normalizePieChartResponse(record.by_role ?? record.byRole),
    byStatus: normalizePieChartResponse(record.by_status ?? record.byStatus),
  };
};

const normalizeDepartmentPayrollReport = (
  payload: unknown,
): DepartmentPayrollReport => {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    chart: normalizeChartResponse(record.chart),
    rows: extractCollection(record.rows)
      .map((item) => {
        const row =
          item && typeof item === "object"
            ? (item as Record<string, unknown>)
            : {};

        return {
          departmentId: getStringValue(row, [
            "department_id",
            "departmentId",
          ]),
          departmentName: getStringValue(row, [
            "department_name",
            "departmentName",
          ]),
          employeesCount: getNumberValue(row, [
            "employees_count",
            "employeesCount",
          ]),
          averageSalary: getNumberValue(row, [
            "average_salary",
            "averageSalary",
          ]),
          netSalaryTotal: getNumberValue(row, [
            "net_salary_total",
            "netSalaryTotal",
          ]),
          grossSalaryTotal: getNumberValue(row, [
            "gross_salary_total",
            "grossSalaryTotal",
          ]),
          bonusesTotal: getNumberValue(row, ["bonuses_total", "bonusesTotal"]),
          deductionsTotal: getNumberValue(row, [
            "deductions_total",
            "deductionsTotal",
          ]),
          totalEmployerCost: getNumberValue(row, [
            "total_employer_cost",
            "totalEmployerCost",
          ]),
          currency: getStringValue(row, ["currency"]) || "KZT",
        };
      })
      .filter((row) => row.departmentName),
  };
};

export const normalizeUserProfile = (payload: unknown): UserProfileResponse => {
  const rootRecord =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const nestedProfile =
    rootRecord.data ??
    rootRecord.profile ??
    rootRecord.user ??
    rootRecord.employee ??
    rootRecord.payload ??
    rootRecord.result;
  const baseRecord =
    nestedProfile && typeof nestedProfile === "object"
      ? (nestedProfile as Record<string, unknown>)
      : rootRecord;
  const record = {
    ...baseRecord,
    ...(baseRecord.user && typeof baseRecord.user === "object"
      ? (baseRecord.user as Record<string, unknown>)
      : {}),
    ...(baseRecord.profile && typeof baseRecord.profile === "object"
      ? (baseRecord.profile as Record<string, unknown>)
      : {}),
    ...(baseRecord.employee && typeof baseRecord.employee === "object"
      ? (baseRecord.employee as Record<string, unknown>)
      : {}),
  };

  const firstname = getStringValue(record, [
    "firstname",
    "firstName",
    "first_name",
    "givenName",
  ]);
  const lastname = getStringValue(record, [
    "lastname",
    "lastName",
    "last_name",
    "familyName",
  ]);
  const email = getStringValue(record, ["email", "emailAddress", "email_address"]);
  const department = getStringValue(record, [
    "department",
    "departmentName",
    "department_name",
  ]) || (record.department && typeof record.department === "object"
    ? getStringValue(record.department as Record<string, unknown>, [
        "name",
        "departmentName",
        "department_name",
      ])
    : "");
  const position = getStringValue(record, [
    "position",
    "positionName",
    "position_name",
    "jobTitle",
    "job_title",
  ]) || (record.position && typeof record.position === "object"
    ? getStringValue(record.position as Record<string, unknown>, [
        "name",
        "positionName",
        "position_name",
        "title",
      ])
    : "");
  const phone = getStringValue(record, ["phone", "phoneNumber", "phone_number"]);
  const fullName =
    getStringValue(record, ["fullName", "full_name", "name"]) ||
    [firstname, lastname].filter(Boolean).join(" ").trim();

  return {
    id: getStringValue(record, [
      "employeeId",
      "employee_id",
      "id",
      "userId",
      "user_id",
    ]),
    employeeId: getOptionalStringValue(record, [
      "employeeId",
      "employee_id",
      "employeeProfileId",
      "employee_profile_id",
    ]),
    organizationId: getStringValue(record, [
      "organizationId",
      "organization_id",
      "orgId",
      "org_id",
    ]),
    organizationName: getStringValue(record, [
      "organizationName",
      "organization_name",
      "orgName",
      "org_name",
    ]),
    email,
    firstname,
    lastname,
    fullName: fullName || email,
    role: getStringValue(record, ["role", "userRole", "user_role"]),
    phone,
    phoneNumber: phone,
    verificationStatus: getStringValue(record, [
      "verificationStatus",
      "verification_status",
      "status",
    ]),
    joinedDate: getStringValue(record, [
      "joinedDate",
      "joined_date",
      "createdAt",
      "created_at",
      "hireDate",
      "hire_date",
    ]),
    department,
    departmentId: getOptionalStringValue(record, [
      "departmentId",
      "department_id",
    ]),
    position,
    salary: getStringValue(record, ["salary", "salaryRate", "salary_rate"]),
    location: getStringValue(record, [
      "location",
      "workLocation",
      "work_location",
      "officeLocation",
      "office_location",
    ]),
  };
};

const getWithFallback = async <T>(endpoints: string[]) => {
  let lastError: AxiosError | Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<T>(endpoint);
      return response.data;
    } catch (error) {
      lastError = error as AxiosError | Error;

      if (!isNotFoundError(error)) {
        break;
      }
    }
  }

  throw lastError ?? new Error("Request failed");
};

const postWithFallback = async <T>(endpoints: string[], payload?: unknown) => {
  let lastError: AxiosError | Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.post<T>(endpoint, payload);
      return response.data;
    } catch (error) {
      lastError = error as AxiosError | Error;

      if (!isNotFoundError(error)) {
        break;
      }
    }
  }

  throw lastError ?? new Error("Request failed");
};

export interface SubmitConsentsPayload {
  privacyPolicyAccepted: boolean;
  termsAndConditionsAccepted: boolean;
}

export interface ValidateConsentsResponse {
  valid?: boolean;
  isValid?: boolean;
  [key: string]: unknown;
}

export interface EmployeeItem {
  id: string;
  orgId: string;
  userId: string;
  departmentId: string;
  positionId: string;
  role: string;
  salaryRate: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  departmentName: string;
  positionName: string;
}

export interface CreateEmployeePayload {
  userId: string;
  departmentId: string;
  positionId: string;
  role: string;
  salaryRate: string;
  status: string;
}

export interface CreateEmployeeResponse {
  employeeId: string;
}

export interface EmployeeSearchParams {
  query?: string;
  departmentId?: string;
  positionId?: string;
  status?: string;
}

export interface UpdateEmployeeRolePayload {
  role: string;
}

export interface UpdateEmployeeSalaryPayload {
  salaryRate: string;
}

export interface UpdateEmployeeStatusPayload {
  status: string;
}

export interface UpdateEmployeeDepartmentPayload {
  departmentId: string;
}

export interface UpdateEmployeePositionPayload {
  positionId: string;
}

export interface AttendanceItem {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  type: string;
  source: string;
  note: string;
}

export interface AttendanceListParams {
  startDate?: string;
  endDate?: string;
}

export interface CreateSkudEventPayload {
  employeeId: string;
  eventType: "ENTER" | "EXIT";
  deviceId?: string;
  occurredAt?: string;
}

export interface LeaveRequestItem {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  documentUrl: string;
  status: string;
  createdAt: string;
  reviewedAt: string;
  reviewedBy: string;
}

export interface CreateLeaveRequestPayload {
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  documentUrl?: string;
}

export interface WorkScheduleItem {
  employeeId: string;
  workStart: string;
  workEnd: string;
  lateThresholdMinutes: number;
}

export interface SetWorkSchedulePayload {
  employeeId: string;
  workStart: string;
  workEnd: string;
  lateThresholdMinutes?: number;
}

export interface CalendarDayItem {
  date: string;
  weekday: string;
  type: string;
  name: string;
  isWorking: boolean;
}

export interface CalendarSummaryResponse {
  year: number;
  month: number;
  totalDays: number;
  workingDays: number;
  weekends: number;
  holidays: number;
  workdayOverrides: number;
  days: CalendarDayItem[];
}

export interface AddCalendarDayPayload {
  date: string;
  type: "HOLIDAY" | "WORKDAY";
  name?: string;
}

export interface PayrollItem {
  id: string;
  cycleId?: string;
  payslipId?: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: string;
  payslipSent: boolean;
  payslipUrl: string;
  payDate: string;
  month: string;
}

export interface PayrollListParams {
  month?: string;
}

export interface ProcessPayrollPayload {
  month: string;
}

export interface PayslipItem {
  id: string;
  month: string;
  payDate: string;
  netSalary: number;
  status: string;
  pdfUrl: string;
  pdfLabel: string;
}

export interface PayrollCycleItem {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  currency: string;
}

export interface ChartSeriesItem {
  name: string;
  data: number[];
}

export interface ChartResponse {
  labels: string[];
  series: ChartSeriesItem[];
}

export interface PieChartItem {
  label: string;
  value: number;
}

export interface PieChartResponse {
  items: PieChartItem[];
}

export interface DashboardReportResponse {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  attendanceRate: string;
  monthlyPayroll: number;
  payrollCurrency: string;
  payrollGrowthPercent: string;
  employeeGrowth: number;
}

export interface AttendanceTodayReport {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  remote: number;
  totalActive: number;
  attendanceRate: string;
  chart: PieChartResponse;
}

export interface EmployeeStatisticsReport {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  averageSalary: number;
  byDepartment: ChartResponse;
  byRole: PieChartResponse;
  byStatus: PieChartResponse;
}

export interface DepartmentPayrollRow {
  departmentId: string;
  departmentName: string;
  employeesCount: number;
  averageSalary: number;
  netSalaryTotal: number;
  grossSalaryTotal: number;
  bonusesTotal: number;
  deductionsTotal: number;
  totalEmployerCost: number;
  currency: string;
}

export interface DepartmentPayrollReport {
  rows: DepartmentPayrollRow[];
  chart: ChartResponse;
}

const loginEndpoints = ["/auth/login", "/auth/sign-in", "/login", "/signin"];

export const getStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
export const getStoredRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

export const getStoredUser = (): User | null => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const parseJwtClaims = (token?: string): TokenClaims | null => {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalizedPayload = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "=",
    );
    const decodedPayload = atob(normalizedPayload);

    return JSON.parse(decodedPayload) as TokenClaims;
  } catch {
    return null;
  }
};

const splitFullName = (fullName?: string) => {
  const normalizedName = fullName?.trim();

  if (!normalizedName) {
    return { firstname: "", lastname: "" };
  }

  const [firstname, ...lastnameParts] = normalizedName.split(/\s+/);

  return {
    firstname: firstname || "",
    lastname: lastnameParts.join(" "),
  };
};

const getRoleFromClaims = (claims?: TokenClaims | null) => {
  if (!claims) {
    return undefined;
  }

  const directRole =
    claims["custom:role"] ||
    claims["custom:userRole"] ||
    claims["custom:user_role"] ||
    claims.role;

  if (directRole) {
    return directRole;
  }

  return [
    ...(claims["cognito:groups"] || []),
    ...(claims.roles || []),
    ...(claims.groups || []),
  ].find((item) =>
    [
      "superadmin",
      "super_admin",
      "sysadmin",
      "sys_admin",
      "system_admin",
      "systemadmin",
      "admin",
      "org_admin",
      "organization_admin",
      "employee",
    ].includes(
      item.trim().toLowerCase(),
    ),
  );
};

const getRoleFromPayload = (payload?: Partial<User>) => {
  if (!payload) {
    return undefined;
  }

  const record = payload as Partial<User> &
    Record<string, string | string[] | undefined>;
  const directRole =
    record.role ||
    record.userRole ||
    record.user_role ||
    record.appRole ||
    record.app_role ||
    record.accountRole ||
    record.account_role;

  if (directRole) {
    return Array.isArray(directRole) ? directRole[0] : directRole;
  }

  const groups = [
    ...(Array.isArray(record.groups) ? record.groups : []),
    ...(Array.isArray(record.roles) ? record.roles : []),
    ...(Array.isArray(record.authorities) ? record.authorities : []),
  ];

  return groups.find(Boolean);
};

export const persistAuth = (
  token: string,
  user: User,
  refreshToken?: string | null,
) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
});

let refreshPromise: Promise<string | null> | null = null;

const setStoredToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

const setStoredRefreshToken = (refreshToken: string) => {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<LoginResponse>("/auth/refresh", { refreshToken })
      .then((response) => {
        const nextAccessToken =
          response.data.accessToken || response.data.data?.accessToken;
        const nextRefreshToken =
          response.data.refreshToken || response.data.data?.refreshToken;

        if (!nextAccessToken) {
          clearStoredAuth();
          return null;
        }

        setStoredToken(nextAccessToken);

        if (nextRefreshToken) {
          setStoredRefreshToken(nextRefreshToken);
        }

        return nextAccessToken;
      })
      .catch(() => {
        clearStoredAuth();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    const isAuthRequest =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;
      const nextToken = await refreshAccessToken();

      if (nextToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return api(originalRequest);
      }

      if (getStoredRefreshToken()) {
        clearStoredAuth();
      }
    }

    if (error.response?.status === 401 && isAuthRequest) {
      clearStoredAuth();
    }

    return Promise.reject(error);
  },
);

const buildUserFromPayload = (
  payload: Partial<User> | undefined,
  fallbackEmail: string,
  tokenClaims?: TokenClaims | null,
): User => {
  const namePartsFromToken = splitFullName(tokenClaims?.name);
  const tokenRole = getRoleFromClaims(tokenClaims);
  const payloadRole = getRoleFromPayload(payload);

  return {
    firstname:
      payload?.firstname ||
      tokenClaims?.given_name ||
      namePartsFromToken.firstname,
    lastname:
      payload?.lastname ||
      tokenClaims?.family_name ||
      namePartsFromToken.lastname,
    email: payload?.email || tokenClaims?.email || fallbackEmail,
    role: tokenRole || payloadRole,
    fullName: tokenClaims?.name,
    phone: tokenClaims?.phone_number,
  };
};

const extractLoginResponse = (
  response: LoginResponse,
  email: string,
): { token: string; user: User; refreshToken?: string } => {
  const token =
    response.token ||
    response.accessToken ||
    response.jwt ||
    response.data?.token ||
    response.data?.accessToken ||
    response.data?.jwt;
  const refreshToken = response.refreshToken || response.data?.refreshToken;
  const idToken = response.idToken || response.data?.idToken;

  if (!token) {
    throw new Error("Server did not return an auth token");
  }

  const userPayload =
    response.user ||
    response.data?.user ||
    (response.data as Partial<User> | undefined) ||
    (response as Partial<User>);
  const tokenClaims = parseJwtClaims(idToken) || parseJwtClaims(token);

  return {
    token,
    user: buildUserFromPayload(userPayload, email, tokenClaims),
    refreshToken,
  };
};

const isNotFoundError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

const isForbiddenError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 403;

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return fallback;
  }

  const responseData = error.response?.data;
  const status = error.response?.status;
  const requestUrl = error.config?.url;

  if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
    return `${fallback}: request timed out. Check that the backend is responding.`;
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (responseData?.details) {
    return responseData.details;
  }

  if (status && requestUrl) {
    return `${fallback} (${status} ${requestUrl})`;
  }

  if (status) {
    return `${fallback} (HTTP ${status})`;
  }

  return fallback;
};

export const authApi = {
  login: async (payload: LoginPayload) => {
    let lastError: AxiosError | Error | null = null;

    for (const endpoint of loginEndpoints) {
      try {
        const response = await api.post<LoginResponse>(endpoint, payload);
        return extractLoginResponse(response.data, payload.email);
      } catch (error) {
        lastError = error as AxiosError | Error;

        if (!isNotFoundError(error)) {
          break;
        }
      }
    }

    throw new Error(
      getApiErrorMessage(lastError, "Failed to sign in. Check API endpoint."),
    );
  },
  forgotPassword: async (payload: ForgotPasswordPayload) => {
    try {
      await api.post("/auth/forgot-password", payload);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to request password reset"),
      );
    }
  },
  resetPassword: async (payload: ResetPasswordPayload) => {
    try {
      await api.post("/auth/reset-password", payload);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to reset password"));
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      throw new Error(getApiErrorMessage(error, "Failed to sign out"));
    }
  },
};

export const organizationApi = {
  create: (data: unknown) => api.post("/organizations", data),
  verifyOtp: (email: string, code: string) =>
    api.post("/organizations/verify-otp", { email, code }),
  submitConsents: async (payload: SubmitConsentsPayload) => {
    try {
      const response = await api.post("/organizations/consents", payload);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to submit consents"));
    }
  },
  validateConsents: async (organizationId: string) => {
    try {
      const response = await api.get<ValidateConsentsResponse>(
        "/organizations/consents/validate",
        {
          params: { organizationId },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to validate consents"));
    }
  },
  getDocs: async () => {
    try {
      const response = await api.get<unknown>("/legal/documents");
      return extractCollection(response.data)
        .map(normalizeLegalDocumentItem)
        .filter((item): item is LegalDocumentItem => item !== null);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load legal documents"),
      );
    }
  },
  getActiveDocuments: async () => {
    const documents = await organizationApi.getDocs();
    return documents.filter((document) => document.isActive !== false);
  },
};

export const citiesApi = {
  list: async () => {
    try {
      const response = await api.get<unknown>("/cities");
      return extractCollection(response.data)
        .map(normalizeReferenceItem)
        .filter((item): item is CityItem => item !== null);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load cities"));
    }
  },
};

export const referenceApi = {
  listDepartments: async () => {
    try {
      const data = await getWithFallback<unknown>(DEPARTMENTS_ENDPOINTS);
      return extractCollection(data)
        .map(normalizeReferenceItem)
        .filter((item): item is DepartmentItem => item !== null);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load departments"));
    }
  },
  createDepartment: async (payload: CreateDepartmentPayload) => {
    try {
      const response = await api.post<DepartmentItem>(
        "/organizations/departments",
        payload,
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create department"));
    }
  },
  deleteDepartment: async (id: string) => {
    try {
      await api.delete(`/organizations/departments/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete department"));
    }
  },
  listPositions: async () => {
    try {
      const data = await getWithFallback<unknown>(POSITIONS_ENDPOINTS);
      return extractCollection(data)
        .map(normalizeReferenceItem)
        .filter((item): item is PositionItem => item !== null);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load positions"));
    }
  },
  createPosition: async (payload: CreatePositionPayload) => {
    try {
      const response = await api.post<PositionItem>(
        "/organizations/positions",
        {
          positionName: payload.positionName,
          departmentId: payload.departmentId,
          department_id: payload.departmentId,
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create position"));
    }
  },
  deletePosition: async (id: string) => {
    try {
      await api.delete(`/organizations/positions/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete position"));
    }
  },
};

export const inviteApi = {
  generate: async (payload: GenerateInvitePayload) => {
    try {
      const response = await api.post<GenerateInviteResponse>(
        "/invites/generate",
        {
          ...payload,
          department_id: payload.departmentId,
          position_id: payload.positionId,
          salary_rate: payload.salaryRate,
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to generate invite"));
    }
  },
  verify: async (code: string) => {
    try {
      const response = await api.post<InviteVerificationResponse>(
        "/invites/verify",
        { code },
      );

      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to verify invite"));
    }
  },
  completeRegistration: async (
    payload: CompleteInviteRegistrationPayload,
  ) => {
    try {
      const response = await api.post<CompleteInviteRegistrationResponse>(
        "/invites/complete-registration",
        payload,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to complete registration"),
      );
    }
  },
};

export const notificationsApi = {
  list: async (params?: { unreadOnly?: boolean; limit?: number; offset?: number }) => {
    try {
      const response = await api.get<NotificationItem[]>("/notifications", {
        params: {
          unread_only: params?.unreadOnly,
          limit: params?.limit,
          offset: params?.offset,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load notifications"),
      );
    }
  },
  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to mark notification as read"),
      );
    }
  },
  markAllAsRead: async () => {
    try {
      const response = await api.patch<{ updated: number }>(
        "/notifications/read-all",
      );
      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to mark all notifications as read"),
      );
    }
  },
};

export const profileApi = {
  getMe: async () => {
    try {
      let response;

      try {
        response = await api.get<unknown>("/profile/me");
      } catch (error) {
        if (!isNotFoundError(error)) {
          throw error;
        }

        try {
          response = await api.get<unknown>("/employees/me");
        } catch (fallbackError) {
          if (!isNotFoundError(fallbackError)) {
            throw fallbackError;
          }

          response = await api.get<unknown>("/employees/current");
        }
      }

      return normalizeUserProfile(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load profile"));
    }
  },
};

export const employeesApi = {
  create: async (payload: CreateEmployeePayload) => {
    try {
      const response = await api.post<CreateEmployeeResponse>(
        "/employees",
        payload,
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create employee"));
    }
  },
  list: async () => {
    try {
      const response = await api.get<unknown>("/employees");
      return extractCollection(response.data)
        .map(normalizeEmployeeItem)
        .filter((item): item is EmployeeItem => item !== null);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load employees"));
    }
  },
  search: async (params: EmployeeSearchParams) => {
    try {
      const response = await api.get<unknown>("/employees/search", {
        params: {
          q: params.query,
          query: params.query,
          department_id: params.departmentId,
          departmentId: params.departmentId,
          position_id: params.positionId,
          positionId: params.positionId,
          status: params.status,
        },
      });
      return extractCollection(response.data)
        .map(normalizeEmployeeItem)
        .filter((item): item is EmployeeItem => item !== null);
    } catch (error) {
      if (isNotFoundError(error)) {
        return employeesApi.list();
      }

      throw new Error(getApiErrorMessage(error, "Failed to search employees"));
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get<unknown>(`/employees/${id}`);
      const employee = normalizeSingleEmployeeItem(response.data);

      if (!employee) {
        throw new Error("Server returned an invalid employee payload");
      }

      return employee;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load employee"));
    }
  },
  updateRole: async (id: string, payload: UpdateEmployeeRolePayload) => {
    try {
      await api.patch(`/employees/${id}/role`, payload);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update role"));
    }
  },
  updateSalary: async (id: string, payload: UpdateEmployeeSalaryPayload) => {
    try {
      await api.patch(`/employees/${id}/salary`, payload);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update salary"));
    }
  },
  updateStatus: async (id: string, payload: UpdateEmployeeStatusPayload) => {
    try {
      await api.patch(`/employees/${id}/status`, payload);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update status"));
    }
  },
  updateDepartment: async (
    id: string,
    payload: UpdateEmployeeDepartmentPayload,
  ) => {
    try {
      await api.patch(`/employees/${id}/department`, payload);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to update department"),
      );
    }
  },
  updatePosition: async (
    id: string,
    payload: UpdateEmployeePositionPayload,
  ) => {
    try {
      await api.patch(`/employees/${id}/position`, payload);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update position"));
    }
  },
  delete: async (id: string) => {
    try {
      await api.delete(`/employees/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete employee"));
    }
  },
};

export const payrollApi = {
  getCurrentCycle: async () => {
    try {
      const response = await api.get<unknown>("/payroll/cycles");
      const cycles = extractCollection(response.data)
        .map(normalizePayrollCycle)
        .filter((item): item is PayrollCycleItem => item !== null)
        .sort((a, b) => b.periodStart.localeCompare(a.periodStart));
      const currentMonth = new Date().toISOString().slice(0, 7);
      const current =
        cycles.find((c) => cycleMatchesMonth(c, currentMonth)) ?? cycles[0];
      if (!current) {
        throw new Error("No payroll cycles found");
      }
      return current;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load current payroll cycle"),
      );
    }
  },
  approveCycle: async (cycleId: string) => {
    try {
      const response = await api.patch<unknown>(
        `/payroll/cycles/${cycleId}/approve`,
      );
      return normalizeSinglePayrollCycle(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to approve cycle"));
    }
  },
  reopenCycle: async (cycleId: string) => {
    try {
      const response = await api.patch<unknown>(
        `/payroll/cycles/${cycleId}/reopen`,
      );
      return normalizeSinglePayrollCycle(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to reopen cycle"));
    }
  },
  list: async (params?: PayrollListParams) => {
    try {
      try {
        const cyclesResponse = await api.get<unknown>("/payroll/cycles");
        const cycle = extractCollection(cyclesResponse.data)
          .map(normalizePayrollCycle)
          .filter((item): item is PayrollCycleItem => item !== null)
          .find((item) => cycleMatchesMonth(item, params?.month));

        if (cycle) {
          const itemsResponse = await api.get<unknown>(
            `/payroll/cycles/${cycle.id}/items`,
          );
          const items: PayrollItem[] = [];

          for (const item of extractCollection(itemsResponse.data)) {
            const normalized = normalizePayrollItem(item);

            if (normalized) {
              items.push({
                ...normalized,
                cycleId: normalized.cycleId || cycle.id,
                month:
                  normalized.month ||
                  cycle.periodStart.slice(0, 7) ||
                  params?.month ||
                  "",
                payDate: normalized.payDate || cycle.periodEnd,
                status: normalized.status || cycle.status,
              });
            }
          }

          return items;
        }
      } catch (error) {
        if (!isNotFoundError(error)) {
          throw error;
        }
      }

      let lastError: AxiosError | Error | null = null;
      let data: unknown = [];

      for (const endpoint of PAYROLL_LIST_ENDPOINTS.filter(
        (endpoint) => endpoint !== "/payroll/cycles",
      )) {
        try {
          const response = await api.get<unknown>(endpoint, {
            params: {
              month: params?.month,
              period: params?.month,
            },
          });
          data = response.data;
          lastError = null;
          break;
        } catch (error) {
          lastError = error as AxiosError | Error;

          if (!isNotFoundError(error)) {
            break;
          }
        }
      }

      if (lastError) {
        throw lastError;
      }

      const items = extractCollection(data)
        .map(normalizePayrollItem)
        .filter((item): item is PayrollItem => item !== null);

      if (!params?.month) {
        return items;
      }

      return items.filter((item) => !item.month || item.month === params.month);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load payroll"));
    }
  },
  process: async (payload: ProcessPayrollPayload) => {
    try {
      const { periodStart, periodEnd } = getMonthPeriod(payload.month);

      try {
        const cyclesResponse = await api.get<unknown>("/payroll/cycles");
        const existingCycle = extractCollection(cyclesResponse.data)
          .map(normalizePayrollCycle)
          .filter((item): item is PayrollCycleItem => item !== null)
          .find((item) => cycleMatchesMonth(item, payload.month));
        const cycle =
          existingCycle ??
          normalizePayrollCycle(
            (
              await api.post<unknown>("/payroll/cycles", {
                period_start: periodStart,
                period_end: periodEnd,
                currency: "KZT",
              })
            ).data,
          );

        if (!cycle) {
          throw new Error("Server returned an invalid payroll cycle");
        }

        await api.patch(`/payroll/cycles/${cycle.id}/calculate`, {
          recalculate: true,
        });

        try {
          await api.post(`/payroll/cycles/${cycle.id}/payslips/generate`);
        } catch (error) {
          if (!isNotFoundError(error)) {
            throw error;
          }
        }

        return;
      } catch (error) {
        if (!isNotFoundError(error)) {
          throw error;
        }
      }

      await postWithFallback<unknown>(
        PAYROLL_PROCESS_ENDPOINTS,
        {
          month: payload.month,
          period: payload.month,
          period_start: periodStart,
          period_end: periodEnd,
        },
      );
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to process payroll"));
    }
  },
  sendPayslip: async (payrollId: string) => {
    const attempts = [
      async () => {
        const response = await api.post<PayslipItem | unknown>("/payslips", {
          payroll_item_id: payrollId,
        });
        const payslip = normalizePayslipItem(response.data);

        if (!payslip?.id) {
          throw new Error("Server returned an invalid payslip");
        }

        await api.post(`/payslips/${payslip.id}/send`);
      },
      () => api.post(`/payslips/${payrollId}/send`),
      () => api.post(`/payroll/${payrollId}/send-payslip`),
      () => api.post(`/payroll/payslips/${payrollId}/send`),
      () => api.patch(`/payroll/${payrollId}/send-payslip`),
      () => api.patch(`/payroll/payslips/${payrollId}/send`),
    ];
    let lastError: unknown = null;

    for (const attempt of attempts) {
      try {
        await attempt();
        return;
      } catch (error) {
        lastError = error;

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          continue;
        }

        break;
      }
    }

    throw new Error(getApiErrorMessage(lastError, "Failed to send payslip"));
  },
  listMyPayslips: async () => {
    for (const endpoint of PAYSLIPS_MY_ENDPOINTS) {
      try {
        const response = await api.get<unknown>(endpoint);
        return extractCollection(response.data)
          .map(normalizePayslipItem)
          .filter((item): item is PayslipItem => item !== null);
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          throw new Error(getApiErrorMessage(error, "Failed to load payslips"));
        }
        const status = error.response?.status;
        if (status === 401) {
          throw new Error(getApiErrorMessage(error, "Failed to load payslips"));
        }
        // For 404 (endpoint not found), 403 (forbidden), 500 (no employee record) — try next
      }
    }
    // All endpoints exhausted — employee has no payslips yet
    return [];
  },
};

export const attendanceApi = {
  list: async (params?: AttendanceListParams) => {
    try {
      const response = await api.get<unknown>("/attendance", {
        params: {
          start_date: params?.startDate,
          end_date: params?.endDate,
        },
      });
      return extractCollection(response.data)
        .map(normalizeAttendanceItem)
        .filter((item): item is AttendanceItem => item !== null);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load attendance"));
    }
  },
  listForEmployee: async (employeeId: string, params?: AttendanceListParams) => {
    const queryParams = {
      start_date: params?.startDate,
      end_date: params?.endDate,
    };

    // Try explicit employee endpoint first (works when userID = employeeID, e.g. admin)
    try {
      const response = await api.get<unknown>(`/attendance/employees/${employeeId}`, { params: queryParams });
      return extractCollection(response.data)
        .map(normalizeAttendanceItem)
        .filter((item): item is AttendanceItem => item !== null);
    } catch (error) {
      if (!isNotFoundError(error) && !isForbiddenError(error)) {
        throw new Error(getApiErrorMessage(error, "Failed to load attendance"));
      }
    }

    // Fallback: /attendance filters by JWT role — for employee role returns their own records
    try {
      const response = await api.get<unknown>("/attendance", { params: queryParams });
      return extractCollection(response.data)
        .map(normalizeAttendanceItem)
        .filter((item): item is AttendanceItem => item !== null);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load attendance"));
    }
  },
  checkIn: async (workType?: string) => {
    // POST /attendance/check-in uses JWT to resolve employee — no employee_id needed
    const body = workType ? { work_type: workType } : undefined;
    try {
      const response = await api.post<{ status?: string; check_in?: string }>(
        "/attendance/check-in",
        body,
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to check in"));
    }
  },
  checkOut: async () => {
    // POST /attendance/check-out uses JWT to resolve employee — no body needed
    try {
      const response = await api.post<{ check_out?: string }>("/attendance/check-out");
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to check out"));
    }
  },
  createSkudEvent: async (payload: CreateSkudEventPayload) => {
    // SKUD is for physical access control systems — requires actual employee record ID
    try {
      const response = await api.post<{ message?: string }>("/attendance/skud-events", {
        employee_id: payload.employeeId,
        event_type: payload.eventType,
        device_id: payload.deviceId,
        occurred_at: payload.occurredAt,
      });
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to register SKUD event"));
    }
  },
  listLeaveRequests: async () => {
    try {
      const response = await api.get<unknown>("/attendance/leave-requests");
      return extractCollection(response.data)
        .map(normalizeLeaveRequestItem)
        .filter((item): item is LeaveRequestItem => item !== null);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load leave requests"),
      );
    }
  },
  listMyLeaveRequests: async (_employeeId?: string) => {
    // Backend GET /attendance/leave-requests filters by role automatically:
    // - Employee role → returns only their own (via GetEmployeeIDByUserID from JWT)
    // - Admin/HR role → returns all org leave requests
    try {
      const response = await api.get<unknown>("/attendance/leave-requests");
      return extractCollection(response.data)
        .map(normalizeLeaveRequestItem)
        .filter((item): item is LeaveRequestItem => item !== null);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load leave requests"));
    }
  },
  createLeaveRequest: async (payload: CreateLeaveRequestPayload) => {
    try {
      const response = await api.post<{ leave_request_id?: string; leaveRequestId?: string }>(
        "/attendance/leave-requests",
        {
          employee_id: payload.employeeId,
          employeeId: payload.employeeId,
          type: payload.type,
          start_date: payload.startDate,
          startDate: payload.startDate,
          end_date: payload.endDate,
          endDate: payload.endDate,
          reason: payload.reason,
          document_url: payload.documentUrl,
          documentUrl: payload.documentUrl,
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to submit leave request"),
      );
    }
  },
  reviewLeaveRequest: async (
    id: string,
    action: "approve" | "reject",
  ): Promise<{ locallyResolved: boolean }> => {
    const status = action === "approve" ? "APPROVED" : "REJECTED";
    const titleStatus = action === "approve" ? "Approved" : "Rejected";
    const reviewUrl = `/attendance/leave-requests/${id}/review`;
    const attempts = [
      () => api.patch(reviewUrl, { action }),
      () => api.patch(reviewUrl, { action, status }),
      () => api.patch(reviewUrl, { status }),
      () => api.patch(reviewUrl, { status: titleStatus }),
      () => api.patch(reviewUrl, { decision: action }),
      () => api.patch(reviewUrl, { approved: action === "approve" }),
      () => api.patch(`/attendance/leave-requests/${id}/${action}`),
      () => api.post(`/attendance/leave-requests/${id}/${action}`),
    ];

    let lastError: unknown = null;

    for (const attempt of attempts) {
      try {
        await attempt();
        return { locallyResolved: false };
      } catch (error) {
        lastError = error;

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          continue;
        }
      }
    }

    if (
      axios.isAxiosError(lastError) &&
      lastError.response?.status &&
      lastError.response.status >= 500
    ) {
      return { locallyResolved: true };
    }

    throw new Error(
      getApiErrorMessage(lastError, "Failed to review leave request"),
    );
  },
  getMyWorkSchedule: async (employeeId: string) => {
    const endpoints = [
      "/attendance/work-schedules/my",
      "/attendance/work-schedules/me",
      `/attendance/work-schedules/${employeeId}`,
    ];

    let lastError: unknown = null;
    for (const endpoint of endpoints) {
      try {
        const response = await api.get<unknown>(endpoint);
        return normalizeWorkScheduleItem(response.data);
      } catch (error) {
        lastError = error;
        // try all endpoints regardless of error type
      }
    }
    throw new Error(
      getApiErrorMessage(lastError, "Failed to load work schedule"),
    );
  },
  getWorkSchedule: async (employeeId: string) => {
    try {
      const response = await api.get<unknown>(
        `/attendance/work-schedules/${employeeId}`,
      );
      return normalizeWorkScheduleItem(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load work schedule"));
    }
  },
  setWorkSchedule: async (payload: SetWorkSchedulePayload) => {
    const body = {
      employee_id: payload.employeeId,
      employeeId: payload.employeeId,
      work_start: payload.workStart,
      workStart: payload.workStart,
      work_end: payload.workEnd,
      workEnd: payload.workEnd,
      late_threshold_minutes: payload.lateThresholdMinutes,
      lateThresholdMinutes: payload.lateThresholdMinutes,
    };

    try {
      try {
        await api.post("/attendance/work-schedules", body);
        return;
      } catch (postError) {
        if (!isNotFoundError(postError)) {
          throw postError;
        }
      }

      try {
        await api.put(`/attendance/work-schedules/${payload.employeeId}`, body);
        return;
      } catch (putError) {
        if (!isNotFoundError(putError)) {
          throw putError;
        }
      }

      await api.patch(`/attendance/work-schedules/${payload.employeeId}`, body);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to save work schedule"));
    }
  },
};

export const calendarApi = {
  getSummary: async (month?: string) => {
    try {
      const response = await api.get<unknown>("/calendar/summary", {
        params: { month },
      });
      return normalizeCalendarSummary(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load calendar"));
    }
  },
  addDay: async (payload: AddCalendarDayPayload) => {
    try {
      const response = await api.post<{ id: string }>("/calendar", payload);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to save calendar day"));
    }
  },
  deleteDay: async (id: string) => {
    try {
      await api.delete(`/calendar/${id}`);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to delete calendar day"),
      );
    }
  },
};

export const reportsApi = {
  getDashboard: async () => {
    try {
      const response = await api.get<unknown>("/reports/dashboard");
      return normalizeDashboardReport(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load dashboard"));
    }
  },
  getAttendanceToday: async (date?: string) => {
    try {
      const response = await api.get<unknown>("/reports/attendance/today", {
        params: { date },
      });
      return normalizeAttendanceTodayReport(response.data);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load attendance report"),
      );
    }
  },
  getAttendanceWeekly: async (weekStart?: string) => {
    try {
      const response = await api.get<unknown>("/reports/attendance/weekly", {
        params: { week_start: weekStart },
      });
      return normalizeChartResponse(response.data);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load weekly attendance"),
      );
    }
  },
  getEmployeeStatistics: async () => {
    try {
      const response = await api.get<unknown>("/reports/employees/statistics");
      return normalizeEmployeeStatisticsReport(response.data);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load employee statistics"),
      );
    }
  },
  getDepartmentStatistics: async () => {
    try {
      const response = await api.get<unknown>("/reports/departments/statistics");
      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load department statistics"),
      );
    }
  },
  getPayrollSummary: async (params?: {
    periodStart?: string;
    periodEnd?: string;
  }) => {
    try {
      const response = await api.get<unknown>("/reports/payroll", {
        params: {
          period_start: params?.periodStart,
          period_end: params?.periodEnd,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load payroll report"),
      );
    }
  },
  getDepartmentPayroll: async (params?: {
    periodStart?: string;
    periodEnd?: string;
  }) => {
    try {
      const response = await api.get<unknown>("/reports/payroll/departments", {
        params: {
          period_start: params?.periodStart,
          period_end: params?.periodEnd,
        },
      });
      return normalizeDepartmentPayrollReport(response.data);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load department payroll"),
      );
    }
  },
  getPayrollTrends: async (params?: {
    periodStart?: string;
    periodEnd?: string;
  }) => {
    try {
      const response = await api.get<unknown>("/reports/payroll/trends", {
        params: {
          period_start: params?.periodStart,
          period_end: params?.periodEnd,
        },
      });
      return normalizeChartResponse(response.data);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load payroll trends"),
      );
    }
  },
  getCsvExportUrl: () => `${API_URL}/reports/export/csv`,
  getPdfExportUrl: () => `${API_URL}/reports/export/pdf`,
  downloadExport: async (format: "csv" | "pdf") => {
    try {
      const response = await api.get<Blob>(`/reports/export/${format}`, {
        responseType: "blob",
      });
      const contentDisposition = response.headers["content-disposition"];
      const filenameMatch =
        typeof contentDisposition === "string"
          ? contentDisposition.match(/filename="?([^"]+)"?/i)
          : null;

      return {
        blob: response.data,
        filename: filenameMatch?.[1] || `hrms-report.${format}`,
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, `Failed to export ${format.toUpperCase()}`),
      );
    }
  },
};

export const eventsApi = {
  getUpcoming: async () => {
    try {
      const response = await api.get<EventItem[]>("/events/upcoming");
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        return [];
      }

      throw new Error(getApiErrorMessage(error, "Failed to load events"));
    }
  },
  getMy: async () => {
    try {
      const response = await api.get<EventItem[]>("/events/my");
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        return [];
      }

      throw new Error(getApiErrorMessage(error, "Failed to load my events"));
    }
  },
  create: async (payload: CreateEventPayload) => {
    try {
      const response = await api.post<EventItem>("/events", payload);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create event"));
    }
  },
  update: async (id: string, payload: UpdateEventPayload) => {
    try {
      const response = await api.patch<EventItem>(`/events/${id}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update event"));
    }
  },
  delete: async (id: string) => {
    try {
      await api.delete(`/events/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete event"));
    }
  },
};

export {
  API_URL,
  AUTH_CHANGE_EVENT,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
};
