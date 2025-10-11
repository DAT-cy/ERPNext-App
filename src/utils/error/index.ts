
// Unified Error Handling System
export * from './StatusCode';
export * from './ErrorCode';
export * from './CommonException';

// Import for internal use
import { CommonException } from './CommonException';
import { ErrorCode } from './ErrorCode';

// Legacy interfaces for backward compatibility
export interface ApplicationLeaveError {
  code: string;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: string;
}

export interface ApplicationLeaveResult<T = any> {
  success: boolean;
  data?: T;
  error?: CommonException;
}

// Legacy error handler class
export class ApplicationLeaveErrorHandler {
  static withErrorHandling<T>(fn: () => Promise<T>): Promise<ApplicationLeaveResult<T>> {
    return fn()
      .then(data => ({ success: true, data }))
      .catch(error => {
        const commonError = error instanceof CommonException ? error : new CommonException(ErrorCode.UNKNOWN_ERROR, error);
        return {
          success: false,
          error: commonError
        };
      });
  }

  static createEmployeeNotFoundError(): CommonException {
    return new CommonException(ErrorCode.EMPLOYEE_NOT_FOUND);
  }

  static createNetworkError(): CommonException {
    return new CommonException(ErrorCode.NETWORK_ERROR);
  }

  static createTimeoutError(): CommonException {
    return new CommonException(ErrorCode.TIMEOUT_ERROR);
  }

  static createUnauthorizedError(): CommonException {
    return new CommonException(ErrorCode.UNAUTHORIZED);
  }

  static createSessionExpiredError(): CommonException {
    return new CommonException(ErrorCode.SESSION_EXPIRED);
  }

  static createServerError(): CommonException {
    return new CommonException(ErrorCode.SERVER_ERROR);
  }

  static createUnknownError(): CommonException {
    return new CommonException(ErrorCode.UNKNOWN_ERROR);
  }

  static handleError(error: ApplicationLeaveError): void {
    console.error('ApplicationLeave Error:', error);
  }

  static analyzeError(error: any): any {
    return error;
  }
}

export enum ApplicationLeaveErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  EMPLOYEE_NOT_FOUND = 'EMPLOYEE_NOT_FOUND',
  INVALID_LEAVE_TYPE = 'INVALID_LEAVE_TYPE',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INSUFFICIENT_LEAVE_BALANCE = 'INSUFFICIENT_LEAVE_BALANCE',
  OVERLAPPING_LEAVE = 'OVERLAPPING_LEAVE',
  APPROVER_NOT_FOUND = 'APPROVER_NOT_FOUND',
  LEAVE_ALREADY_APPROVED = 'LEAVE_ALREADY_APPROVED',
  LEAVE_ALREADY_REJECTED = 'LEAVE_ALREADY_REJECTED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// HomeScreen error handler
export class HomeScreenErrorHandler {
  static handleError(error: any, context?: any): void {
    console.error('HomeScreen Error:', error);
  }

  static analyzeError(error: any, context?: any): any {
    return error;
  }

  static getErrorDefinition(errorCode: string, context?: any): any {
    return { code: errorCode, message: 'Error occurred' };
  }

  static createError(errorCode: string, details?: any): CommonException {
    return new CommonException(ErrorCode.UNKNOWN_ERROR, details);
  }

  static handleLocationError(error: any, context?: any): void {
    console.error('Location Error:', error);
  }

  static createCheckinNoGpsError(details?: any): CommonException {
    return new CommonException(ErrorCode.NETWORK_ERROR, details);
  }

  static handleCheckinError(error: any, context?: any, details?: any): void {
    console.error('Checkin Error:', error);
  }

  static createCheckinNoLocationError(details?: any): CommonException {
    return new CommonException(ErrorCode.NETWORK_ERROR, details);
  }
}

export const homeScreenErrorHandler = HomeScreenErrorHandler;

export enum HomeScreenErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  GPS_SERVICE_DISABLED = 'GPS_SERVICE_DISABLED',
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  LOCATION_COORDS_INVALID = 'LOCATION_COORDS_INVALID'
}

// Re-export for backward compatibility
export { CommonException as ErrorHandler } from './CommonException';
export { ErrorCode as AppErrorCode } from './ErrorCode';
export { StatusCode } from './StatusCode';