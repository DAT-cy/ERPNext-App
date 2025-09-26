// src/navigation/AppNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen"; // Màn hình Login
import HomeScreen from "../screens/HomeScreen"; // Màn hình Home
import { useAuth } from "../hooks/useAuth";

const Stack = createStackNavigator();



export default function AppNavigator() {
  const { isLoggedIn } = useAuth();

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


