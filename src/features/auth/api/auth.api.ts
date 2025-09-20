
import { loginERP, logoutERP, getLoggedUser, pingERP } from "../../../api/erp.api";
import type { LoginPayload, LoginResult, LoggedUser } from "../model/auth.types";

/**
 * Đăng nhập ERPNext (sẽ auto lưu SID ở SecureStore trong loginERP)
 * @returns { ok, sid, data, me? }
 */
export async function login(payload: LoginPayload, opts?: { fetchUser?: boolean }): Promise<LoginResult> {
  const base = await loginERP(payload.usr, payload.pwd); // { ok, sid, data }
  if (opts?.fetchUser === false) return { ...base };

  try {
    const me = await getLoggedUser(); // { message: "Administrator" }
    return { ...base, me };
  } catch {
    return { ...base };
  }
}

/** Đăng xuất và xoá SID */
export async function logout(): Promise<void> {
  await logoutERP();
}

/** Lấy user hiện tại theo session */
export async function getCurrentUser(): Promise<LoggedUser> {
  return getLoggedUser();
}

/** Kiểm tra server sống */
export async function ping(): Promise<{ message: string }> {
  return pingERP();
}
