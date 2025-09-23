// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "../navigation/AppNavigator"; // Đường dẫn tới AppNavigator
import { AuthProvider } from "../(app)/providers"; // Đảm bảo AuthProvider được bao bọc

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
