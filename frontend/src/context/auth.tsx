import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { configureAuth } from "@/lib/http";
import { storage } from "@/lib/storage";
import { authApi } from "@/services/api";
import type { Role, User } from "@/types";

interface Session {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; password: string; role: Role }) => Promise<User>;
  logout: () => void;
}

const KEY = "clickstar.session";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(() => storage.get<Session>(KEY));

  const save = useCallback((s: Session | null) => {
    setSession(s);
    if (s) storage.set(KEY, s);
    else storage.remove(KEY);
  }, []);

  const logout = useCallback(() => {
    save(null);
    qc.clear();
  }, [save, qc]);

  // Keep the HTTP layer in sync with the current session.
  useEffect(() => {
    configureAuth({ getToken: () => session?.token ?? null, onUnauthorized: logout });
  }, [session, logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      save(res);
      return res.user;
    },
    [save],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string; role: Role }) => {
      const res = await authApi.register(input);
      save(res);
      return res.user;
    },
    [save],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user: session?.user ?? null, token: session?.token ?? null, isAuthenticated: !!session, login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export const dashboardPath = (role?: Role) => (role ? `/dashboard` : "/login");
