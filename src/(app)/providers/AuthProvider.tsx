// src/(app)/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { SID_KEY, getLoggedUser, loginERP, logoutERP, pingERP } from "../../api/erp.api";
import type { LoginResult } from "../../features/auth/model/auth.types";

type AuthContextType = {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: string | null;
  login: (usr: string, pwd: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // 1) PING để xác minh server
      try {
        const pong = await pingERP();
        console.log("PING:", pong); // { message: "pong" }
      } catch (e: any) {
        console.log("PING lỗi:", e?.message);
        // Không return; vẫn cho phép vào màn Login
      }

      // 2) Auto login nếu có SID
      const sid = await SecureStore.getItemAsync(SID_KEY);
      if (sid) {
        try {
          const me = await getLoggedUser();
          setUser(me?.message ?? null);
          setLoggedIn(true);
        } catch {
          // SID cũ không còn hợp lệ
          await SecureStore.deleteItemAsync(SID_KEY).catch(() => {});
          setLoggedIn(false);
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (usr: string, pwd: string): Promise<LoginResult> => {
    let loginResult: LoginResult;
    try {
      loginResult = await loginERP(usr, pwd);
    } catch (e) {
      // Trường hợp lỗi không mong muốn
      return { ok: false, error: "UNKNOWN", raw: e } as LoginResult;
    }

    if (!loginResult.ok) {
      // Đăng nhập thất bại: KHÔNG reset user/isLoggedIn, KHÔNG reload, không set loading
      return loginResult;
    }

    // Chỉ set loading khi đăng nhập thành công và cần chuyển trang
    setLoading(true);
    setLoggedIn(true);
    try {
      const me = await getLoggedUser();
      setUser(me?.message || null);
      return { ...loginResult, me };
    } catch {
      return loginResult;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutERP();
      await SecureStore.deleteItemAsync(SID_KEY).catch(() => {});
      setUser(null);
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};

