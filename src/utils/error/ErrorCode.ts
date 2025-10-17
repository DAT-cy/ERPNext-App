// ErrorCode.ts - Định nghĩa các mã lỗi thống nhất
import { StatusCode } from './StatusCode';

export enum ErrorCode {
  // Common errors
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  INTER_SERVER_ERROR = 'INTER_SERVER_ERROR',
  API_NOT_FOUND = 'API_NOT_FOUND',

  // Authentication errors
  JWT_EXPIRED = 'JWT_EXPIRED',
  JWT_INVALID = 'JWT_INVALID',
  JWT_MALFORMED = 'JWT_MALFORMED',
  JWT_UNSUPPORTED = 'JWT_UNSUPPORTED',
  USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  ACCOUNT_DEACTIVATE = 'ACCOUNT_DEACTIVATE',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  OAUTH2_USER_ERROR = 'OAUTH2_USER_ERROR',

  // File errors
  UPLOAD_FILE_ERR = 'UPLOAD_FILE_ERR',
  IMPORT_FILE_ERROR = 'IMPORT_FILE_ERROR',
  UPLOAD_FILE_ERROR = 'UPLOAD_FILE_ERROR',

  // Business errors
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  PARAMETER_NOT_FOUND = 'PARAMETER_NOT_FOUND',
  DISCOUNT_NOT_FOUND = 'DISCOUNT_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  QUANTITY_NOT_ENOUGH = 'QUANTITY_NOT_ENOUGH',
  CART_NOT_FOUND = 'CART_NOT_FOUND',
  CART_ITEM_NOT_FOUND = 'CART_ITEM_NOT_FOUND',
  BANNER_NOT_FOUND = 'BANNER_NOT_FOUND',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',

  // Application Leave specific errors
  EMPLOYEE_NOT_FOUND = 'EMPLOYEE_NOT_FOUND',
  INVALID_LEAVE_TYPE = 'INVALID_LEAVE_TYPE',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INSUFFICIENT_LEAVE_BALANCE = 'INSUFFICIENT_LEAVE_BALANCE',
  OVERLAPPING_LEAVE = 'OVERLAPPING_LEAVE',
  APPROVER_NOT_FOUND = 'APPROVER_NOT_FOUND',
  LEAVE_ALREADY_APPROVED = 'LEAVE_ALREADY_APPROVED',
  LEAVE_ALREADY_REJECTED = 'LEAVE_ALREADY_REJECTED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  WAREHOUSE_NOT_FOUND = 'WAREHOUSE_NOT_FOUND',

  STOCK_ENTRY_TYPE_NOT_FOUND = 'STOCK_ENTRY_TYPE_NOT_FOUND',

  DETAIL_ITEM_NOT_FOUND = 'DETAIL_ITEM_NOT_FOUND',

  INCOMING_RATE_NOT_FOUND = 'INCOMING_RATE_NOT_FOUND',

  STOCK_BALANCE_NOT_FOUND = 'STOCK_BALANCE_NOT_FOUND',

  SAVE_INVENTORY_FAILED = 'SAVE_INVENTORY_FAILED',
}

// Interface cho Error Definition
export interface ErrorDefinition {
  status: number;
  errorCode: string;
  message: string;
  userMessage: string;
}

// Mapping ErrorCode với ErrorDefinition
export const ERROR_DEFINITIONS: Record<ErrorCode, ErrorDefinition> = {
  // Common errors
  [ErrorCode.FORBIDDEN_ERROR]: {
    status: StatusCode.FORBIDDEN,
    errorCode: 'FORBIDDEN-ERR-403',
    message: 'FORBIDDEN',
    userMessage: 'Bạn không có quyền truy cập'
  },
  [ErrorCode.BAD_REQUEST]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'COMMON-ERR-400',
    message: 'BAD REQUEST',
    userMessage: 'Yêu cầu không hợp lệ'
  },
  [ErrorCode.UNAUTHORIZED]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'COMMON-ERR-402',
    message: 'UNAUTHORIZED',
    userMessage: 'Bạn cần đăng nhập để tiếp tục'
  },
  [ErrorCode.ENTITY_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'COMMON-ERR-404',
    message: 'ENTITY NOT FOUND',
    userMessage: 'Không tìm thấy dữ liệu'
  },
  [ErrorCode.INTER_SERVER_ERROR]: {
    status: StatusCode.INTERNAL_SERVER_ERROR,
    errorCode: 'COMMON-ERR-500',
    message: 'INTER SERVER ERROR',
    userMessage: 'Lỗi hệ thống, vui lòng thử lại sau'
  },
  [ErrorCode.API_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'API-ERR-404',
    message: 'API NOT FOUND',
    userMessage: 'API không tồn tại'
  },

  // Authentication errors
  [ErrorCode.JWT_EXPIRED]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'AUTH-ERR-401',
    message: 'JWT EXPIRED',
    userMessage: 'Phiên đăng nhập đã hết hạn'
  },
  [ErrorCode.JWT_INVALID]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'AUTH-ERR-402',
    message: 'INVALID JWT SIGNATURE',
    userMessage: 'Token không hợp lệ'
  },
  [ErrorCode.JWT_MALFORMED]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'AUTH-ERR-403',
    message: 'INVALID JWT TOKEN',
    userMessage: 'Token không đúng định dạng'
  },
  [ErrorCode.JWT_UNSUPPORTED]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'AUTH-ERR-404',
    message: 'JWT TOKEN UNSUPPORTED',
    userMessage: 'Token không được hỗ trợ'
  },
  [ErrorCode.USERNAME_ALREADY_EXISTS]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'AUTH-ERR-405',
    message: 'USERNAME ALREADY EXISTS',
    userMessage: 'Tên đăng nhập đã tồn tại'
  },
  [ErrorCode.USER_NOT_FOUND]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'AUTH-ERR-406',
    message: 'USERNAME NOT FOUND',
    userMessage: 'Không tìm thấy người dùng'
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'AUTH-ERR-407',
    message: 'TOKEN EXPIRED',
    userMessage: 'Token đã hết hạn'
  },
  [ErrorCode.TOKEN_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'AUTH-ERR-408',
    message: 'TOKEN NOT FOUND',
    userMessage: 'Không tìm thấy token'
  },
  [ErrorCode.ACCOUNT_DEACTIVATE]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'AUTH-ERR-413',
    message: 'DEACTIVATED ACCOUNT',
    userMessage: 'Tài khoản đã bị vô hiệu hóa'
  },
  [ErrorCode.WRONG_PASSWORD]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'AUTH-ERR-408',
    message: 'WRONG PASSWORD',
    userMessage: 'Mật khẩu không đúng'
  },
  [ErrorCode.OAUTH2_USER_ERROR]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'AUTH-ERR-409',
    message: 'USER NOT FOUND',
    userMessage: 'Không tìm thấy người dùng OAuth2'
  },

  // File errors
  [ErrorCode.UPLOAD_FILE_ERR]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'FILE-ERR-400',
    message: 'UPLOAD FILE ERR',
    userMessage: 'Lỗi tải file lên'
  },
  [ErrorCode.IMPORT_FILE_ERROR]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'FILE-ERR-415',
    message: 'IMPORT FILE ERROR',
    userMessage: 'Lỗi nhập file'
  },
  [ErrorCode.UPLOAD_FILE_ERROR]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'FILE-ERR-416',
    message: 'UPLOAD FILE ERROR',
    userMessage: 'Lỗi tải file lên'
  },

  // Business errors
  [ErrorCode.CATEGORY_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'CATEGORY-ERR-001',
    message: 'CATEGORY NOT FOUND',
    userMessage: 'Không tìm thấy danh mục'
  },
  [ErrorCode.PARAMETER_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'PARAMETER-ERR-001',
    message: 'PARAMETER NOT FOUND',
    userMessage: 'Tham số không tìm thấy'
  },
  [ErrorCode.DISCOUNT_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'DISCOUNT-ERR-001',
    message: 'DISCOUNT NOT FOUND',
    userMessage: 'Không tìm thấy giảm giá'
  },
  [ErrorCode.PRODUCT_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'PRODUCT-ERR-001',
    message: 'PRODUCT NOT FOUND',
    userMessage: 'Không tìm thấy sản phẩm'
  },
  [ErrorCode.QUANTITY_NOT_ENOUGH]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'PRODUCT-ERR-002',
    message: 'QUANTITY NOT ENOUGH',
    userMessage: 'Số lượng không đủ'
  },
  [ErrorCode.CART_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'CART-ERR-001',
    message: 'CART NOT FOUND',
    userMessage: 'Không tìm thấy giỏ hàng'
  },
  [ErrorCode.CART_ITEM_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'CART-ERR-002',
    message: 'CART ITEM NOT FOUND',
    userMessage: 'Không tìm thấy sản phẩm trong giỏ hàng'
  },
  [ErrorCode.BANNER_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'BANNER-ERR-001',
    message: 'BANNER NOT FOUND',
    userMessage: 'Không tìm thấy banner'
  },
  [ErrorCode.ORDER_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'ORDER-ERR-001',
    message: 'ORDER NOT FOUND',
    userMessage: 'Không tìm thấy đơn hàng'
  },

  // Application Leave specific errors
  [ErrorCode.EMPLOYEE_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'LEAVE-ERR-001',
    message: 'EMPLOYEE NOT FOUND',
    userMessage: 'Không tìm thấy nhân viên'
  },
  [ErrorCode.INVALID_LEAVE_TYPE]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'LEAVE-ERR-002',
    message: 'INVALID LEAVE TYPE',
    userMessage: 'Loại nghỉ phép không hợp lệ'
  },
  [ErrorCode.INVALID_DATE_RANGE]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'LEAVE-ERR-003',
    message: 'INVALID DATE RANGE',
    userMessage: 'Khoảng thời gian nghỉ phép không hợp lệ'
  },
  [ErrorCode.INSUFFICIENT_LEAVE_BALANCE]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'LEAVE-ERR-004',
    message: 'INSUFFICIENT LEAVE BALANCE',
    userMessage: 'Số ngày nghỉ phép còn lại không đủ'
  },
  [ErrorCode.OVERLAPPING_LEAVE]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'LEAVE-ERR-005',
    message: 'OVERLAPPING LEAVE',
    userMessage: 'Đơn nghỉ phép bị trùng lặp'
  },
  [ErrorCode.APPROVER_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'LEAVE-ERR-006',
    message: 'APPROVER NOT FOUND',
    userMessage: 'Không tìm thấy người phê duyệt'
  },
  [ErrorCode.LEAVE_ALREADY_APPROVED]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'LEAVE-ERR-007',
    message: 'LEAVE ALREADY APPROVED',
    userMessage: 'Đơn nghỉ phép đã được phê duyệt'
  },
  [ErrorCode.LEAVE_ALREADY_REJECTED]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'LEAVE-ERR-008',
    message: 'LEAVE ALREADY REJECTED',
    userMessage: 'Đơn nghỉ phép đã bị từ chối'
  },

  // Network errors
  [ErrorCode.NETWORK_ERROR]: {
    status: StatusCode.SERVICE_UNAVAILABLE,
    errorCode: 'NETWORK-ERR-001',
    message: 'NETWORK ERROR',
    userMessage: 'Lỗi kết nối mạng'
  },
  [ErrorCode.TIMEOUT_ERROR]: {
    status: StatusCode.SERVICE_UNAVAILABLE,
    errorCode: 'NETWORK-ERR-002',
    message: 'TIMEOUT ERROR',
    userMessage: 'Yêu cầu bị timeout'
  },
  [ErrorCode.SESSION_EXPIRED]: {
    status: StatusCode.UNAUTHORIZED,
    errorCode: 'AUTH-ERR-410',
    message: 'SESSION EXPIRED',
    userMessage: 'Phiên đăng nhập đã hết hạn'
  },
  [ErrorCode.SERVER_ERROR]: {
    status: StatusCode.INTERNAL_SERVER_ERROR,
    errorCode: 'SERVER-ERR-001',
    message: 'SERVER ERROR',
    userMessage: 'Lỗi máy chủ'
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    status: StatusCode.INTERNAL_SERVER_ERROR,
    errorCode: 'UNKNOWN-ERR-001',
    message: 'UNKNOWN ERROR',
    userMessage: 'Lỗi không xác định'
  },

  [ErrorCode.WAREHOUSE_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'WAREHOUSE-ERR-001',
    message: 'WAREHOUSE NOT FOUND',
    userMessage: 'Không tìm thấy kho'
  },
  [ErrorCode.STOCK_ENTRY_TYPE_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'STOCK-ENTRY-TYPE-ERR-001',
    message: 'STOCK ENTRY TYPE NOT FOUND',
    userMessage: 'Không tìm thấy loại stock entry'
  },
  [ErrorCode.DETAIL_ITEM_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'DETAIL-ITEM-ERR-001',
    message: 'DETAIL ITEM NOT FOUND',
    userMessage: 'Không tìm thấy chi tiết sản phẩm'
  },
  [ErrorCode.INCOMING_RATE_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'INCOMING-RATE-ERR-001',
    message: 'INCOMING RATE NOT FOUND',
    userMessage: 'Không tìm thấy tỷ giá nhập'
  },
  [ErrorCode.STOCK_BALANCE_NOT_FOUND]: {
    status: StatusCode.NOT_FOUND,
    errorCode: 'STOCK-BALANCE-ERR-001',
    message: 'STOCK BALANCE NOT FOUND',
    userMessage: 'Không tìm thấy số lượng tồn kho'
  },
  [ErrorCode.SAVE_INVENTORY_FAILED]: {
    status: StatusCode.BAD_REQUEST,
    errorCode: 'SAVE-INVENTORY-ERR-001',
    message: 'SAVE INVENTORY FAILED',
    userMessage: 'Lỗi khi lưu phiếu nhập xuất'
  },
};
