import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./authContextValue";
import {
  AUTH_CHANGE_EVENT,
  authApi,
  clearStoredAuth,
  getStoredUser,
  getStoredToken,
  profileApi,
  USER_STORAGE_KEY,
  type User,
} from "../../api";

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
          role: profile.role || storedUser.role,
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
    void authApi.logout();
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
