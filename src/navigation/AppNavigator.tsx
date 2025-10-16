// src/navigation/AppNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity, Text } from "react-native";
import LoginScreen from "../screens/LoginScreen"; // Màn hình Login
import HomeScreen from "../screens/HomeScreen"; // Màn hình Home
import { useAuth } from "../hooks/useAuth";
import LeaveManagementScreen from "../screens/LeaveManagementScreen"; //
import { ApplicationLeave } from "../screens";
import InventoryManagementScreen from "../screens/Inventory/InventoryManagementScreen";
import InventoryEntryScreens from "../screens/Inventory/InventoryEntryScreens";
import InventoryDetailScreen from "../screens/Inventory/InventoryDetailScreen";
import InsertInventoryScreen from "@/screens/Inventory/InsertInventoryScreen";

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
      <Stack.Screen name="LeaveManagement" component={LeaveManagementScreen} />
      <Stack.Screen name="ApplicationLeave" component={ApplicationLeave} />
      <Stack.Screen name="InventoryManagement" component={InventoryManagementScreen} />
      <Stack.Screen name="InventoryEntry" component={InventoryEntryScreens} />
      <Stack.Screen name="InventoryDetailScreen" component={InventoryDetailScreen} />
      <Stack.Screen name="InsertInventoryScreen" component={InsertInventoryScreen} />
    </Stack.Navigator>
  );
}


