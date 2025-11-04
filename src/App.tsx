// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator"; 
import { AuthProvider } from "./hooks"; 
import { navigationRef } from "./router";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
          <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
