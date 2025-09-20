import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./providers";
import LoginScreen from "../features/auth/screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";

function Root() {
  const { isLoading, isLoggedIn } = useAuth();
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar />
      {isLoggedIn ? <HomeScreen /> : <LoginScreen />}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
