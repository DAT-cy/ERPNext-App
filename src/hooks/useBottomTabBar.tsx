// src/hooks/useBottomTabBar.tsx
import { useCallback } from 'react';
import { BottomTabItem } from '../components/TabBar';
import useTabBarHandlers from './useTabBarHandlers';
import menuRouterController from '../router/MenuRouterController';

/**
 * Custom hook để quản lý BottomTabBar với logic cụ thể
 * @param tabs Danh sách các tab
 * @param initialTab Tab ban đầu
 * @param onTabChange Callback khi tab thay đổi (optional)
 * @returns Object chứa props và handlers cho BottomTabBar
 */
export function useBottomTabBar(
  tabs: BottomTabItem[],
  initialTab: string = '',
  onTabChange?: (tabKey: string) => void
) {
  const { 
    activeBottomTab, 
    handleBottomTabPress: originalHandleBottomTabPress 
  } = useTabBarHandlers('', initialTab, false);

  // Custom handler để xử lý logic bổ sung khi tab thay đổi và điều hướng
  const handleBottomTabPress = useCallback((tabKey: string) => {
    console.log(`🔥 Bottom tab pressed: ${tabKey}`);
    
    // Cập nhật state tab
    originalHandleBottomTabPress(tabKey);
    
    // Điều hướng thông qua router
    const navigationSuccess = menuRouterController.handleBottomTabNavigation(tabKey);
    

    // Gọi callback nếu có
    if (onTabChange) {
      onTabChange(tabKey);
    }
  }, [originalHandleBottomTabPress, onTabChange]);

  // Trả về tất cả props cần thiết cho BottomTabBar
  return {
    // State
    activeBottomTab,
    
    // Props cho BottomTabBar component
    bottomTabBarProps: {
      tabs,
      activeTab: activeBottomTab,
      onTabPress: handleBottomTabPress
    },
    
    // Individual handlers nếu cần sử dụng riêng
    handleBottomTabPress
  };
}

export default useBottomTabBar;