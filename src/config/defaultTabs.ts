// src/config/defaultTabs.ts
import { TopTabItem, BottomTabItem } from '../components/TabBar';


// Default TopTabs - có thể customize cho từng màn hình
export const getDefaultTopTabs = (): TopTabItem[] => {
  return [];
};

// Default BottomTabs - cố định cho toàn bộ app
export const getDefaultBottomTabs = (): BottomTabItem[] => [
  { 
    key: "home",
    title: "Trang chủ", 
    icon: require('../assets/home.png')
  },
  {
    key: "profile",
    title: "Hồ sơ",
    icon: require('../assets/profile.png')
  }
];

// Screen-specific tab configurations - tất cả màn hình dùng chung
export const SCREEN_TAB_CONFIG = {
  home: {
    topTabs: getDefaultTopTabs(), // Trống
    bottomTabs: getDefaultBottomTabs(), // Chỉ có "Trang chủ" và "Hồ sơ"
    initialTopTab: '', // Không có tab nào active
    initialBottomTab: '' // Không có tab nào active
  },
  checkin: {
    topTabs: getDefaultTopTabs(), // Trống
    bottomTabs: getDefaultBottomTabs(), // Chỉ có "Trang chủ" và "Hồ sơ"
    initialTopTab: '', // Không có tab nào active
    initialBottomTab: '' // Không có tab nào active
  },
  leave_hr: {
    topTabs: getDefaultTopTabs(), // Trống
    bottomTabs: getDefaultBottomTabs(), // Chỉ có "Trang chủ" và "Hồ sơ"
    initialTopTab: '', // Không có tab nào active
    initialBottomTab: '' // Không có tab nào active
  },
  profile: {
    topTabs: getDefaultTopTabs(), // Trống
    bottomTabs: getDefaultBottomTabs(), // Chỉ có "Trang chủ" và "Hồ sơ"
    initialTopTab: '', // Không có tab nào active
    initialBottomTab: '' // Không có tab nào active
  },
  employee: {
    topTabs: getDefaultTopTabs(), // Trống
    bottomTabs: getDefaultBottomTabs(), // Chỉ có "Trang chủ" và "Hồ sơ"
    initialTopTab: '', // Không có tab nào active
    initialBottomTab: '' // Không có tab nào active
  },
} as const;