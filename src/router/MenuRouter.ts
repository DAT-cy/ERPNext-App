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
  APPLICATION_LEAVE = 'ApplicationLeave',
  INVENTORY_MANAGEMENT = 'InventoryManagement',
  INVENTORY_ENTRY = 'InventoryEntry',
  PURCHASE_RECEIPT = 'PurchaseReceiptList',
  CHECK_LIST_INVENTORY = 'CheckListInventoryScreen',
  SHIPMENT_MANAGEMENT = 'ShipmentManagement',
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
  [RouteNames.APPLICATION_LEAVE]: {
    leaveId: string;
  };
  [RouteNames.INVENTORY_MANAGEMENT]: undefined;
  [RouteNames.INVENTORY_ENTRY]: undefined;
  [RouteNames.PURCHASE_RECEIPT]: undefined;
  [RouteNames.CHECK_LIST_INVENTORY]: undefined;
  [RouteNames.SHIPMENT_MANAGEMENT]: undefined;
};

/**
 * Map giữa menu ID và màn hình tương ứng
 * Key là 'menuId:subMenuId', value là thông tin route
 */
export const MENU_ROUTE_MAP: Record<string, { 
  routeName: keyof RouteParams;
  defaultParams?: any;
}> = {
  // Bottom Tab Routes
  'bottom:home': { routeName: RouteNames.HOME },
  
  // HR Menu Routes
  'hr:leaves-hr': { routeName: RouteNames.LEAVE_MANAGEMENT },
  'hr:apply-hr': { routeName: RouteNames.APPLICATION_LEAVE, defaultParams: { leaveId: '' } },
  // Leave Management Screen feature navigation
  'leaves-hr:apply-hr': { routeName: RouteNames.APPLICATION_LEAVE, defaultParams: { leaveId: '' } },
  
  // Inventory Menu Routes
  'inventory:inventory-operations': { routeName: RouteNames.INVENTORY_MANAGEMENT },
  'inventory-operations:stock-entry': { routeName: RouteNames.INVENTORY_ENTRY },
  'inventory-operations:purchase-receipt': { routeName: RouteNames.PURCHASE_RECEIPT },
  'inventory-operations:check-quantity-inventory': { routeName: RouteNames.CHECK_LIST_INVENTORY },
  'shipment:delivery-trip': { routeName: RouteNames.SHIPMENT_MANAGEMENT },
};

class MenuRouter {
  navigateByMenuId(
    menuId: string, 
    subMenuId: string, 
    customParams?: any
  ): boolean {
    const routeKey = `${menuId}:${subMenuId}`;
    const routeInfo = MENU_ROUTE_MAP[routeKey];

    if (!routeInfo) {
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

  goBack(): void {
    if (navigationRef.current && navigationRef.current.canGoBack()) {
      navigationRef.current.goBack();
    }
  }


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
  
  navigateToLeaveApplication(leaveId: string): void {
    this.navigate(RouteNames.APPLICATION_LEAVE, { leaveId });
  }
  navigateToShipmentManagement(params?: RouteParams[RouteNames.SHIPMENT_MANAGEMENT]): void {
    this.navigate(RouteNames.SHIPMENT_MANAGEMENT, params);
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
   * Xử lý navigation cho bottom tab
   * @param tabKey Key của bottom tab ("home", "profile", etc.)
   * @param params Tham số tùy chỉnh
   * @returns boolean - true nếu điều hướng thành công
   */
  navigateByBottomTab(tabKey: string, params?: any): boolean {
    const routeKey = `bottom:${tabKey}`;
    const routeInfo = MENU_ROUTE_MAP[routeKey];

    if (!routeInfo) {
      console.warn(`Không tìm thấy định nghĩa route cho bottom tab: ${tabKey}`);
      return false;
    }

    const finalParams = params || routeInfo.defaultParams;
    this.navigate(routeInfo.routeName, finalParams);
    return true;
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

  /**
   * Debug method - Log tất cả routes có sẵn
   */
  logAvailableRoutes(): void {
    // Debug method - can be called when needed
    Object.entries(MENU_ROUTE_MAP).forEach(([key, value]) => {
      // Log available routes
    });
  }
}

// Export singleton instance
const menuRouter = new MenuRouter();
export default menuRouter;