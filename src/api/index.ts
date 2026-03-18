import axios, { AxiosError } from "axios";

const DEFAULT_API_URL = "http://localhost:8080/v1";
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
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
  expiresAt: string;
  message: string;
}

export interface CompleteInviteRegistrationPayload {
  code: string;
  password: string;
  phoneNumber: string;
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
    return fallback;
  }

  const responseData = error.response?.data;

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
  getDocs: () => api.get("/legal/documents"),
  getActiveDocuments: () => api.get("/legal/documents"),
};

export const inviteApi = {
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

export {
  API_URL,
  AUTH_CHANGE_EVENT,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
};
