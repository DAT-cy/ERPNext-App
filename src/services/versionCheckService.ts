import VersionCheck from 'react-native-version-check';
import { Platform, Linking, Alert } from 'react-native';

export interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  needsUpdate: boolean;
  storeUrl: string;
  packageName?: string;
}

/**
 * Service để kiểm tra phiên bản mới của ứng dụng từ App Store/Play Store
 */
class VersionCheckService {
  /**
   * Lấy thông tin phiên bản hiện tại
   */
  async getCurrentVersion(): Promise<string> {
    try {
      const version = await VersionCheck.getCurrentVersion();
      return version;
    } catch (error) {
      console.error('VersionCheck: Lỗi khi lấy phiên bản hiện tại', error);
      return '1.0.0';
    }
  }

  /**
   * Lấy thông tin phiên bản mới nhất từ store
   */
  async getLatestVersion(): Promise<string> {
    try {
      const version = await VersionCheck.getLatestVersion();
      return version;
    } catch (error) {
      console.error('VersionCheck: Lỗi khi lấy phiên bản mới nhất', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem có phiên bản mới không
   */
  async needsUpdate(): Promise<boolean> {
    try {
      const needsUpdate = await VersionCheck.needUpdate();
      return needsUpdate?.isNeeded || false;
    } catch (error) {
      console.error('VersionCheck: Lỗi khi kiểm tra cập nhật', error);
      return false;
    }
  }

  /**
   * Lấy URL của store (App Store hoặc Play Store)
   */
  async getStoreUrl(): Promise<string> {
    try {
      return await VersionCheck.getStoreUrl();
    } catch (error) {
      console.error('VersionCheck: Lỗi khi lấy store URL', error);
      // Fallback URLs dựa trên app.json
      if (Platform.OS === 'ios') {
        return 'https://apps.apple.com/vn/app/remak-services/id6755102512';
      } else {
        return 'https://apps.apple.com/vn/app/remak-services/id6755102512';
      }
    }
  }

  /**
   * Lấy package name
   */
  async getPackageName(): Promise<string> {
    try {
      return await VersionCheck.getPackageName();
    } catch (error) {
      console.error('VersionCheck: Lỗi khi lấy package name', error);
      return Platform.OS === 'ios' ? 'com.remak.erpremak' : 'com.remak.erpremak';
    }
  }

  /**
   * Lấy tất cả thông tin phiên bản
   */
  async getVersionInfo(): Promise<VersionInfo> {
    try {
      const [currentVersion, latestVersion, needsUpdate, storeUrl, packageName] = await Promise.all([
        this.getCurrentVersion(),
        this.getLatestVersion(),
        this.needsUpdate(),
        this.getStoreUrl(),
        this.getPackageName(),
      ]);

      return {
        currentVersion,
        latestVersion,
        needsUpdate,
        storeUrl,
        packageName,
      };
    } catch (error) {
      console.error('VersionCheck: Lỗi khi lấy thông tin phiên bản', error);
      const currentVersion = await this.getCurrentVersion();
      const [storeUrl, packageName] = await Promise.all([
        this.getStoreUrl(),
        this.getPackageName(),
      ]);
      return {
        currentVersion,
        latestVersion: currentVersion,
        needsUpdate: false,
        storeUrl,
        packageName,
      };
    }
  }

  /**
   * Mở store để người dùng cập nhật
   */
  async openStore(): Promise<void> {
    try {
      const storeUrl = await this.getStoreUrl();
      const canOpen = await Linking.canOpenURL(storeUrl);
      
      if (canOpen) {
        await Linking.openURL(storeUrl);
      } else {
        Alert.alert(
          'Lỗi',
          'Không thể mở cửa hàng ứng dụng. Vui lòng cập nhật ứng dụng thủ công.',
        );
      }
    } catch (error) {
      console.error('VersionCheck: Lỗi khi mở store', error);
      Alert.alert(
        'Lỗi',
        'Không thể mở cửa hàng ứng dụng. Vui lòng cập nhật ứng dụng thủ công.',
      );
    }
  }

  /**
   * Hiển thị dialog thông báo có phiên bản mới
   */
  async showUpdateDialog(forceUpdate: boolean = false): Promise<void> {
    try {
      const versionInfo = await this.getVersionInfo();
      
      if (!versionInfo.needsUpdate) {
        return;
      }

      const message = `Đã có phiên bản mới (${versionInfo.latestVersion}) trên ${Platform.OS === 'ios' ? 'App Store' : 'Play Store'}.\n\nPhiên bản hiện tại: ${versionInfo.currentVersion}\nPhiên bản mới: ${versionInfo.latestVersion}\n\nBạn có muốn cập nhật ngay bây giờ không?`;

      Alert.alert(
        'Cập nhật mới',
        message,
        forceUpdate
          ? [
              {
                text: 'Cập nhật',
                onPress: () => this.openStore(),
                style: 'default',
              },
            ]
          : [
              {
                text: 'Cập nhật',
                onPress: () => this.openStore(),
                style: 'default',
              },
              {
                text: 'Sau',
                style: 'cancel',
              },
            ],
        { cancelable: !forceUpdate },
      );
    } catch (error) {
      console.error('VersionCheck: Lỗi khi hiển thị dialog cập nhật', error);
    }
  }
}

export const versionCheckService = new VersionCheckService();
export default versionCheckService;

