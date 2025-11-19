// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator"; 
import { AuthProvider, useOTAUpdates } from "./hooks"; 
import { navigationRef } from "./router";

/**
 * Component wrapper để xử lý OTA Updates
 * Tự động kiểm tra và tải cập nhật khi app khởi động
 */
function AppContent() {
  // Tự động kiểm tra cập nhật khi app khởi động
  useOTAUpdates();

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
