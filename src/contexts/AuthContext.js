import { createContext, useContext, useEffect, useState } from "react";
import { api, formatApiError } from "../lib/api";

const AuthContext = createContext(null);

function normalizeUserPayload(data) {
  const candidate = data?.user ?? data?.data ?? data;
  if (candidate && typeof candidate === "object" && candidate.email) {
    return candidate;
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = none, object = signed in
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      try {
        // Silently probe for an admin session; 401 is expected for visitors.
        const { status, data } = await api.get("/auth/me", {
          validateStatus: (s) => s < 500,
        });
        if (!mounted) return;
        setUser(status === 200 ? normalizeUserPayload(data) || false : false);
      } catch (_) {
        if (mounted) setUser(false);
      }
    }

    loadCurrentUser();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const nextUser = normalizeUserPayload(data);
      if (nextUser) {
        setUser(nextUser);
        return true;
      }

      const me = await api.get("/auth/me");
      const refreshedUser = normalizeUserPayload(me.data);
      if (refreshedUser) {
        setUser(refreshedUser);
        return true;
      }

      setError("Login succeeded, but the session could not be loaded.");
      setUser(false);
      return false;
    } catch (e) {
      setError(formatApiError(e));
      return false;
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
