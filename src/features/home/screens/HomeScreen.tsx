// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabBar, TopTabBar, SidebarMenu, BottomTabItem, TopTabItem } from "../../../shared/components";
import { useAuth } from "../../../(app)/providers/AuthProvider";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, isLoggedIn } = useAuth();

  // State
  const [activeBottomTab, setActiveBottomTab] = useState("checkin");
  const [activeTopTab, setActiveTopTab] = useState("today");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Tabs
  const bottomTabs: BottomTabItem[] = [
    { key: "checkin", title: "Trang chủ", icon: "🏠" },
    { key: "profile", title: "Hồ sơ", icon: "👤" },
  ];

  const topTabs: TopTabItem[] = [];

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [isLoggedIn, navigation]);

  const renderContent = () => {
    if (activeBottomTab === "checkin") {
      return (
        <View style={styles.content}>
          <Text>📌 Chào mừng, {user || "Người dùng"}!</Text>
          <Text>🏠 Đây là trang chủ</Text>
        </View>
      );
    }
    if (activeBottomTab === "profile") {
      return (
        <View style={styles.content}>
          <Text>👤 Đây là màn Profile</Text>
          <Text>User: {user || "Không xác định"}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Tabs + nút menu */}
      <TopTabBar
        tabs={topTabs}
        activeTab={activeTopTab}
        onTabPress={setActiveTopTab}
        onMenuPress={() => setIsSidebarVisible(true)}
      />


      {/* Content giữa */}
      <View style={styles.flexContent}>{renderContent()}</View>

      {/* Bottom Tabs */}
      <BottomTabBar
        tabs={bottomTabs}
        activeTab={activeBottomTab}
        onTabPress={setActiveBottomTab}
      />

      {/* Sidebar overlay */}
      <SidebarMenu
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
        onMenuItemPress={(id) => {
          console.log("Menu item:", id);
          setIsSidebarVisible(false);
        }}
        onSubItemPress={(id, subId) => {
          console.log("Sub item:", id, subId);
          setIsSidebarVisible(false);
        }}
        onLogout={async () => {
          await logout();
          // Không cần navigate thủ công, useEffect sẽ tự động điều hướng khi isLoggedIn = false
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  flexContent: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
});
