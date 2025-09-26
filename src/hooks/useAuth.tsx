// hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { SID_KEY} from "../config/api";
import {getLoggedUser, loginERP, logoutERP , pingERP, getRolesUsers, getCurrentUserRoles } from "../services/authService";

import type { LoginResult } from "../types/auth.types";

type AuthContextType = {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: string | null;
  roles: string[];
  login: (usr: string, pwd: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  ping: () => Promise<{ message: string }>;
  getRoleUsers: () => Promise<any>;
  hasRole: (roleName: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

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
          const userName = me?.message ?? null;
          setUser(userName);
          setLoggedIn(true);
          
          // Load roles cho user
          if (userName) {
            try {
              const rolesData = await getCurrentUserRoles();
              const userRoles = rolesData?.message || [];
              setRoles(userRoles);
              console.log(`🔐 Loaded roles for ${userName}:`, userRoles);
            } catch (e) {
              console.log('Lỗi load roles:', e);
              setRoles([]);
            }
          }
        } catch {
          // SID cũ không còn hợp lệ
          await SecureStore.deleteItemAsync(SID_KEY).catch(() => {});
          setLoggedIn(false);
          setUser(null);
          setRoles([]);
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
      const userName = me?.message || null;
      setUser(userName);
      
      // Load roles cho user
      if (userName) {
        try {
          const rolesData = await getCurrentUserRoles();
          const userRoles = rolesData?.message || [];
          setRoles(userRoles);
          console.log(`🔐 Loaded roles for ${userName}:`, userRoles);
        } catch (e) {
          console.log('Lỗi load roles:', e);
          setRoles([]);
        }
      }
      
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
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const ping = async () => {
    return await pingERP();
  };

  const getRoleUsers = async () => {
    if (!user) return { message: [] };
    return await getCurrentUserRoles();
  };

  const hasRole = (roleName: string): boolean => {
    return roles.includes(roleName);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, user, roles, login, logout, ping, getRoleUsers, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};

