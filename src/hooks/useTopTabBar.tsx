// src/hooks/useTopTabBar.tsx
import { useCallback } from 'react';
import { TopTabItem } from '../components/TabBar';
import useTabBarHandlers from './useTabBarHandlers';

/**
 * Custom hook để quản lý TopTabBar với logic cụ thể
 * @param tabs Danh sách các tab
 * @param initialTab Tab ban đầu
 * @param onTabChange Callback khi tab thay đổi (optional)
 * @returns Object chứa props và handlers cho TopTabBar
 */
export function useTopTabBar(
  tabs: TopTabItem[],
  initialTab: string = '',
  onTabChange?: (tabKey: string) => void,
  onMenuPress?: () => void
) {
  const { 
    activeTopTab, 
    handleTopTabPress: originalHandleTopTabPress
  } = useTabBarHandlers(initialTab, '', false);

  // Custom handler để xử lý logic bổ sung khi tab thay đổi
  const handleTopTabPress = useCallback((tabKey: string) => {
    originalHandleTopTabPress(tabKey);
    if (onTabChange) {
      onTabChange(tabKey);
    }
  }, [originalHandleTopTabPress, onTabChange]);

  // Trả về tất cả props cần thiết cho TopTabBar
  return {
    // State
    activeTopTab,
    
    // Props cho TopTabBar component
    topTabBarProps: {
      tabs,
      activeTab: activeTopTab,
      onTabPress: handleTopTabPress,
      onMenuPress: onMenuPress
    },
    
    // Individual handlers nếu cần sử dụng riêng
    handleTopTabPress
  };
}

export default useTopTabBar;