// src/features/auth/hooks/useLogin.ts
import { useState, useCallback } from "react";
import { login } from "../services/authService";
import type { LoginResult } from "../model/auth.types";

export function useLogin(opts?: { onSuccess?: (res: LoginResult) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const doLogin = useCallback(async (usr: string, pwd: string) => {
    setLoading(true); setError(null);
    try {
      const res = await login({ usr, pwd });
      if (res.ok) {
        opts?.onSuccess?.(res);
      } else {
        // Map lỗi thành thông báo UI
        setError(
          res.error === "INVALID_CREDENTIALS"
            ? "Hãy kiểm tra lại tài khoản hoặc mật khẩu của bạn"
            : res.error === "NETWORK_TIMEOUT"
            ? "Không kết nối được máy chủ. Kiểm tra IP/Port/Firewall."
            : "Đăng nhập thất bại. Vui lòng thử lại."
        );
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, [opts]);

  return { doLogin, loading, error, setError };
}
