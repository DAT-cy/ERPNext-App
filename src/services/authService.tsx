// services/authService.tsx
import { api, SID_KEY } from "../config/api";
import * as SecureStore from "expo-secure-store";
import { LoggedUser, LoginOk, LoginFail, LoginResult } from "../types/auth.types";

// Hỗ trợ lấy SID từ cookie
function extractSidFromSetCookie(setCookie?: string | string[]): string | null {
  if (!setCookie) return null;
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const line of arr) {
    const m = String(line).match(/(?:^|;\s*)sid=([^;]+)/i);
    if (m?.[1]) return m[1];
  }
  return null;
}

// Hàm lấy thông tin người dùng đã đăng nhập
export async function getLoggedUser(): Promise<LoggedUser> {
  const { data } = await api.get("/api/method/frappe.auth.get_logged_user");
  if (!data || typeof data.message !== "string") {
    throw new Error("Invalid get_logged_user response");
  }
  return data as LoggedUser;
}


// Hàm đăng nhập vào ERP
export async function loginERP(usr: string, pwd: string): Promise<LoginResult> {
  try {
    const resp = await api.post("/api/method/login", { usr, pwd });

    const setCookie =
      (resp.headers as any)?.["set-cookie"] ||
      (resp.headers as any)?.["Set-Cookie"] ||
      (resp.headers as any)?.map?.["set-cookie"];
    const sid = extractSidFromSetCookie(setCookie);
    if (sid) {
      try { await SecureStore.setItemAsync(SID_KEY, sid); } catch {} // Lưu SID
    }

    // Xác minh phiên người dùng
    try {
      const me = await getLoggedUser();

      const ok: LoginOk = { ok: true, sid: sid ?? undefined, data: resp.data, me  };
      console.log(ok);
      return ok;
    } catch (verr: any) {
      const fail: LoginFail = {
        ok: false,
        error: "INVALID_CREDENTIALS",
        status: verr?.response?.status,
        raw: verr?.response?.data ?? verr,
      };
      return fail;
    }
  } catch (e: any) {
    const status = e?.response?.status;
    if (e?.code === "ECONNABORTED" || /timeout/i.test(e?.message || "")) {
      return { ok: false, error: "NETWORK_TIMEOUT", raw: e };
    }
    if (status === 401) return { ok: false, error: "SESSION_EXPIRED", status, raw: e?.response?.data };
    if (status === 403) return { ok: false, error: "FORBIDDEN", status, raw: e?.response?.data };
    return { ok: false, error: "UNKNOWN", status, raw: e?.response?.data ?? e };
  }
}

// Hàm đăng xuất khỏi ERP
export async function logoutERP(): Promise<void> {
  try { await api.post("/api/method/logout"); } catch {}
  await SecureStore.deleteItemAsync(SID_KEY); // Xóa SID
}

// Hàm kiểm tra SID có tồn tại không
export async function getSid(): Promise<string | null> {
  return SecureStore.getItemAsync(SID_KEY);
}

// Hàm kiểm tra xem người dùng đã đăng nhập chưa
export async function hasSid(): Promise<boolean> {
  const sid = await SecureStore.getItemAsync(SID_KEY);
  return !!sid;
}

export async function pingERP(): Promise<{ message: string }> {
  const { data } = await api.get("/api/method/ping");
  return data;
}

