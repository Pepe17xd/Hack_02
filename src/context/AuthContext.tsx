import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../types";
import { login as loginRequest, me } from "../services/authService";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (teamCode: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function restoreSession() {
      const token = localStorage.getItem("tropelcare_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await me();
        if (alive) setUser(currentUser);
      } catch {
        localStorage.removeItem("tropelcare_token");
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    }
    void restoreSession();
    return () => { alive = false; };
  }, []);

  async function login(teamCode: string, email: string, password: string) {
    const response = await loginRequest(teamCode, email, password);
    localStorage.setItem("tropelcare_token", response.token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem("tropelcare_token");
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(() => ({ user, loading, isAuthenticated: Boolean(user), login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
