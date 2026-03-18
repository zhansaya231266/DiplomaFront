import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AUTH_CHANGE_EVENT,
  clearStoredAuth,
  getStoredUser,
  getStoredToken,
  profileApi,
  USER_STORAGE_KEY,
  type User,
} from "../../api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncAuthState = () => {
      setUserState(getStoredUser());
      setIsLoading(false);
    };

    syncAuthState();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, []);

  useEffect(() => {
    const hydrateProfile = async () => {
      const token = getStoredToken();
      const storedUser = getStoredUser();

      if (!token || !storedUser) {
        return;
      }

      if (storedUser.role && (storedUser.role !== "Admin" || storedUser.departmentId)) {
        return;
      }

      try {
        const profile = await profileApi.getMe();
        const nextUser: User = {
          ...storedUser,
          firstname: profile.firstname,
          lastname: profile.lastname,
          email: profile.email,
          role: profile.role,
          fullName: profile.fullName,
          phone: profile.phone,
          phoneNumber: profile.phoneNumber,
          verificationStatus: profile.verificationStatus,
          joinedDate: profile.joinedDate,
          department: profile.department,
          departmentId: profile.departmentId,
          position: profile.position,
          salary: profile.salary,
          location: profile.location,
          organizationId: profile.organizationId,
          organizationName: profile.organizationName,
        };

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        setUserState(nextUser);
      } catch {
        // Keep existing auth state; component-level pages can still handle profile errors.
      }
    };

    void hydrateProfile();
  }, []);

  const setUser = useCallback((nextUser: User | null) => {
    setUserState(nextUser);

    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user) && Boolean(getStoredToken()),
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
