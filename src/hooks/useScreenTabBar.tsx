import useTopTabBar from './useTopTabBar';
import useBottomTabBar from './useBottomTabBar';
import useTabBarHandlers from './useTabBarHandlers';
import { SCREEN_TAB_CONFIG } from '../config/defaultTabs';

type ScreenType = keyof typeof SCREEN_TAB_CONFIG;
export function useScreenTabBar(
  screenType: ScreenType,
  onTopTabChange?: (tabKey: string) => void,
  onBottomTabChange?: (tabKey: string) => void
) {
  // Lấy config cho màn hình
  const config = SCREEN_TAB_CONFIG[screenType];
  
  // Sidebar handlers
  const { isSidebarVisible, handleMenuPress, handleMenuClose } = useTabBarHandlers();
  
  // Top TabBar
  const topTabBar = useTopTabBar(
    config.topTabs,
    config.initialTopTab,
    onTopTabChange,
    handleMenuPress
  );
  
  // Bottom TabBar
  const bottomTabBar = useBottomTabBar(
    config.bottomTabs,
    config.initialBottomTab,
    onBottomTabChange
  );
  
  return {
    // TabBar components props
    topTabBarProps: topTabBar.topTabBarProps,
    bottomTabBarProps: bottomTabBar.bottomTabBarProps,
    
    // Sidebar props
    sidebarProps: {
      isVisible: isSidebarVisible,
      onClose: handleMenuClose
    },
    
    // Active states
    activeTopTab: topTabBar.activeTopTab,
    activeBottomTab: bottomTabBar.activeBottomTab,
    isSidebarVisible,
    
    // Individual handlers nếu cần
    handleMenuPress,
    handleMenuClose,
    handleTopTabPress: topTabBar.handleTopTabPress,
    handleBottomTabPress: bottomTabBar.handleBottomTabPress
  };
}

export default useScreenTabBar;