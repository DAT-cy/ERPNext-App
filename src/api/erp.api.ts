
// src/api/erp.api.ts
import axios, { AxiosInstance, AxiosHeaders } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@env";
import {
  LoggedUser,
  LoginOk,
  LoginFail,
  LoginResult,
} from "../features/auth/model/auth.types"; // <-- dùng lại type chung

export const SID_KEY = "erpnext_sid";

const BASE_URL = API_URL;
// Debug: Log BASE_URL when this module is loaded
console.log('[DEBUG] ERP API BASE_URL:', BASE_URL);

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ""),
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const sid = await SecureStore.getItemAsync(SID_KEY);
  if (!config.headers) config.headers = new AxiosHeaders();
  else if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = AxiosHeaders.from(config.headers);
  }
  const h = config.headers as AxiosHeaders;
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  if (sid) h.set("Cookie", `sid=${sid}`);
  return config;
});

function extractSidFromSetCookie(setCookie?: string | string[]): string | null {
  if (!setCookie) return null;
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const line of arr) {
    const m = String(line).match(/(?:^|;\s*)sid=([^;]+)/i);
    if (m?.[1]) return m[1];
  }
  return null;
}

export async function pingERP(): Promise<{ message: string }> {
  const { data } = await api.get("/api/method/ping");
  return data;
}

export async function getLoggedUser(): Promise<LoggedUser> {
  const { data } = await api.get("/api/method/frappe.auth.get_logged_user");
  // Đảm bảo đúng shape: { message: string }
  if (!data || typeof data.message !== "string") {
    throw new Error("Invalid get_logged_user response");
  }
  return data as LoggedUser;
}

export async function loginERP(usr: string, pwd: string): Promise<LoginResult> {
  try {
    const resp = await api.post("/api/method/login", { usr, pwd });

    const setCookie =
      (resp.headers as any)?.["set-cookie"] ||
      (resp.headers as any)?.["Set-Cookie"] ||
      (resp.headers as any)?.map?.["set-cookie"];
    const sid = extractSidFromSetCookie(setCookie);
    if (sid) {
      try { await SecureStore.setItemAsync(SID_KEY, sid); } catch {}
    }

    // Xác minh phiên bằng get_logged_user
    try {
      const me = await getLoggedUser(); // LoggedUser với message: string
      const ok: LoginOk = { ok: true, sid: sid ?? undefined, data: resp.data, me };
      console.log(ok)
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

export async function logoutERP(): Promise<void> {
  try { await api.post("/api/method/logout"); } catch {}
  await SecureStore.deleteItemAsync(SID_KEY);
}

export async function getSid(): Promise<string | null> {
  return SecureStore.getItemAsync(SID_KEY);
}

export async function hasSid(): Promise<boolean> {
  const sid = await SecureStore.getItemAsync(SID_KEY);
  return !!sid;
}

