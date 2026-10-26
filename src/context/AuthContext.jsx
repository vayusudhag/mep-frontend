import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logoutAPI } from "../services/auth";

const AuthContext = createContext(null);
const shouldLogAuthDebug =
  import.meta.env.PROD || import.meta.env.VITE_AUTH_DEBUG === "true";
const logAuthDebug = (...args) => {
  if (!shouldLogAuthDebug) return;
  console.info("[AUTH_DEBUG]", ...args);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    logAuthDebug("initAuth:start", {
      at: new Date().toISOString(),
    });

    try {
      const data = await getMe();
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        logAuthDebug("initAuth:success", {
          userId: data.user?._id || data.user?.id,
          role: data.user?.role,
        });
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        logAuthDebug("initAuth:no-user");
        return false;
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      logAuthDebug("initAuth:error", {
        message: err?.message,
        status: err?.response?.status,
        code: err?.response?.data?.code,
      });
      console.error("Auth init failed:", err);
      return false;
    } finally {
      setLoading(false);
      logAuthDebug("initAuth:end");
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener("auth-logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLogin: isAuthenticated,
        isAuthenticated,
        loading,
        initAuth,
        setUser,
        setIsAuthenticated,
        logout: async () => {
          try {
            await logoutAPI();
          } finally {
            setUser(null);
            setIsAuthenticated(false);
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
