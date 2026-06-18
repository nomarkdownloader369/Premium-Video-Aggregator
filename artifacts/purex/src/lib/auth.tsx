import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

const TOKEN_KEY = "purex_token";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (t: string) => {
    try {
      const r = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (!r.ok) throw new Error("auth failed");
      const u = await r.json() as AuthUser;
      setUser(u);
    } catch {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchMe(token);
    else setLoading(false);
  }, [token, fetchMe]);

  const login = async (email: string, password: string) => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error || "Login failed"); }
    const { token: t, user: u } = await r.json() as { token: string; user: AuthUser };
    setToken(t);
    setUser(u);
    localStorage.setItem(TOKEN_KEY, t);
  };

  const register = async (email: string, password: string) => {
    const r = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error || "Registration failed"); }
    const { token: t, user: u } = await r.json() as { token: string; user: AuthUser };
    setToken(t);
    setUser(u);
    localStorage.setItem(TOKEN_KEY, t);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <Ctx.Provider value={{ user, token, login, register, logout, isAdmin: user?.role === "admin", loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
