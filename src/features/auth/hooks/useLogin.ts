// src/features/auth/hooks/useLogin.ts
import { useCallback, useState } from "react";
import { useAuth } from "../../../(app)/providers"; // bọc provider bên dưới

export function useLogin(opts?: { onSuccess?: (res: any)=>void; onError?: (e:any)=>void }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const doLogin = useCallback(async (usr: string, pwd: string) => {
    setLoading(true); setError(null);
    try {
      const res = await login(usr, pwd);  // dùng context để đảm bảo state app cập nhật
      opts?.onSuccess?.(res);
      return res;
    } catch (e:any) {
      const msg = e?.response?.data?.message || e?.message || "Đăng nhập thất bại";
      setError(msg);
      opts?.onError?.(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [login, opts]);

  return { doLogin, loading, error, setError };
}
