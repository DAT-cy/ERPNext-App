// utils/error/applicationLeave.ts
import { Alert } from 'react-native';

// Enum định nghĩa các loại lỗi cho Application Leave
export enum ApplicationLeaveErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation errors
  EMPLOYEE_NOT_FOUND = 'EMPLOYEE_NOT_FOUND',
  INVALID_LEAVE_TYPE = 'INVALID_LEAVE_TYPE',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INSUFFICIENT_LEAVE_BALANCE = 'INSUFFICIENT_LEAVE_BALANCE',
  
  // Business logic errors
  OVERLAPPING_LEAVE = 'OVERLAPPING_LEAVE',
  APPROVER_NOT_FOUND = 'APPROVER_NOT_FOUND',
  LEAVE_ALREADY_APPROVED = 'LEAVE_ALREADY_APPROVED',
  LEAVE_ALREADY_REJECTED = 'LEAVE_ALREADY_REJECTED',
  
  // System errors
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Interface cho ApplicationLeave Error
export interface ApplicationLeaveError {
  code: ApplicationLeaveErrorCode;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: string;
}

// Interface cho kết quả trả về
export interface ApplicationLeaveResult<T = any> {
  success: boolean;
  data?: T;
  error?: ApplicationLeaveError;
}

// Định nghĩa thông báo lỗi user-friendly
const ERROR_MESSAGES: Record<ApplicationLeaveErrorCode, string> = {
  [ApplicationLeaveErrorCode.NETWORK_ERROR]: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.',
  [ApplicationLeaveErrorCode.TIMEOUT_ERROR]: 'Yêu cầu bị timeout. Vui lòng thử lại.',
  [ApplicationLeaveErrorCode.UNAUTHORIZED]: 'Bạn không có quyền thực hiện thao tác này.',
  [ApplicationLeaveErrorCode.SESSION_EXPIRED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [ApplicationLeaveErrorCode.EMPLOYEE_NOT_FOUND]: 'Không tìm thấy thông tin nhân viên. Vui lòng liên hệ admin.',
  [ApplicationLeaveErrorCode.INVALID_LEAVE_TYPE]: 'Loại nghỉ phép không hợp lệ.',
  [ApplicationLeaveErrorCode.INVALID_DATE_RANGE]: 'Khoảng thời gian nghỉ không hợp lệ.',
  [ApplicationLeaveErrorCode.INSUFFICIENT_LEAVE_BALANCE]: 'Số ngày nghỉ còn lại không đủ.',
  [ApplicationLeaveErrorCode.OVERLAPPING_LEAVE]: 'Đã có đơn nghỉ phép trong khoảng thời gian này.',
  [ApplicationLeaveErrorCode.APPROVER_NOT_FOUND]: 'Không tìm thấy người phê duyệt.',
  [ApplicationLeaveErrorCode.LEAVE_ALREADY_APPROVED]: 'Đơn nghỉ phép đã được phê duyệt.',
  [ApplicationLeaveErrorCode.LEAVE_ALREADY_REJECTED]: 'Đơn nghỉ phép đã bị từ chối.',
  [ApplicationLeaveErrorCode.SERVER_ERROR]: 'Lỗi server. Vui lòng thử lại sau.',
  [ApplicationLeaveErrorCode.UNKNOWN_ERROR]: 'Có lỗi không xác định xảy ra. Vui lòng thử lại.',
};

export class ApplicationLeaveErrorHandler {
  /**
   * Tạo ApplicationLeaveError từ error code
   */
  static createError(
    code: ApplicationLeaveErrorCode, 
    originalMessage?: string, 
    details?: any
  ): ApplicationLeaveError {
    return {
      code,
      message: originalMessage || `Application Leave Error: ${code}`,
      userMessage: ERROR_MESSAGES[code],
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Phân tích lỗi từ API response hoặc exception
   */
  static analyzeError(error: any): ApplicationLeaveError {
    console.error('Application Leave Error:', error);

    // Kiểm tra network errors
    if (!navigator?.onLine) {
      return this.createError(ApplicationLeaveErrorCode.NETWORK_ERROR, 'No internet connection');
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return this.createError(ApplicationLeaveErrorCode.TIMEOUT_ERROR, error.message);
    }

    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return this.createError(ApplicationLeaveErrorCode.NETWORK_ERROR, error.message);
    }

    // Kiểm tra HTTP status codes
    const status = error.response?.status;
    const responseData = error.response?.data;

    switch (status) {
      case 401:
        return this.createError(ApplicationLeaveErrorCode.UNAUTHORIZED, error.message);
      
      case 403:
        return this.createError(ApplicationLeaveErrorCode.SESSION_EXPIRED, error.message);
      
      case 404:
        if (responseData?.message?.includes('Employee')) {
          return this.createError(ApplicationLeaveErrorCode.EMPLOYEE_NOT_FOUND, responseData.message);
        }
        return this.createError(ApplicationLeaveErrorCode.APPROVER_NOT_FOUND, responseData?.message);
      
      case 422:
      case 400:
        return this.analyzeValidationError(responseData);
      
      case 500:
      case 502:
      case 503:
        return this.createError(ApplicationLeaveErrorCode.SERVER_ERROR, error.message);
      
      default:
        return this.createError(ApplicationLeaveErrorCode.UNKNOWN_ERROR, error.message, { status, responseData });
    }
  }

  /**
   * Phân tích lỗi validation từ server
   */
  private static analyzeValidationError(responseData: any): ApplicationLeaveError {
    const message = responseData?.message || responseData?.error || '';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('leave type')) {
      return this.createError(ApplicationLeaveErrorCode.INVALID_LEAVE_TYPE, message);
    }

    if (lowerMessage.includes('date') || lowerMessage.includes('from_date') || lowerMessage.includes('to_date')) {
      return this.createError(ApplicationLeaveErrorCode.INVALID_DATE_RANGE, message);
    }

    if (lowerMessage.includes('balance') || lowerMessage.includes('insufficient')) {
      return this.createError(ApplicationLeaveErrorCode.INSUFFICIENT_LEAVE_BALANCE, message);
    }

    if (lowerMessage.includes('overlap') || lowerMessage.includes('already exists')) {
      return this.createError(ApplicationLeaveErrorCode.OVERLAPPING_LEAVE, message);
    }

    if (lowerMessage.includes('approved')) {
      return this.createError(ApplicationLeaveErrorCode.LEAVE_ALREADY_APPROVED, message);
    }

    if (lowerMessage.includes('rejected') || lowerMessage.includes('cancelled')) {
      return this.createError(ApplicationLeaveErrorCode.LEAVE_ALREADY_REJECTED, message);
    }

    // Default validation error
    return this.createError(ApplicationLeaveErrorCode.UNKNOWN_ERROR, message);
  }

  /**
   * Wrap function với error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string = 'Application Leave Operation'
  ): Promise<ApplicationLeaveResult<T>> {
    try {
      console.log(`🔄 ${context} - Starting...`);
      const data = await operation();
      console.log(`✅ ${context} - Success`);
      
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error(`❌ ${context} - Failed:`, error);
      
      const applicationLeaveError = this.analyzeError(error);
      
      return {
        success: false,
        error: applicationLeaveError
      };
    }
  }

  /**
   * Hiển thị error cho user
   */
  static handleError(error: ApplicationLeaveError, showAlert: boolean = true): void {
    console.error('Application Leave Error:', error);

    if (showAlert) {
      Alert.alert('Lỗi', error.userMessage);
    }

    // Log chi tiết cho debugging
    if (__DEV__) {
      console.group('🐛 Application Leave Error Details');
      console.log('Code:', error.code);
      console.log('Message:', error.message);
      console.log('User Message:', error.userMessage);
      console.log('Timestamp:', error.timestamp);
      console.log('Details:', error.details);
      console.groupEnd();
    }
  }

  /**
   * Tạo lỗi Employee Not Found (thường dùng nhất)
   */
  static createEmployeeNotFoundError(): ApplicationLeaveError {
    return this.createError(
      ApplicationLeaveErrorCode.EMPLOYEE_NOT_FOUND,
      "Không tìm thấy mã nhân viên cho người dùng hiện tại"
    );
  }

  /**
   * Kiểm tra loại error
   */
  static isNetworkError(error: ApplicationLeaveError): boolean {
    return [
      ApplicationLeaveErrorCode.NETWORK_ERROR,
      ApplicationLeaveErrorCode.TIMEOUT_ERROR
    ].includes(error.code);
  }

  static isAuthError(error: ApplicationLeaveError): boolean {
    return [
      ApplicationLeaveErrorCode.UNAUTHORIZED,
      ApplicationLeaveErrorCode.SESSION_EXPIRED
    ].includes(error.code);
  }

  static isValidationError(error: ApplicationLeaveError): boolean {
    return [
      ApplicationLeaveErrorCode.EMPLOYEE_NOT_FOUND,
      ApplicationLeaveErrorCode.INVALID_LEAVE_TYPE,
      ApplicationLeaveErrorCode.INVALID_DATE_RANGE,
      ApplicationLeaveErrorCode.INSUFFICIENT_LEAVE_BALANCE
    ].includes(error.code);
  }
}
