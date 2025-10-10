import React from 'react';
import { useScreenNavigator } from '../../router/ScreenNavigator';
import { useAuth } from '../../hooks/useAuth';
import { SidebarMenuProps } from './SidebarMenu';

/**
 * HOC để kết nối SidebarMenu với ScreenNavigator
 * Tự động truyền các callbacks cần thiết cho SidebarMenu
 * 
 * @param WrappedMenu Component SidebarMenu cần wrap
 * @returns SidebarMenu với các navigation handlers đã được cấu hình
 */
export const withSidebarNavigation = (
  WrappedMenu: React.ComponentType<SidebarMenuProps>
) => {
  // Return component mới có các props đã được xử lý
  return function EnhancedSidebarMenu(props: Omit<SidebarMenuProps, 'onMenuItemPress' | 'onSubItemPress' | 'onLogout'>) {
    const screenNavigator = useScreenNavigator();
    const { roles, logout } = useAuth();
    
    // Handler cho việc click vào menu item
    const handleMenuItemPress = (itemId: string) => {
      screenNavigator.handleSidebarMenuNavigation(itemId, '', roles, props.onClose);
    };
    
    // Handler cho việc click vào submenu item
    const handleSubItemPress = (menuId: string, subMenuId: string) => {
      // Navigate to menu
      
      // Special handling for nested submenu items
      // Nếu subMenuId là một nested item, cần gọi nested navigation
      if (subMenuId === 'stock-entry') {
        // Đây là nested submenu thuộc về inventory-operations
        screenNavigator.handleNestedSidebarMenuNavigation(
          'inventory', 
          'inventory-operations', 
          subMenuId, 
          roles, 
          props.onClose
        );
      } else {
        // Standard submenu navigation
        screenNavigator.handleSidebarMenuNavigation(menuId, subMenuId, roles, props.onClose);
      }
    };
    
    // Handler cho việc đăng xuất
    const handleLogout = async () => {
      await screenNavigator.handleLogout(logout);
    };
    
    // Truyền tất cả props gốc + các handlers đã được xử lý
    return (
      <WrappedMenu
        {...props}
        onMenuItemPress={handleMenuItemPress}
        onSubItemPress={handleSubItemPress}
        onLogout={handleLogout}
      />
    );
  };
};