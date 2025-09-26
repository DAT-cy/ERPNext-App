// src/utils/error/homeScreen.handler.ts
import { Alert, ToastAndroid, Platform } from 'react-native';
import { HomeScreenErrorCode } from './homeScreen.codes';
import { HOME_SCREEN_ERROR_DEFINITIONS, HomeScreenErrorDef } from './homeScreen.definitions';

export interface HomeScreenError {
  code: HomeScreenErrorCode;
  originalError?: any;
  context?: string;
  metadata?: Record<string, any>;
}

/**
 * Chuyên xử lý lỗi cho HomeScreen
 * Singleton pattern - dùng HomeScreenErrorHandler.getInstance()
 */
export class HomeScreenErrorHandler {
  private static instance: HomeScreenErrorHandler;

  private constructor() {}

  public static getInstance(): HomeScreenErrorHandler {
    if (!HomeScreenErrorHandler.instance) {
      HomeScreenErrorHandler.instance = new HomeScreenErrorHandler();
    }
    return HomeScreenErrorHandler.instance;
  }

  /**
   * Tạo HomeScreenError từ error code
   */
  createError(
    code: HomeScreenErrorCode,
    originalError?: any,
    context?: string,
    metadata?: Record<string, any>
  ): HomeScreenError {
    return {
      code,
      originalError,
      context,
      metadata
    };
  }

  /**
   * Phân tích raw error và convert thành HomeScreenError
   */
  analyzeError(error: any, context: string = 'unknown'): HomeScreenError {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Location timeout errors (theo thứ tự độ chính xác)
      if (message.includes('high accuracy timeout')) {
        return this.createError(HomeScreenErrorCode.LOCATION_TIMEOUT_HIGH_ACCURACY, error, context);
      }
      if (message.includes('balanced accuracy timeout')) {
        return this.createError(HomeScreenErrorCode.LOCATION_TIMEOUT_BALANCED_ACCURACY, error, context);
      }
      if (message.includes('low accuracy timeout')) {
        return this.createError(HomeScreenErrorCode.LOCATION_TIMEOUT_LOW_ACCURACY, error, context);
      }
      
      // Location permission/service errors
      if (message.includes('permission')) {
        return this.createError(HomeScreenErrorCode.LOCATION_PERMISSION_DENIED, error, context);
      }
      if (message.includes('disabled') || message.includes('gps')) {
        return this.createError(HomeScreenErrorCode.GPS_SERVICE_DISABLED, error, context);
      }
      if (message.includes('network')) {
        return this.createError(HomeScreenErrorCode.LOCATION_NETWORK_ERROR, error, context);
      }
      if (message.includes('không thể lấy được tọa độ gps')) {
        return this.createError(HomeScreenErrorCode.LOCATION_COORDS_INVALID, error, context);
      }
    }

    // Context-based error classification
    switch (context) {
      case 'loadCheckinData':
        return this.createError(HomeScreenErrorCode.CHECKIN_DATA_LOAD_FAILED, error, context);
      
      case 'checkin':
      case 'handleSubmitCheckin':
        return this.createError(HomeScreenErrorCode.CHECKIN_API_SUBMIT_FAILED, error, context);
      
      case 'location':
      case 'getCurrentLocation':
        return this.createError(HomeScreenErrorCode.LOCATION_GENERAL_ERROR, error, context);
      
      case 'locationService':
      case 'checkLocationServices':
        return this.createError(HomeScreenErrorCode.LOCATION_SERVICE_CHECK_FAILED, error, context);
      
      case 'initialization':
        return this.createError(HomeScreenErrorCode.INITIALIZATION_FAILED, error, context);
    }

    // Default fallback
    if (context.includes('location') || context.includes('gps')) {
      return this.createError(HomeScreenErrorCode.LOCATION_GENERAL_ERROR, error, context);
    }
    if (context.includes('checkin')) {
      return this.createError(HomeScreenErrorCode.CHECKIN_UNKNOWN_ERROR, error, context);
    }

    return this.createError(HomeScreenErrorCode.INITIALIZATION_FAILED, error, context);
  }

  /**
   * Lấy định nghĩa error từ code
   */
  getErrorDefinition(code: HomeScreenErrorCode): HomeScreenErrorDef {
    return HOME_SCREEN_ERROR_DEFINITIONS[code];
  }

  /**
   * Xử lý và hiển thị error cho user
   */
  handleError(
    error: HomeScreenError,
    onRetry?: () => void,
    customTitle?: string
  ): void {
    const errorDef = this.getErrorDefinition(error.code);
    
    // Log chi tiết cho developer
    console.error(`[HomeScreen-${errorDef.category.toUpperCase()}] ${errorDef.systemMessage}`, {
      code: error.code,
      context: error.context,
      originalError: error.originalError,
      metadata: error.metadata
    });

    // Hiển thị cho user dựa trên severity
    this.displayErrorToUser(errorDef, onRetry, customTitle);
  }

  /**
   * Hiển thị error UI cho user
   */
  private displayErrorToUser(
    errorDef: HomeScreenErrorDef,
    onRetry?: () => void,
    customTitle?: string
  ): void {
    const title = customTitle || this.getErrorTitle(errorDef.severity);
    
    if (errorDef.severity === 'high') {
      // High severity - Always show Alert
      const buttons: any[] = [];
      
      if (errorDef.actionable && onRetry) {
        buttons.push({
          text: errorDef.retryAction || 'Thử lại',
          onPress: onRetry
        });
      }
      
      buttons.push({
        text: 'OK',
        style: 'cancel'
      });

      Alert.alert(title, errorDef.userMessage, buttons);
      
    } else if (errorDef.severity === 'medium') {
      // Medium severity - Toast on Android, Alert on iOS
      if (Platform.OS === 'android') {
        ToastAndroid.show(errorDef.userMessage, ToastAndroid.LONG);
      } else {
        Alert.alert(title, errorDef.userMessage, [{ text: 'OK' }]);
      }
      
    } else {
      // Low severity - Only toast on Android, silent on iOS
      if (Platform.OS === 'android') {
        ToastAndroid.show(errorDef.userMessage, ToastAndroid.SHORT);
      }
    }
  }

  /**
   * Lấy title cho error dialog
   */
  private getErrorTitle(severity: string): string {
    switch (severity) {
      case 'high':
        return '⚠️ Lỗi nghiêm trọng';
      case 'medium':
        return '⚠️ Thông báo';
      case 'low':
      default:
        return 'Thông tin';
    }
  }

  // === Specialized error creators ===

  /**
   * Tạo error cho checkin không có GPS
   */
  createCheckinNoGpsError(locationError?: string): HomeScreenError {
    return this.createError(
      HomeScreenErrorCode.CHECKIN_NO_VALID_GPS,
      null,
      'checkin',
      { locationError }
    );
  }

  /**
   * Tạo error cho checkin không có location data
   */
  createCheckinNoLocationError(): HomeScreenError {
    return this.createError(
      HomeScreenErrorCode.CHECKIN_NO_LOCATION_DATA,
      null,
      'checkin'
    );
  }

  // === Specialized error handlers ===

  /**
   * Xử lý lỗi checkin với custom UI
   */
  handleCheckinError(
    error: HomeScreenError,
    onRetryGps?: () => void,
    checkinType?: 'IN' | 'OUT'
  ): void {
    const errorDef = this.getErrorDefinition(error.code);
    
    console.error(`[HomeScreen-Checkin] ${errorDef.systemMessage}`, {
      code: error.code,
      checkinType,
      metadata: error.metadata
    });

    if (error.code === HomeScreenErrorCode.CHECKIN_NO_VALID_GPS) {
      Alert.alert(
        "⚠️ Không thể chấm công",
        error.metadata?.locationError || "Cần có vị trí GPS để chấm công. Vui lòng thử lấy vị trí lại.",
        [
          { text: "Thử lại GPS", onPress: onRetryGps },
          { text: "OK", style: "cancel" }
        ]
      );
    } else if (error.code === HomeScreenErrorCode.CHECKIN_API_SUBMIT_FAILED) {
      const originalError = error.originalError;
      const errorMsg = originalError?.message || originalError?.response?.data?.message || 'Lỗi không xác định';
      
      Alert.alert(
        "❌ Lỗi chấm công",
        `Không thể ${checkinType === 'IN' ? 'vào ca' : 'ra ca'}.\nLỗi: ${errorMsg}`,
        [{ text: "OK" }]
      );
    } else {
      this.handleError(error, onRetryGps);
    }
  }

  /**
   * Xử lý lỗi location với specialized logic
   */
  handleLocationError(
    error: HomeScreenError,
    onRetryLocation?: () => void
  ): void {
    const errorDef = this.getErrorDefinition(error.code);
    
    // Chỉ hiển thị location error nếu severity >= medium
    if (errorDef.severity === 'medium' || errorDef.severity === 'high') {
      this.handleError(error, onRetryLocation);
    } else {
      // Low severity - chỉ log
      console.warn(`[HomeScreen-Location] ${errorDef.systemMessage}`, {
        code: error.code,
        context: error.context
      });
    }
  }
}

// Export singleton instance
export const homeScreenErrorHandler = HomeScreenErrorHandler.getInstance();