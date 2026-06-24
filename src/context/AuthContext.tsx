"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login(credentials: { username: string; password: string }): Promise<void>;
  register(credentials: { username: string; password: string }): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { user: current } = await api.me();
          setUser(current);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext checkUser error details:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          const { user: current } = await api.me();
          setUser(current);
        } catch (error) {
          console.error("AuthContext onAuthStateChange api.me error details:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.username,
      password: credentials.password,
    });
    if (error) throw error;
  }, []);

  const register = useCallback(async (credentials: { username: string; password: string }) => {
    const { error } = await supabase.auth.signUp({
      email: credentials.username,
      password: credentials.password,
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
