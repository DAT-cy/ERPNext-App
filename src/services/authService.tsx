// services/authService.tsx
import { api, SID_KEY } from "../config/api";
import * as SecureStore from "expo-secure-store";
import { LoggedUser, LoginOk, LoginFail, LoginResult , RoleUsers, InformationUser, RoleUserMap } from "../types/auth.types";
import { handleServiceThrow } from "../utils/error/ErrorHandler";
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

// Hàm lấy roles của user theo username
export async function getRolesUsers(userId: string): Promise<RoleUsers> {
  const { data } = await api.get<RoleUsers>(
    "/api/method/frappe.core.doctype.user.user.get_roles",
    {
      params: { uid: userId }
    }
  );
  return data;
}

// Hàm lấy roles của user hiện tại (lấy từ getLoggedUser)
export async function getCurrentUserRoles(): Promise<RoleUsers> {
  const loggedUser = await getLoggedUser();
  const username = loggedUser.message;
  return await getRolesUsers(username);
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

export async function getEmployeeCodeByEmail(): Promise<string | null> {
  try {
    console.log('🔍 [getEmployeeCodeByEmail] Starting function...');
    
    // Lấy logged user trước
    const loggedUser = await getLoggedUser();
    const userId = loggedUser.message;
    console.log('👤 [getEmployeeCodeByEmail] Looking for employee with user_id:', userId);
    
    // Sử dụng ERPNext standard list API
    const response = await api.get("/api/resource/Employee", {
      params: {
        filters: JSON.stringify([["user_id", "=", userId]]),
        fields: JSON.stringify(["name", "employee_name", "user_id"]),
        limit: 1
      }
    });
    
    console.log('📡 [getEmployeeCodeByEmail] API response:', response.data);
    
    const employees = response.data?.data;
    if (Array.isArray(employees) && employees.length > 0) {
      const employeeCode = employees[0].name;
      console.log('✅ [getEmployeeCodeByEmail] Found employee code:', employeeCode);
      return employeeCode;
    } else {
      console.warn('⚠️ [getEmployeeCodeByEmail] No employee found for user:', userId);
      return null;
    }
  } catch (error: any) {
    console.error('❌ [getEmployeeCodeByEmail] Error:', error);
    if (error?.response) {
      console.error('📡 [getEmployeeCodeByEmail] Response error:', error.response.data);
      console.error('📡 [getEmployeeCodeByEmail] Status:', error.response.status);
    }
    handleServiceThrow(error, 'Lỗi lấy mã nhân viên');
  }
}

export interface UserProfileMessage {
  email: string;
  image: string | null;
  name: string;
}

export async function getEmployeeNameByEmail(): Promise<UserProfileMessage | null> {
  const employee = await api.get(`/api/method/remak.utils.user.get_user_info`);
  const msg = employee.data?.message;
  if (msg && typeof msg === 'object') {
    return {
      email: msg.email,
      image: msg.image ?? null,
      name: msg.name,
    } as UserProfileMessage;
  }
  return null;
}






