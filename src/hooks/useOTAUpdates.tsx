import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

export interface OTAUpdateStatus {
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  error: Error | null;
  manifest: Updates.Manifest | null;
}

/**
 * Hook để quản lý OTA (Over-the-Air) Updates từ Expo
 * Tự động kiểm tra và tải các bản cập nhật mới khi ứng dụng khởi động
 */
export function useOTAUpdates() {
  const [status, setStatus] = useState<OTAUpdateStatus>({
    isChecking: false,
    isDownloading: false,
    isUpdateAvailable: false,
    isUpdatePending: false,
    error: null,
    manifest: null,
  });

  /**
   * Kiểm tra xem có bản cập nhật mới không
   */
  const checkForUpdates = async () => {
    // Chỉ chạy trong production build, không chạy trong development
    if (__DEV__) {
      console.log('OTA Updates: Đang ở chế độ development, bỏ qua kiểm tra cập nhật');
      return;
    }

    // Kiểm tra xem Updates có khả dụng không
    if (Updates.isEnabled === false) {
      console.log('OTA Updates: Không được bật');
      return;
    }

    try {
      setStatus((prev) => ({ ...prev, isChecking: true, error: null }));

      // Kiểm tra bản cập nhật mới
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setStatus((prev) => ({
          ...prev,
          isUpdateAvailable: true,
          manifest: update.manifest,
        }));

        // Tự động tải bản cập nhật
        setStatus((prev) => ({ ...prev, isDownloading: true }));
        const result = await Updates.fetchUpdateAsync();

        if (result.isNew) {
          setStatus((prev) => ({
            ...prev,
            isDownloading: false,
            isUpdatePending: true,
          }));

          // Hiển thị thông báo và reload ứng dụng
          Alert.alert(
            'Cập nhật mới',
            'Đã tải bản cập nhật mới. Ứng dụng sẽ khởi động lại để áp dụng cập nhật.',
            [
              {
                text: 'Khởi động lại ngay',
                onPress: async () => {
                  await Updates.reloadAsync();
                },
                style: 'default',
              },
              {
                text: 'Sau',
                style: 'cancel',
                onPress: () => {
                  // Người dùng có thể reload sau bằng cách gọi reloadUpdate()
                },
              },
            ]
          );
        }
      } else {
        setStatus((prev) => ({
          ...prev,
          isChecking: false,
          isUpdateAvailable: false,
        }));
        console.log('OTA Updates: Không có bản cập nhật mới');
      }
    } catch (error) {
      console.error('OTA Updates: Lỗi khi kiểm tra cập nhật', error);
      setStatus((prev) => ({
        ...prev,
        isChecking: false,
        isDownloading: false,
        error: error as Error,
      }));
    }
  };

  /**
   * Reload ứng dụng để áp dụng bản cập nhật đã tải
   */
  const reloadUpdate = async () => {
    if (status.isUpdatePending) {
      try {
        await Updates.reloadAsync();
      } catch (error) {
        console.error('OTA Updates: Lỗi khi reload', error);
        setStatus((prev) => ({
          ...prev,
          error: error as Error,
        }));
      }
    }
  };

  /**
   * Kiểm tra cập nhật khi component mount (khi app khởi động)
   */
  useEffect(() => {
    checkForUpdates();
  }, []);

  return {
    ...status,
    checkForUpdates,
    reloadUpdate,
  };
}

