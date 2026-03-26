import axios, { AxiosError } from "axios";

const DEFAULT_API_URL = "http://localhost:8080/v1";
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const parseEndpointList = (value: string | undefined, fallback: string[]) => {
  if (!value?.trim()) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const DEPARTMENTS_ENDPOINTS = parseEndpointList(
  import.meta.env.VITE_DEPARTMENTS_ENDPOINTS as string | undefined,
  [
    "/departments",
    "/reference/departments",
    "/references/departments",
    "/lookup/departments",
  ],
);

const POSITIONS_ENDPOINTS = parseEndpointList(
  import.meta.env.VITE_POSITIONS_ENDPOINTS as string | undefined,
  [
    "/positions",
    "/reference/positions",
    "/references/positions",
    "/lookup/positions",
  ],
);

const TOKEN_STORAGE_KEY = "token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
const USER_STORAGE_KEY = "user";
const AUTH_CHANGE_EVENT = "auth:changed";

export interface User {
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
  role?: string;
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

export interface GenerateInvitePayload {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string;
  positionId?: string;
  position?: string;
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
): { id: string; name: string } | null => {
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

export const normalizeUserProfile = (payload: unknown): UserProfileResponse => {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

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
  ]);
  const position = getStringValue(record, [
    "position",
    "positionName",
    "position_name",
    "jobTitle",
    "job_title",
  ]);
  const phone = getStringValue(record, ["phone", "phoneNumber", "phone_number"]);
  const fullName =
    getStringValue(record, ["fullName", "full_name", "name"]) ||
    [firstname, lastname].filter(Boolean).join(" ").trim();

  return {
    id: getStringValue(record, ["id", "userId", "user_id"]),
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
});

const refreshClient = axios.create({
  baseURL: API_URL,
});

let refreshPromise: Promise<string | null> | null = null;

const setStoredToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const setStoredRefreshToken = (refreshToken: string) => {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    clearStoredAuth();
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
    }

    if (error.response?.status === 401) {
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
    role: payload?.role || tokenClaims?.role || tokenClaims?.["custom:role"],
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

  const userPayload = response.user || response.data?.user;
  const tokenClaims = parseJwtClaims(idToken);

  return {
    token,
    user: buildUserFromPayload(userPayload, email, tokenClaims),
    refreshToken,
  };
};

const isNotFoundError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

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
  getDocs: () => api.get<LegalDocumentItem[]>("/legal/documents"),
  getActiveDocuments: () => api.get<LegalDocumentItem[]>("/legal/documents"),
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
};

export const inviteApi = {
  generate: async (payload: GenerateInvitePayload) => {
    try {
      const response = await api.post<GenerateInviteResponse>(
        "/invites/generate",
        payload,
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
      const response = await api.post(
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
      const response = await api.get<unknown>("/profile/me");
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
      const response = await api.get<EmployeeItem[]>("/employees");
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load employees"));
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get<EmployeeItem>(`/employees/${id}`);
      return response.data;
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

export const eventsApi = {
  getUpcoming: async () => {
    try {
      const response = await api.get<EventItem[]>("/events/upcoming");
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load events"));
    }
  },
  getMy: async () => {
    try {
      const response = await api.get<EventItem[]>("/events/my");
      return response.data;
    } catch (error) {
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
