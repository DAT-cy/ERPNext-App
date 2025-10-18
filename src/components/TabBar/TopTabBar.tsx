// shared/components/TopTabBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { fs, ss, wpPlatform, hpPlatform, fsPlatform, ssPlatform } from '../../utils/responsive';
import { useResponsiveTopTabBar } from '../../hooks/useResponsiveTopTabBar';

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
  // Use responsive hook
  const config = useResponsiveTopTabBar(tabs.length);

  const renderTabs = () => {
    const tabComponents = tabs.map((tab) => (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tab,
          {
            paddingVertical: ss(config.verticalPadding),
            paddingHorizontal: ss(config.horizontalPadding),
          },
          config.shouldUseScrollable && { minWidth: config.tabMinWidth },
          activeTab === tab.key && styles.activeTab
        ]}
        onPress={() => onTabPress(tab.key)}
      >
        <Text
          style={[
            styles.tabText,
            { fontSize: fs(config.fontSize) },
            activeTab === tab.key && styles.activeTabText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {tab.title}
        </Text>
      </TouchableOpacity>
    ));

    if (config.shouldUseScrollable) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {tabComponents}
        </ScrollView>
      );
    }

    return (
      <View style={styles.tabsContainer}>
        {tabComponents}
      </View>
    );
  };

  return (
    <View style={[
      styles.container, 
      { paddingHorizontal: config.containerPadding }
    ]}>
      {onMenuPress && (
        <TouchableOpacity 
          style={[
            styles.menuButton, 
            { marginTop: config.menuTopMargin }
          ]} 
          onPress={onMenuPress}
        >
          <Text style={[
            styles.menuIcon,
            { fontSize: fs(config.iconSize) }
          ]}>☰</Text>
        </TouchableOpacity>
      )}

      {/* Tabs */}
      {renderTabs()}
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
    paddingTop: hpPlatform(0, 2), // iOS: 0.5%, Android: 4% (iPhone cách top ít hơn)
    paddingBottom: hpPlatform(0, 0), // iOS: 1%, Android: 2% (iPhone padding bottom ít hơn)
    paddingHorizontal: wpPlatform(0, 2.5), // iOS: 4%, Android: 3.5
    // paddingHorizontal được set dynamic trong component
  },
  menuButton: {
    padding: ssPlatform(1, 6), // iOS: 1, Android: 6 (iPhone padding ít hơn)
    paddingVertical: ssPlatform(3, 8), // iOS: 8, Android: 10 (iPhone vertical padding ít hơn)
    paddingHorizontal: ssPlatform(5, 14), // iOS: 12, Android: 14 (iPhone horizontal padding ít hơn)
    marginLeft: wpPlatform(5, 5), // iOS: 6%, Android: 5%
    minWidth: ssPlatform(20, 44), // iOS: 40, Android: 44 (iPhone nhỏ hơn)
    minHeight: ssPlatform(10, 44), // iOS: 40, Android: 44 (iPhone nhỏ hơn)
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop và fontSize được set dynamic trong component
  },
  menuIcon: {
    color: '#333333',
    // fontSize được set dynamic trong component
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: ss(16), // Extra padding for last item
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    // padding và minWidth được set dynamic trong component
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    // fontSize được set dynamic trong component
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '700',
  },
});
