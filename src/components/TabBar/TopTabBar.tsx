// shared/components/TopTabBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface TopTabItem {
  key: string;
  title: string;
}

interface TopTabBarProps {
  tabs: TopTabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  onMenuPress?: () => void; // 👈 thêm prop để mở Sidebar
}

export default function TopTabBar({
  tabs,
  activeTab,
  onTabPress,
  onMenuPress,
}: TopTabBarProps) {
  return (
    <View style={styles.container}>
      {onMenuPress && (
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => onTabPress(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    fontSize: 25,
    color: '#333333',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '700',
  },
});
