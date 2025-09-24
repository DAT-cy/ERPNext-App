// src/navigation/AppNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import LoginScreen from "../features/auth/screens/LoginScreen"; // Màn hình Login
import HomeScreen from "../features/home/screens/HomeScreen"; // Màn hình Home
import { useAuth } from "../(app)/providers/AuthProvider";

const Stack = createStackNavigator();

// Component hiển thị khi đang loading
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Đang kiểm tra đăng nhập...</Text>
  </View>
);

export default function AppNavigator() {
  const { isLoading, isLoggedIn } = useAuth();

  // Hiển thị loading khi đang kiểm tra trạng thái auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }} 
      initialRouteName={isLoggedIn ? "Home" : "Login"}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
});
