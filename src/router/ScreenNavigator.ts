// src/router/ScreenNavigator.ts
import React from 'react';
import menuRouterController from './MenuRouterController';
import { resetTo } from './navigationService';

class ScreenNavigator {
  async handleLogout(logoutFunction: () => Promise<void>): Promise<void> {
    try {
      // Thực hiện đăng xuất
      await logoutFunction();
      
      // Reset navigation về Login screen
      resetTo('Login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      
      // Ngay cả khi có lỗi, vẫn cố gắng điều hướng về Login
      resetTo('Login');
    }
  }
  
  handleSidebarMenuNavigation(
    menuId: string, 
    subMenuId: string, 
    userRoles: string[],
    closeSidebar?: () => void
  ): void {
    // Thực hiện điều hướng dựa trên menu ID
    const success = menuRouterController.handleMenuNavigation(menuId, subMenuId, userRoles);
    
    if (!success) {
      console.warn(`❌ Navigation failed for: ${menuId} -> ${subMenuId}`);
    }
    
    // Đóng sidebar nếu có callback
    if (closeSidebar) {
      closeSidebar();
    }
  }

  handleNestedSidebarMenuNavigation(
    parentMenuId: string,
    menuId: string, 
    nestedSubMenuId: string, 
    userRoles: string[],
    closeSidebar?: () => void
  ): void {
    // Thực hiện điều hướng nested menu
    const success = menuRouterController.handleNestedMenuNavigation(
      parentMenuId, 
      menuId, 
      nestedSubMenuId, 
      userRoles
    );
    
    if (!success) {
      // Handle failed navigation if needed
    }
    
    // Đóng sidebar nếu có callback
    if (closeSidebar) {
      closeSidebar();
    }
  }
}

// Export singleton instance
export const screenNavigator = new ScreenNavigator();

/**
 * Hook để sử dụng ScreenNavigator trong functional components
 * @returns instance của ScreenNavigator
 */
export function useScreenNavigator() {
  return screenNavigator;
}
export default screenNavigator;

/**
 * HOC (Higher Order Component) để cung cấp ScreenNavigator cho class components
 * @param WrappedComponent Component cần wrap
 * @returns Component mới với prop screenNavigator
 */
export function withScreenNavigation<P>(WrappedComponent: React.ComponentType<P & { screenNavigator: typeof screenNavigator }>) {
  const WithScreenNavigationComponent = (props: P) => {
    return React.createElement(WrappedComponent, {
      ...props,
      screenNavigator: screenNavigator
    } as P & { screenNavigator: typeof screenNavigator });
  };
  
  WithScreenNavigationComponent.displayName = `WithScreenNavigation(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithScreenNavigationComponent;
}