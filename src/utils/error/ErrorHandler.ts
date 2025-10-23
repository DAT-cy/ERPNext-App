// ErrorHandler.ts - Simplified Vietnamese error handling
import { Alert } from 'react-native';

/**
 * Extract Vietnamese-friendly error message from Frappe response
 * This function parses Frappe error responses and returns user-friendly Vietnamese messages
 */
export function getVietnameseErrorMessageFromFrappe(error: any, fallback: string): string {
    try {
        const data = error?.response?.data || error || {};
        let rawMessage: string =
            data?._server_messages || data?.exception || data?.message || data?.exc || data?.error || '';

        // _server_messages can be a JSON string of a JSON string → decode twice if needed
        if (typeof rawMessage === 'string' && rawMessage.startsWith('[')) {
            try {
                const arr = JSON.parse(rawMessage);
                if (Array.isArray(arr) && arr.length > 0) {
                    const first = arr[0];
                    if (typeof first === 'string') {
                        try {
                            const inner = JSON.parse(first);
                            rawMessage = inner?.message || rawMessage;
                        } catch {
                            rawMessage = first || rawMessage;
                        }
                    }
                }
            } catch {
                // ignore
            }
        }

        const excType: string | undefined = data?.exc_type || (typeof data?.exception === 'string' && data.exception.includes('WorkflowPermissionError') ? 'WorkflowPermissionError' : undefined);

        // Normalize to string for parsing
        const messageStr = String(rawMessage || data?.message || fallback || '');

        // Workflow permission: extract from/to statuses
        if (excType === 'WorkflowPermissionError' || messageStr.includes('WorkflowPermissionError') || messageStr.includes('Chuyển đổi trạng thái')) {
            const match = messageStr.match(/từ <strong>([^<]+)<\/strong> sang <strong>([^<]+)<\/strong>/);
            if (match) {
                const fromStatus = match[1];
                const toStatus = match[2];
                return `Không thể chuyển đổi trạng thái từ "${fromStatus}" sang "${toStatus}". Vui lòng kiểm tra quyền hạn hoặc trạng thái hiện tại.`;
            }
            return 'Không thể chuyển đổi trạng thái này. Vui lòng kiểm tra quyền hạn hoặc trạng thái hiện tại.';
        }

        // Common permissions/validation/network fallbacks in Vietnamese
        if (/Permission/i.test(messageStr)) return 'Bạn không có quyền thực hiện thao tác này.';
        if (/Validation/i.test(messageStr)) return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        if (/quantity|số lượng|qty/i.test(messageStr)) return 'Không thể cập nhật số lượng. Vui lòng kiểm tra lại dữ liệu và thử lại.';
        if (/items|mặt hàng/i.test(messageStr)) return 'Không thể cập nhật thông tin mặt hàng. Vui lòng kiểm tra lại dữ liệu.';
        if (/Network|timeout/i.test(messageStr)) return 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.';
        if (/Server|server/i.test(messageStr)) return 'Lỗi máy chủ. Vui lòng thử lại sau.';
        if (/Not\s*Found|not\s*found/i.test(messageStr)) return 'Không tìm thấy dữ liệu. Vui lòng kiểm tra lại.';
        if (/Bad\s*Request|bad\s*request/i.test(messageStr)) return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.';
        if (/Unauthorized|unauthorized/i.test(messageStr)) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        if (/Forbidden|forbidden/i.test(messageStr)) return 'Bạn không có quyền truy cập tài nguyên này.';

        // If Frappe already sends Vietnamese content, prefer it
        if (/Chuy|trạng thái|Không thể|Vui lòng|không/i.test(messageStr)) return messageStr;

        return fallback;
    } catch {
        return fallback;
    }
}

/**
 * Simple error object for service responses
 */
export interface SimpleError {
    success: false;
    error: string; // Vietnamese error message
}

/**
 * Handle service errors with Vietnamese messages
 * Returns a standardized error response for service functions
 */
export function handleServiceError(error: any, fallbackMessage: string): SimpleError {
    const vietnameseMessage = getVietnameseErrorMessageFromFrappe(error, fallbackMessage);
    return {
        success: false,
        error: vietnameseMessage
    };
}

/**
 * Handle service errors that should throw exceptions
 * For functions that throw instead of returning error objects
 */
export function handleServiceThrow(error: any, fallbackMessage: string): never {
    const vietnameseMessage = getVietnameseErrorMessageFromFrappe(error, fallbackMessage);
    throw new Error(vietnameseMessage);
}

/**
 * Show error alert with Vietnamese message
 * Direct UI helper for displaying errors
 */
export function showErrorAlert(error: any, fallbackMessage: string = 'Có lỗi xảy ra') {
    const vietnameseMessage = getVietnameseErrorMessageFromFrappe(error, fallbackMessage);
    Alert.alert('Lỗi', vietnameseMessage);
}

/**
 * Show success alert
 */
export function showSuccessAlert(message: string = 'Thành công') {
    Alert.alert('Thành công', message);
}