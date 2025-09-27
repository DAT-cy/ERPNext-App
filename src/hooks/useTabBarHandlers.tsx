// src/hooks/useTabBarHandlers.tsx
import { useState, useCallback, ReactNode } from 'react';

/**
 * Hook cung cấp các handlers cho TabBar
 * @param initialTopTab Tab ban đầu cho TopTabBar
 * @param initialBottomTab Tab ban đầu cho BottomTabBar
 * @param initialSidebarState Trạng thái ban đầu của Sidebar (mở/đóng)
 * @returns Các state và handlers cần thiết cho TabBar
 */
export function useTabBarHandlers(
  initialTopTab: string = '',
  initialBottomTab: string = '',
  initialSidebarState: boolean = false
) {
  // State
  const [activeTopTab, setActiveTopTab] = useState<string>(initialTopTab);
  const [activeBottomTab, setActiveBottomTab] = useState<string>(initialBottomTab);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(initialSidebarState);
  
  // Handlers
  const handleTopTabPress = useCallback((tabKey: string) => {
    setActiveTopTab(tabKey);
  }, []);
  
  const handleBottomTabPress = useCallback((tabKey: string) => {
    setActiveBottomTab(tabKey);
  }, []);
  
  const handleMenuPress = useCallback(() => {
    setIsSidebarVisible(true);
  }, []);
  
  const handleMenuClose = useCallback(() => {
    setIsSidebarVisible(false);
  }, []);
  
  // Hook API
  return {
    // State
    activeTopTab,
    activeBottomTab,
    isSidebarVisible,
    
    // Setters
    setActiveTopTab,
    setActiveBottomTab,
    setIsSidebarVisible,
    
    // Handlers
    handleTopTabPress,
    handleBottomTabPress,
    handleMenuPress,
    handleMenuClose
  };
}

export default useTabBarHandlers;