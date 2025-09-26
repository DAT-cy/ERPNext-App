
export enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  REQUEST_TIMEOUT = 408,
  INTERNAL_SERVER_ERROR = 500,
}

/* ===== App error code enum (có thể mở rộng dần) ===== */
export enum AppErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  JWT_EXPIRED = "JWT_EXPIRED",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  FORBIDDEN = "FORBIDDEN",
  UNKNOWN = "UNKNOWN",
}

/* ===== Kiểu mô tả 1 error definition ===== */
type ErrorDef = {
  status: StatusCode;
  sysCode: string;        // mã hệ thống/chuẩn hoá nội bộ
  defaultMessage: string; // message kỹ thuật ngắn gọn
  uiMessage: string;      // message cho người dùng (có thể i18n sau)
};

/* ===== Bảng định nghĩa lỗi chuẩn ===== */
export const ERROR_DEFS: Record<AppErrorCode, ErrorDef> = {
  [AppErrorCode.INVALID_CREDENTIALS]: {
    status: StatusCode.UNAUTHORIZED,
    sysCode: "AUTH-ERR-401-INVALID-CREDENTIALS",
    defaultMessage: "Invalid login credentials",
    uiMessage: "Hãy kiểm tra lại tài khoản hoặc mật khẩu của bạn",
  },
  [AppErrorCode.SESSION_EXPIRED]: {
    status: StatusCode.UNAUTHORIZED,
    sysCode: "AUTH-ERR-401-SESSION",
    defaultMessage: "Session expired",
    uiMessage: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  },
  [AppErrorCode.JWT_EXPIRED]: {
    status: StatusCode.UNAUTHORIZED,
    sysCode: "AUTH-ERR-401-JWT",
    defaultMessage: "JWT EXPIRED",
    uiMessage: "Phiên xác thực đã hết hạn, vui lòng đăng nhập lại.",
  },
  [AppErrorCode.FORBIDDEN]: {
    status: StatusCode.FORBIDDEN,
    sysCode: "AUTH-ERR-403",
    defaultMessage: "Forbidden",
    uiMessage: "Bạn không có quyền truy cập.",
  },
  [AppErrorCode.NETWORK_TIMEOUT]: {
    status: StatusCode.REQUEST_TIMEOUT,
    sysCode: "NET-ERR-TIMEOUT",
    defaultMessage: "Network timeout",
    uiMessage: "Không kết nối được máy chủ. Kiểm tra IP/Port/Firewall.",
  },
  [AppErrorCode.UNKNOWN]: {
    status: StatusCode.INTERNAL_SERVER_ERROR,
    sysCode: "APP-ERR-UNKNOWN",
    defaultMessage: "Unknown error",
    uiMessage: "Đã xảy ra lỗi. Vui lòng thử lại.",
  },
};

/* ===== AppError class ===== */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: StatusCode;
  readonly sysCode: string;
  readonly raw?: any;

  constructor(code: AppErrorCode, options?: { message?: string; raw?: any }) {
    const def = ERROR_DEFS[code];
    super(options?.message ?? def.defaultMessage);
    this.name = "AppError";
    this.code = code;
    this.status = def.status;
    this.sysCode = def.sysCode;
    this.raw = options?.raw;
  }

  get uiMessage() {
    return ERROR_DEFS[this.code].uiMessage;
  }
}

/* ===== Factory ngắn gọn (đúng style bạn yêu cầu) ===== */
export const Errors = {
  JWT_EXPIRED: () => new AppError(AppErrorCode.JWT_EXPIRED),
  SESSION_EXPIRED: () => new AppError(AppErrorCode.SESSION_EXPIRED),
  INVALID_CREDENTIALS: () => new AppError(AppErrorCode.INVALID_CREDENTIALS),
  FORBIDDEN: () => new AppError(AppErrorCode.FORBIDDEN),
  NETWORK_TIMEOUT: () => new AppError(AppErrorCode.NETWORK_TIMEOUT),
  UNKNOWN: (raw?: any) => new AppError(AppErrorCode.UNKNOWN, { raw }),
};

/* ===== Chuẩn hoá lỗi từ Axios/Frappe về AppError ===== */
export function normalizeAxiosToAppError(err: any): AppError {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (err?.code === "ECONNABORTED" || /timeout/i.test(err?.message || "")) {
    return Errors.NETWORK_TIMEOUT();
  }

  // 401 -> có thể là JWT expired / session expired / invalid credentials
  if (status === 401) {
    const msg = (data?.message ?? data?.exc ?? "").toString();
    if (/jwt.*expired/i.test(msg)) return Errors.JWT_EXPIRED();
    if (/invalid\s+login\s+credentials/i.test(msg)) return Errors.INVALID_CREDENTIALS();
    return Errors.SESSION_EXPIRED();
  }

  if (status === 403) return Errors.FORBIDDEN();

  // ERPNext có thể trả HTML -> bắt keywords
  const ct = err?.response?.headers?.["content-type"] || "";
  if (typeof data === "string" && /text\/html/i.test(ct)) {
    if (/invalid|incorrect|authentication\s*error/i.test(data)) {
      return Errors.INVALID_CREDENTIALS();
    }
  }

  return Errors.UNKNOWN(data ?? err);
}

/* ===== Trợ giúp cho union LoginResult (nếu bạn dùng) ===== */
export function toLoginFailFromAppError(e: AppError) {
  return { ok: false as const, error: e.code, status: e.status, raw: e.raw };
}
