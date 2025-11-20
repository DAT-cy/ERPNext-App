// App.tsx
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator"; 
import { AuthProvider, useOTAUpdates, useVersionCheck } from "./hooks"; 
import { navigationRef } from "./router";

/**
 * Component wrapper để xử lý OTA Updates và Version Check
 * Tự động kiểm tra và tải cập nhật khi app khởi động
 */
function AppContent() {
  // Tự động kiểm tra cập nhật OTA khi app khởi động
  useOTAUpdates();

  // Kiểm tra phiên bản mới từ App Store/Play Store
  const { versionInfo, showUpdateDialog } = useVersionCheck(true);

  // Hiển thị dialog cập nhật nếu có phiên bản mới
  useEffect(() => {
    if (versionInfo?.needsUpdate) {
      // Delay một chút để app khởi động hoàn toàn trước khi hiển thị dialog
      const timer = setTimeout(() => {
        showUpdateDialog(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [versionInfo, showUpdateDialog]);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
