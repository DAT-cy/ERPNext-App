import { useCallback, useState } from "react";
import type { LoginPayload, LoginResult } from "../model/auth.types";
import { login as loginApi } from "../api/auth.api";

/**
 * Hook đơn giản để gọi login + quản lý loading/error cục bộ.
 * (Nếu bạn đã có AuthProvider toàn cục, có thể gọi context.login thay cho loginApi)
 */
export function useLogin(opts?: {
  onSuccess?: (res: LoginResult) => void;
  onError?: (err: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const doLogin = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi(payload, { fetchUser: true });
      opts?.onSuccess?.(res);
      return res;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra kết nối & thông tin.";
      setError(msg);
      opts?.onError?.(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [opts]);

  return { doLogin, loading, error, setError };
}
