// src/types/error.types.ts
export interface AppError {
  code?: string;
  message: string;
  type: ErrorType;
  originalError?: any;
}

export enum ErrorType {
  LOCATION = 'LOCATION',
  CHECKIN = 'CHECKIN',
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  SYSTEM = 'SYSTEM',
  VALIDATION = 'VALIDATION'
}

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  logToConsole?: boolean;
  title?: string;
  allowRetry?: boolean;
  onRetry?: () => void;
}

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