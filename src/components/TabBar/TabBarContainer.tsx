// src/components/TabBar/TabBarContainer.tsx
import React from 'react';
import { View } from 'react-native';
import TopTabBar, { TopTabItem } from './TopTabBar';
import BottomTabBar, { BottomTabItem } from './BottomTabBar';
import { NavigationSidebarMenu } from '../SidebarMenu';

export interface TabBarContainerProps {
  // Props for TopTabBar
  topTabs?: TopTabItem[];
  activeTopTab?: string;
  onTopTabPress?: (tabKey: string) => void;
  
  // Props for BottomTabBar
  bottomTabs: BottomTabItem[];
  activeBottomTab: string;
  onBottomTabPress: (tabKey: string) => void;
  
  // Props for SidebarMenu
  isSidebarVisible: boolean;
  onMenuPress?: () => void;
  onMenuClose: () => void;
  
  // Container style
  containerStyle?: any;
  
  // Children content
  children: React.ReactNode;
}
export default function TabBarContainer({
  // TopTabBar props
  topTabs = [],
  activeTopTab = '',
  onTopTabPress,
  
  // BottomTabBar props
  bottomTabs,
  activeBottomTab,
  onBottomTabPress,
  
  // SidebarMenu props
  isSidebarVisible,
  onMenuPress,
  onMenuClose,
  
  // Container style
  containerStyle,
  
  // Children
  children
}: TabBarContainerProps) {
  // Chỉ hiển thị TopTabBar nếu có tabs
  const showTopTabBar = topTabs && topTabs.length > 0;
  
  return (
    <View style={[{ flex: 1 }, containerStyle]}>
      {/* Top Tab Bar - Optional */}
      {showTopTabBar && (
        <TopTabBar
          tabs={topTabs}
          activeTab={activeTopTab || ''}
          onTabPress={onTopTabPress || (() => {})}
          onMenuPress={onMenuPress}
        />
      )}
      
      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
      
      {/* Bottom Tab Bar */}
      <BottomTabBar
        tabs={bottomTabs}
        activeTab={activeBottomTab}
        onTabPress={onBottomTabPress}
      />
      
      {/* Sidebar Menu */}
      <NavigationSidebarMenu
        isVisible={isSidebarVisible}
        onClose={onMenuClose}
      />
    </View>
  );
}