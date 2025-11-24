// App.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator"; 
import { AuthProvider, useOTAUpdates, useVersionCheck } from "./hooks"; 
import { navigationRef } from "./router";
import UpdatePrompt from "./components/UpdatePrompt";

/**
 * Component wrapper để xử lý OTA Updates và Version Check
 * Tự động kiểm tra và tải cập nhật khi app khởi động
 */
function AppContent() {
  // Tự động kiểm tra cập nhật OTA khi app khởi động
  useOTAUpdates();

  // Kiểm tra phiên bản mới từ App Store/Play Store
  const { versionInfo, openStore } = useVersionCheck(true);
  const [dismissedThisSession, setDismissedThisSession] = useState(false);
  const shouldShowUpdatePrompt = !!versionInfo?.needsUpdate && !dismissedThisSession;

  // Hiển thị dialog cập nhật nếu có phiên bản mới
  useEffect(() => {
    if (!versionInfo?.needsUpdate) {
      setDismissedThisSession(false);
    }
  }, [versionInfo]);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
      <UpdatePrompt
        visible={shouldShowUpdatePrompt}
        versionInfo={versionInfo}
        onUpdate={openStore}
        onLater={() => setDismissedThisSession(true)}
      />
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
