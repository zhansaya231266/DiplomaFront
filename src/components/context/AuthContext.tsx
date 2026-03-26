import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  const hydrationRequestId = useRef(0);

  useEffect(() => {
    const syncAuthState = async () => {
      const token = getStoredToken();
      const storedUser = getStoredUser();
      const requestId = ++hydrationRequestId.current;

      if (!token || !storedUser) {
        setUserState(null);
        setIsLoading(false);
        return;
      }

      setUserState(storedUser);
      setIsLoading(true);

      try {
        const profile = await profileApi.getMe();
        const nextUser: User = {
          ...storedUser,
          ...profile,
        };

        if (hydrationRequestId.current !== requestId) {
          return;
        }

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        setUserState(nextUser);
      } catch {
        if (hydrationRequestId.current !== requestId) {
          return;
        }

        setUserState(storedUser);
      } finally {
        if (hydrationRequestId.current === requestId) {
          setIsLoading(false);
        }
      }
    };

    void syncAuthState();
    const handleAuthChange = () => {
      void syncAuthState();
    };
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
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
