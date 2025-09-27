import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export interface BottomTabItem {
  key: string;
  title: string;
  icon: string | any; // Có thể là string (emoji) hoặc require() result (image source)
}

interface BottomTabBarProps {
  tabs: BottomTabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

// Helper function để render icon (text hoặc image)
const renderIcon = (icon: string | any, isActive: boolean) => {
  if (typeof icon === 'string') {
    // Nếu là string thì render như text/emoji
    return (
      <Text style={[
        styles.tabIcon,
        isActive && styles.activeTabIcon
      ]}>
        {icon}
      </Text>
    );
  } else {
    // Nếu là image source thì render như Image
    return (
      <Image 
        source={icon} 
        style={[
          styles.tabIconImage,
          { tintColor: isActive ? '#007AFF' : '#666666' }
        ]}
        resizeMode="contain"
      />
    );
  }
};

export default function BottomTabBar({ tabs, activeTab, onTabPress }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
        >
          {renderIcon(tab.icon, activeTab === tab.key)}
          <Text style={[
            styles.tabText,
            activeTab === tab.key && styles.activeTabText
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#666666',
  },
  activeTabIcon: {
    color: '#007AFF',
  },
  tabIconImage: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '700',
  },
});
