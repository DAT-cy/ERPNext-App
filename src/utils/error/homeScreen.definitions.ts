// src/utils/error/homeScreen.definitions.ts
import { HomeScreenErrorCode } from './homeScreen.codes';

export interface HomeScreenErrorDef {
  code: HomeScreenErrorCode;
  severity: 'low' | 'medium' | 'high';
  category: 'data' | 'location' | 'checkin' | 'system';
  systemMessage: string;
  userMessage: string;
  actionable: boolean;
  retryable: boolean;
  retryAction?: string;
}

export const HOME_SCREEN_ERROR_DEFINITIONS: Record<HomeScreenErrorCode, HomeScreenErrorDef> = {
  // Data Loading Errors
  [HomeScreenErrorCode.CHECKIN_DATA_LOAD_FAILED]: {
    code: HomeScreenErrorCode.CHECKIN_DATA_LOAD_FAILED,
    severity: 'medium',
    category: 'data',
    systemMessage: 'Failed to load checkin records from API',
    userMessage: 'Không thể tải dữ liệu chấm công',
    actionable: true,
    retryable: true,
    retryAction: 'Thử lại'
  },

  // Location Service Errors
  [HomeScreenErrorCode.GPS_SERVICE_DISABLED]: {
    code: HomeScreenErrorCode.GPS_SERVICE_DISABLED,
    severity: 'high',
    category: 'location',
    systemMessage: 'GPS service is disabled on device',
    userMessage: 'GPS chưa được bật. Vui lòng bật GPS trong cài đặt.',
    actionable: true,
    retryable: true,
    retryAction: 'Bật GPS'
  },

  [HomeScreenErrorCode.LOCATION_SERVICE_CHECK_FAILED]: {
    code: HomeScreenErrorCode.LOCATION_SERVICE_CHECK_FAILED,
    severity: 'low',
    category: 'location',
    systemMessage: 'Failed to check if location services are enabled',
    userMessage: 'Không thể kiểm tra dịch vụ vị trí',
    actionable: false,
    retryable: false
  },

  // Location Permission Errors
  [HomeScreenErrorCode.LOCATION_PERMISSION_DENIED]: {
    code: HomeScreenErrorCode.LOCATION_PERMISSION_DENIED,
    severity: 'high',
    category: 'location',
    systemMessage: 'Location permission denied by user',
    userMessage: 'Cần cấp quyền truy cập vị trí để chấm công',
    actionable: true,
    retryable: true,
    retryAction: 'Cấp quyền'
  },

  // Location Timeout Errors (Multi-level GPS strategy)
  [HomeScreenErrorCode.LOCATION_TIMEOUT_HIGH_ACCURACY]: {
    code: HomeScreenErrorCode.LOCATION_TIMEOUT_HIGH_ACCURACY,
    severity: 'low',
    category: 'location',
    systemMessage: 'High accuracy GPS request timed out',
    userMessage: 'GPS độ chính xác cao timeout',
    actionable: false,
    retryable: false
  },

  [HomeScreenErrorCode.LOCATION_TIMEOUT_BALANCED_ACCURACY]: {
    code: HomeScreenErrorCode.LOCATION_TIMEOUT_BALANCED_ACCURACY,
    severity: 'low',
    category: 'location',
    systemMessage: 'Balanced accuracy GPS request timed out',
    userMessage: 'GPS độ chính xác cân bằng timeout',
    actionable: false,
    retryable: false
  },

  [HomeScreenErrorCode.LOCATION_TIMEOUT_LOW_ACCURACY]: {
    code: HomeScreenErrorCode.LOCATION_TIMEOUT_LOW_ACCURACY,
    severity: 'medium',
    category: 'location',
    systemMessage: 'Low accuracy GPS request timed out (final fallback failed)',
    userMessage: 'GPS timeout - Hãy ra ngoài trời hoặc gần cửa sổ',
    actionable: true,
    retryable: true,
    retryAction: 'Thử lại GPS'
  },

  // Location Data Errors
  [HomeScreenErrorCode.LOCATION_COORDS_INVALID]: {
    code: HomeScreenErrorCode.LOCATION_COORDS_INVALID,
    severity: 'medium',
    category: 'location',
    systemMessage: 'Received location object but coordinates are null/undefined',
    userMessage: 'Không thể lấy được tọa độ GPS',
    actionable: true,
    retryable: true,
    retryAction: 'Thử lại GPS'
  },

  [HomeScreenErrorCode.LOCATION_NETWORK_ERROR]: {
    code: HomeScreenErrorCode.LOCATION_NETWORK_ERROR,
    severity: 'medium',
    category: 'location',
    systemMessage: 'Network error while fetching GPS location',
    userMessage: 'Lỗi mạng - Kiểm tra kết nối internet',
    actionable: true,
    retryable: true,
    retryAction: 'Kiểm tra mạng'
  },

  [HomeScreenErrorCode.LOCATION_GENERAL_ERROR]: {
    code: HomeScreenErrorCode.LOCATION_GENERAL_ERROR,
    severity: 'medium',
    category: 'location',
    systemMessage: 'General location acquisition error',
    userMessage: 'Không thể lấy vị trí',
    actionable: true,
    retryable: true,
    retryAction: 'Thử lại GPS'
  },

  // Checkin Validation Errors
  [HomeScreenErrorCode.CHECKIN_NO_VALID_GPS]: {
    code: HomeScreenErrorCode.CHECKIN_NO_VALID_GPS,
    severity: 'high',
    category: 'checkin',
    systemMessage: 'Attempted checkin without valid GPS location',
    userMessage: 'Không thể chấm công',
    actionable: true,
    retryable: true,
    retryAction: 'Thử lại GPS'
  },

  [HomeScreenErrorCode.CHECKIN_NO_LOCATION_DATA]: {
    code: HomeScreenErrorCode.CHECKIN_NO_LOCATION_DATA,
    severity: 'high',
    category: 'checkin',
    systemMessage: 'No userLocation data available for checkin submission',
    userMessage: 'Không có thông tin vị trí GPS',
    actionable: true,
    retryable: true,
    retryAction: 'Lấy vị trí'
  },

  // Checkin API Errors
  [HomeScreenErrorCode.CHECKIN_API_SUBMIT_FAILED]: {
    code: HomeScreenErrorCode.CHECKIN_API_SUBMIT_FAILED,
    severity: 'high',
    category: 'checkin',
    systemMessage: 'API call to submit checkin failed',
    userMessage: 'Lỗi server khi chấm công',
    actionable: true,
    retryable: true,
    retryAction: 'Thử lại'
  },

  [HomeScreenErrorCode.CHECKIN_UNKNOWN_ERROR]: {
    code: HomeScreenErrorCode.CHECKIN_UNKNOWN_ERROR,
    severity: 'medium',
    category: 'checkin',
    systemMessage: 'Unknown error during checkin process',
    userMessage: 'Lỗi không xác định khi chấm công',
    actionable: true,
    retryable: true,
    retryAction: 'Thử lại'
  },

  // System Initialization Errors
  [HomeScreenErrorCode.INITIALIZATION_FAILED]: {
    code: HomeScreenErrorCode.INITIALIZATION_FAILED,
    severity: 'medium',
    category: 'system',
    systemMessage: 'Error during HomeScreen initialization (loadData + getLocation)',
    userMessage: 'Lỗi khi khởi tạo ứng dụng',
    actionable: true,
    retryable: true,
    retryAction: 'Khởi động lại'
  }
};