import { useEffect, useState, useCallback } from 'react';
import { versionCheckService, VersionInfo } from '../services/versionCheckService';

export interface VersionCheckStatus {
  isChecking: boolean;
  versionInfo: VersionInfo | null;
  error: Error | null;
}

/**
 * Hook để kiểm tra phiên bản mới của ứng dụng
 * Tự động kiểm tra khi component mount hoặc khi gọi checkVersion()
 */
export function useVersionCheck(autoCheck: boolean = true) {
  const [status, setStatus] = useState<VersionCheckStatus>({
    isChecking: false,
    versionInfo: null,
    error: null,
  });

  /**
   * Kiểm tra phiên bản mới
   */
  const checkVersion = useCallback(async () => {
    // Chỉ chạy trong production build, không chạy trong development
    if (__DEV__) {
      console.log('VersionCheck: Đang ở chế độ development, bỏ qua kiểm tra phiên bản');
      return;
    }

    try {
      setStatus((prev) => ({ ...prev, isChecking: true, error: null }));

      const versionInfo = await versionCheckService.getVersionInfo();

      setStatus({
        isChecking: false,
        versionInfo,
        error: null,
      });

      return versionInfo;
    } catch (error) {
      console.error('VersionCheck: Lỗi khi kiểm tra phiên bản', error);
      setStatus({
        isChecking: false,
        versionInfo: null,
        error: error as Error,
      });
      return null;
    }
  }, []);

  /**
   * Hiển thị dialog cập nhật
   */
  const showUpdateDialog = useCallback(async (forceUpdate: boolean = false) => {
    try {
      await versionCheckService.showUpdateDialog(forceUpdate);
    } catch (error) {
      console.error('VersionCheck: Lỗi khi hiển thị dialog cập nhật', error);
    }
  }, []);

  /**
   * Mở store để cập nhật
   */
  const openStore = useCallback(async () => {
    try {
      await versionCheckService.openStore();
    } catch (error) {
      console.error('VersionCheck: Lỗi khi mở store', error);
    }
  }, []);

  /**
   * Tự động kiểm tra khi component mount
   */
  useEffect(() => {
    if (autoCheck) {
      checkVersion();
    }
  }, [autoCheck, checkVersion]);

  return {
    ...status,
    checkVersion,
    showUpdateDialog,
    openStore,
  };
}



