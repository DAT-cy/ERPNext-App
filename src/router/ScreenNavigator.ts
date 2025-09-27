// src/router/ScreenNavigator.ts
import React from 'react';
import { useNavigation as useReactNavigation } from '@react-navigation/native';
import menuRouter, { RouteNames, RouteParams } from './MenuRouter';
import menuRouterController from './MenuRouterController';

// Định nghĩa các loại params có thể truyền cho màn hình
interface LeaveManagementParams {
  employeeId?: string;
  viewMode?: 'list' | 'calendar' | 'approval';
  startDate?: string;
}

/**
 * ScreenNavigator - Lớp quản lý tất cả các điều hướng từ screens
 * Tập trung hóa toàn bộ logic điều hướng vào router package
 */
class ScreenNavigator {
  /**
   * Xử lý đăng xuất từ screens
   * @param logoutFunction Hàm đăng xuất từ auth service
   */
  async handleLogout(logoutFunction: () => Promise<void>): Promise<void> {
    try {
      // Thực hiện đăng xuất
      await logoutFunction();
      
      // Reset navigation về Login screen
      menuRouter.resetToLogin();
      
      console.log('Đăng xuất thành công, đã điều hướng về trang Login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      
      // Ngay cả khi có lỗi, vẫn cố gắng điều hướng về Login
      menuRouter.resetToLogin();
    }
  }
  
  /**
   * Xử lý điều hướng từ Sidebar Menu
   * @param menuId ID của menu chính
   * @param subMenuId ID của submenu
   * @param userRoles Roles của người dùng
   * @param closeSidebar Callback để đóng sidebar sau khi điều hướng
   */
  handleSidebarMenuNavigation(
    menuId: string, 
    subMenuId: string, 
    userRoles: string[],
    closeSidebar?: () => void
  ): void {
    // Thực hiện điều hướng dựa trên menu ID
    menuRouterController.handleMenuNavigation(menuId, subMenuId, userRoles);
    
    // Đóng sidebar nếu có callback
    if (closeSidebar) {
      closeSidebar();
    }
  }
  
  /**
   * Xử lý điều hướng sau khi kiểm tra đăng nhập
   * @param isLoggedIn Trạng thái đăng nhập
   */
  handleAuthNavigation(isLoggedIn: boolean): void {
    if (!isLoggedIn) {
      menuRouter.resetToLogin();
    }
  }
  
  /**
   * Xử lý điều hướng về trang chính sau khi đăng nhập thành công
   */
  handleSuccessfulLogin(): void {
    menuRouter.resetToHome();
  }
  
  /**
   * Xử lý quay lại màn hình trước đó
   */
  handleGoBack(): void {
    menuRouter.goBack();
  }
  
  /**
   * Xử lý chuyển tab trong Bottom Tab Navigator
   * @param tabName Tên của tab cần chuyển đến
   */
  handleTabChange(tabName: string): void {
    // Implementation depends on your tab navigation structure
    console.log(`Chuyển đến tab ${tabName}`);
  }
  
  /**
   * Điều hướng tới màn hình Quản lý nhân viên
   */
  navigateToEmployeeManagement(): void {
    // Sử dụng menuPermissions để lấy menu ID và điều hướng
    const menuId = 'employee'; // ID giả định cho menu employee
    const subMenuId = 'management'; // ID giả định cho submenu management
    
    menuRouter.navigateByMenuId(menuId, subMenuId);
  }
  
  /**
   * Điều hướng tới màn hình Quản lý nghỉ phép với các tham số
   * @param params Các tham số điều hướng
   */
  navigateToLeaveManagement(params?: LeaveManagementParams): void {
    // Sử dụng RouteNames đúng chuẩn
    menuRouter.navigate(RouteNames.LEAVE_MANAGEMENT, {
      selectedDate: params?.startDate,
      initialTab: params?.viewMode === 'approval' ? 'pending' : 'approved',
    });
  }
  
  /**
   * Điều hướng tới màn hình Tuyển dụng
   */
  navigateToRecruitment(): void {
    // Sử dụng menuPermissions để lấy menu ID và điều hướng
    const menuId = 'hr'; // ID giả định cho menu HR
    const subMenuId = 'recruitment'; // ID giả định cho submenu recruitment
    
    menuRouter.navigateByMenuId(menuId, subMenuId);
  }
  
  /**
   * Điều hướng tới màn hình Đánh giá hiệu suất
   */
  navigateToPerformance(): void {
    // Sử dụng menuPermissions để lấy menu ID và điều hướng
    const menuId = 'hr'; // ID giả định cho menu HR
    const subMenuId = 'performance'; // ID giả định cho submenu performance
    
    menuRouter.navigateByMenuId(menuId, subMenuId);
  }
  
  /**
   * Điều hướng tới màn hình Tổng quan (Dashboard)
   * @param params Tham số điều hướng cho trang tổng quan
   */
  navigateToDashboard(params?: { timeRange?: 'day' | 'week' | 'month' | 'year'; refreshData?: boolean }): void {
    // Điều hướng trực tiếp đến màn hình tổng quan
    menuRouter.navigate(RouteNames.DASHBOARD, params);
  }
  
  /**
   * Điều hướng tới màn hình Tổng quan thông qua menu ID
   */
  navigateToDashboardByMenu(): void {
    // Sử dụng menuID để điều hướng đến trang tổng quan
    const menuId = 'overview'; 
    const subMenuId = 'dashboard';
    
    menuRouter.navigateByMenuId(menuId, subMenuId);
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
 * Hook để sử dụng ScreenNavigator trong functional components
 * @returns Đối tượng ScreenNavigator
 */
export function useScreenNavigation() {
  return screenNavigator;
}

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