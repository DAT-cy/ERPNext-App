// src/router/menuRouter.ts
import { NavigationContainerRef } from '@react-navigation/native';
import { createRef } from 'react';
import { MENU_DEFINITIONS } from '../utils/menuPermissions';

// Tạo navigation reference để có thể gọi các phương thức navigation từ bên ngoài component
export const navigationRef = createRef<NavigationContainerRef<any>>();

/**
 * Định nghĩa các màn hình trong ứng dụng
 */
export enum RouteNames {
  LOGIN = 'Login',
  HOME = 'Home',
  LEAVE_MANAGEMENT = 'LeaveManagement',
  DASHBOARD = 'Dashboard',
}

/**
 * Định nghĩa tham số cho mỗi route
 */
export type RouteParams = {
  [RouteNames.LOGIN]: undefined;
  [RouteNames.HOME]: undefined;
  [RouteNames.LEAVE_MANAGEMENT]: {
    selectedDate?: string;
    initialTab?: 'pending' | 'approved' | 'rejected';
  };
  [RouteNames.DASHBOARD]: {
    timeRange?: 'day' | 'week' | 'month' | 'year';
    refreshData?: boolean;
  };
  // Thêm các tham số cho routes khác
};

/**
 * Map giữa menu ID và màn hình tương ứng
 * Key là 'menuId:subMenuId', value là thông tin route
 */
export const MENU_ROUTE_MAP: Record<string, { 
  routeName: keyof RouteParams;
  defaultParams?: any;
}> = {
  // HR Menu Routes
  'hr:leaves-hr': { routeName: RouteNames.LEAVE_MANAGEMENT },
  'hr:recruitment': { routeName: RouteNames.LEAVE_MANAGEMENT }, // Giả sử sử dụng LeaveManagement cho demo
  'hr:performance': { routeName: RouteNames.LEAVE_MANAGEMENT }  // Giả sử sử dụng LeaveManagement cho demo
};

/**
 * Class quản lý điều hướng giữa các màn hình trong ứng dụng
 */
class MenuRouter {
 
  /**
   * Điều hướng dựa trên menu ID và submenu ID
   * @param menuId ID của menu chính
   * @param subMenuId ID của submenu
   * @param customParams Tham số tùy chỉnh (override defaultParams)
   * @returns true nếu điều hướng thành công, false nếu không tìm thấy route
   */
  navigateByMenuId(
    menuId: string, 
    subMenuId: string, 
    customParams?: any
  ): boolean {
    const routeKey = `${menuId}:${subMenuId}`;
    const routeInfo = MENU_ROUTE_MAP[routeKey];

    if (!routeInfo) {
      console.warn(`Không tìm thấy định nghĩa route cho menu: ${menuId}, submenu: ${subMenuId}`);
      return false;
    }

    const params = customParams || routeInfo.defaultParams;
    this.navigate(routeInfo.routeName, params);
    return true;
  }

  /**
   * Điều hướng đến một màn hình cụ thể
   * @param routeName Tên route cần điều hướng đến
   * @param params Tham số truyền cho màn hình
   */
  navigate<T extends keyof RouteParams>(
    routeName: T,
    params?: RouteParams[T]
  ): void {
    if (navigationRef.current) {
      navigationRef.current.navigate({
        name: routeName as string,
        params: params as object,
      });
    } else {
      console.warn('Không thể điều hướng: Navigation chưa được khởi tạo');
    }
  }

  /**
   * Quay lại màn hình trước đó
   */
  goBack(): void {
    if (navigationRef.current && navigationRef.current.canGoBack()) {
      navigationRef.current.goBack();
    }
  }

  /**
   * Điều hướng đến màn hình Dashboard
   * @param params Tham số cho màn hình Dashboard
   */
  navigateToDashboard(params?: RouteParams[RouteNames.DASHBOARD]): void {
    this.navigate(RouteNames.DASHBOARD, params);
  }

  /**
   * Reset navigation stack và điều hướng đến màn hình mới
   * @param routeName Tên route đến
   * @param params Tham số truyền cho màn hình
   */
  resetTo<T extends keyof RouteParams>(
    routeName: T,
    params?: RouteParams[T]
  ): void {
    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ 
          name: routeName as string, 
          params: params as object 
        }],
      });
    }
  }
  /**
   * Điều hướng đến màn hình Quản lý nghỉ phép
   * @param params Tham số cho màn hình Quản lý nghỉ phép
   */
  navigateToLeaveManagement(params?: RouteParams[RouteNames.LEAVE_MANAGEMENT]): void {
    this.navigate(RouteNames.LEAVE_MANAGEMENT, params);
  }
  
  /**
   * Điều hướng đến màn hình nghỉ phép đã duyệt
   */
  navigateToApprovedLeaves(): void {
    this.navigateToLeaveManagement({ initialTab: 'approved' });
  }

  /**
   * Điều hướng đến màn hình nghỉ phép đang chờ duyệt
   */
  navigateToPendingLeaves(): void {
    this.navigateToLeaveManagement({ initialTab: 'pending' });
  }

  /**
   * Điều hướng đến màn hình Home
   */
  navigateToHome(): void {
    this.navigate(RouteNames.HOME);
  }

  /**
   * Điều hướng đến màn hình Login
   */
  navigateToLogin(): void {
    this.navigate(RouteNames.LOGIN);
  }

  /**
   * Reset stack và điều hướng về màn hình Login
   */
  resetToLogin(): void {
    this.resetTo(RouteNames.LOGIN);
  }

  /**
   * Reset stack và điều hướng về màn hình Home
   */
  resetToHome(): void {
    this.resetTo(RouteNames.HOME);
  }

  /**
   * Lấy thông tin route dựa trên menu ID và submenu ID
   * @param menuId ID của menu chính
   * @param subMenuId ID của submenu
   * @returns Thông tin route (tên route và default params) hoặc undefined nếu không tìm thấy
   */
  getRouteInfoByMenuId(menuId: string, subMenuId: string): { 
    routeName: keyof RouteParams;
    defaultParams?: any;
  } | undefined {
    const routeKey = `${menuId}:${subMenuId}`;
    return MENU_ROUTE_MAP[routeKey];
  }
}

// Export singleton instance
const menuRouter = new MenuRouter();
export default menuRouter;