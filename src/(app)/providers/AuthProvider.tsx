import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { SID_KEY, getLoggedUser, loginERP, logoutERP, pingERP } from "../../api/erp.api"; // <-- THÊM pingERP

// ...
type AuthContextType = {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: string | null;
  login: (usr: string, pwd: string) => Promise<any>; 
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // ---- GỌI PING TRƯỚC ĐỂ KIỂM TRA KẾT NỐI ----
      try {
        const pong = await pingERP();
        console.log("PING:", pong); // mong đợi { message: "pong" }
      } catch (e: any) {
        console.log("PING lỗi:", e?.message);
        // Có thể setLoading(false) và return nếu muốn dừng tại đây
        // setLoading(false); return;
      }
      // ---- SAU ĐÓ MỚI KIỂM TRA SID ----
      const sid = await SecureStore.getItemAsync(SID_KEY);
      if (sid) {
        try {
          const me = await getLoggedUser();
          setUser(me?.message ?? null);
          setLoggedIn(true);
        } catch {
          setLoggedIn(false);
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

const login = async (usr: string, pwd: string) => {
  setLoading(true);
  try {
    const result = await loginERP(usr, pwd); // { ok, sid, loginData }
    setLoggedIn(true);

    // (tuỳ chọn) lấy user hiện tại
    try {
      const me = await getLoggedUser(); // { message: "Administrator" }
      setUser(me?.message || null);
      return { ...result, me };
    } catch {
      return result;
    }
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    setLoading(true);
    try {
      await logoutERP();
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
