// CommonException.ts - Exception class thống nhất
import { ErrorCode, ERROR_DEFINITIONS, ErrorDefinition } from './ErrorCode';

export class CommonException extends Error {
  public readonly errorCode: ErrorCode;
  public readonly code: string; // Alias for errorCode for backward compatibility
  public readonly status: number;
  public readonly errorCodeString: string;
  public readonly userMessage: string;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(errorCode: ErrorCode, details?: any) {
    const errorDef = ERROR_DEFINITIONS[errorCode];
    super(errorDef.message);
    
    this.errorCode = errorCode;
    this.code = errorCode; 
    this.status = errorDef.status;
    this.errorCodeString = errorDef.errorCode;
    this.userMessage = errorDef.userMessage;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, CommonException.prototype);
  }

  // Static factory methods for common errors
  static createForbiddenError(details?: any): CommonException {
    return new CommonException(ErrorCode.FORBIDDEN_ERROR, details);
  }

  static createBadRequestError(details?: any): CommonException {
    return new CommonException(ErrorCode.BAD_REQUEST, details);
  }

  static createUnauthorizedError(details?: any): CommonException {
    return new CommonException(ErrorCode.UNAUTHORIZED, details);
  }

  static createNotFoundError(details?: any): CommonException {
    return new CommonException(ErrorCode.ENTITY_NOT_FOUND, details);
  }

  static createServerError(details?: any): CommonException {
    return new CommonException(ErrorCode.INTER_SERVER_ERROR, details);
  }

  static createNetworkError(details?: any): CommonException {
    return new CommonException(ErrorCode.NETWORK_ERROR, details);
  }

  static createTimeoutError(details?: any): CommonException {
    return new CommonException(ErrorCode.TIMEOUT_ERROR, details);
  }

  static createUnknownError(details?: any): CommonException {
    return new CommonException(ErrorCode.UNKNOWN_ERROR, details);
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      errorCode: this.errorCodeString,
      message: this.message,
      userMessage: this.userMessage,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp
    };
  }

  // Convert to user-friendly error object
  toUserError() {
    return {
      code: this.errorCode,
      message: this.userMessage,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}
