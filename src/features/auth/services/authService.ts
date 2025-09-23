// src/features/auth/services/auth.service.ts
import { loginERP, logoutERP, getLoggedUser, pingERP } from "../../../api/erp.api";
import type { LoginPayload, LoginResult, LoggedUser } from "../model/auth.types";

export async function login(
  payload: LoginPayload,
  opts?: { fetchUser?: boolean }
): Promise<LoginResult> {
  const base = await loginERP(payload.usr, payload.pwd); // LoginResult
  if (!base.ok) return base;                // thất bại -> trả về ngay
  if (opts?.fetchUser === false) return base;

  try {
    const me = await getLoggedUser();
    return { ...base, me };                 // base là LoginOk -> hợp lệ với LoginResult
  } catch {
    return base;
  }
}

export async function logout(): Promise<void> {
  await logoutERP();
}

export async function getCurrentUser(): Promise<LoggedUser> {
  return getLoggedUser();
}

export async function ping(): Promise<{ message: string }> {
  return pingERP();
}
