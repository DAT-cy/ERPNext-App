// src/api/erpClient.ts
import axios, { AxiosHeaders, AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { API_URL } from '@env'; // <--- import trực tiếp từ .env


const BASE_URL = API_URL; 
export const SID_KEY = "erpnext_sid";

/* ============== Types ============== */
export type LoginResult = {
  ok: true;
  sid: string;
  data: any; // JSON ERPNext trả về: { message, home_page, full_name, ... }
};

export type LoggedUser = { message: string }; // ví dụ: { message: "Administrator" }

/* ============== Axios instance ============== */
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ""),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const sid = await SecureStore.getItemAsync(SID_KEY);

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  } else if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = AxiosHeaders.from(config.headers);
  }

  const h = config.headers as AxiosHeaders;
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  if (sid) h.set("Cookie", `sid=${sid}`);

  return config;
});

/* ============== Helpers ============== */
function extractSidFromSetCookie(setCookie?: string | string[]): string | null {
  if (!setCookie) return null;
  const raw = Array.isArray(setCookie) ? setCookie.join(";") : setCookie;
  const m = raw.match(/(?:^|;\s*)sid=([^;]+)/i);
  return m ? m[1] : null;
}

function safeStringify(obj: any, space = 2, maxLen = 4000) {
  try {
    const s = JSON.stringify(obj, null, space);
    return s.length > maxLen ? s.slice(0, maxLen) + " ...[truncated]" : s;
  } catch {
    return String(obj);
  }
}

/* ============== API funcs ============== */
export async function pingERP() {
  const resp = await api.get("/api/method/ping");
  return resp.data as { message: string }; // mong đợi { message: "pong" }
}

export async function loginERP(usr: string, pwd: string): Promise<LoginResult> {
  const resp = await api.post("/api/method/login", { usr, pwd });

  const setCookie =
    (resp.headers as any)?.["set-cookie"] ||
    (resp.headers as any)?.["Set-Cookie"] ||
    (resp.headers as any)?.map?.["set-cookie"];

  const sid = extractSidFromSetCookie(setCookie);
  if (!sid) throw new Error("Không tìm thấy cookie 'sid' trong Set-Cookie.");

  await SecureStore.setItemAsync(SID_KEY, sid);

  return {
    ok: true,
    sid,
    data: resp.data,
  };
}

export async function logoutERP() {
  try {
    await api.post("/api/method/logout");
  } catch {
    // bỏ qua lỗi logout
  }
  await SecureStore.deleteItemAsync(SID_KEY);
}

export async function getLoggedUser(): Promise<LoggedUser> {
  const resp = await api.get("/api/method/frappe.auth.get_logged_user");
  return resp.data as LoggedUser;
}

/* ============== Session utils ============== */
export async function getSid(): Promise<string | null> {
  return SecureStore.getItemAsync(SID_KEY);
}

export async function hasSid(): Promise<boolean> {
  const sid = await SecureStore.getItemAsync(SID_KEY);
  return !!sid;
}

/** Tiện ích debug nhanh: Alert thông tin session và user hiện tại */
export async function debugSessionAlert() {
  const sid = await getSid();
  let who: any = null;

  try {
    who = await getLoggedUser(); // nếu có session hợp lệ: { message: "<username>" }
  } catch (e: any) {
    who = e?.response
      ? { status: e.response.status, data: e.response.data }
      : { message: e?.message || String(e) };
  }

  const sidPreview = sid ? (sid.length > 12 ? sid.slice(0, 6) + "..." + sid.slice(-4) : sid) : null;

  Alert.alert(
    "SESSION CHECK",
    safeStringify(
      {
        hasSid: !!sid,
        sidPreview,
        get_logged_user: who,
      },
      2
    )
  );
}
