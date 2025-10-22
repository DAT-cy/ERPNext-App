// src/router/MenuRouterController.ts
import menuRouter, { MENU_ROUTE_MAP } from './MenuRouter';
import { hasSubItemAccess } from '../utils/menuPermissions';

/**
 * MenuRouterController - Lớp trung gian giữa menu UI và MenuRouter
 * Xử lý việc kiểm tra quyền truy cập và điều hướng
 */
class MenuRouterController {
  /**
   * Xử lý sự kiện click vào menu và điều hướng tới màn hình tương ứng
   * @param menuId ID của menu chính
   * @param subMenuId ID của submenu
   * @param userRoles Roles của người dùng hiện tại
   * @param params Tham số tùy chỉnh truyền vào route
   * @returns boolean - true nếu điều hướng thành công, false nếu không
   */
  handleMenuNavigation(
    menuId: string,
    subMenuId: string,
    userRoles: string[],
    params?: any
  ): boolean {
    // Kiểm tra quyền truy cập menu
    if (!this.canAccessMenu(menuId, subMenuId, userRoles)) {
      return false;
    }

    // Thực hiện điều hướng
    const success = menuRouter.navigateByMenuId(menuId, subMenuId, params);
    return success;
  }

  /**
   * Xử lý sự kiện click vào nested submenu (3 cấp)
   * @param parentMenuId ID của menu cha (ví dụ: 'inventory')
   * @param menuId ID của menu con (ví dụ: 'inventory-operations') 
   * @param nestedSubMenuId ID của nested submenu (ví dụ: 'stock-entry')
   * @param userRoles Roles của người dùng hiện tại
   * @param params Tham số tùy chỉnh truyền vào route
   * @returns boolean - true nếu điều hướng thành công, false nếu không
   */
  handleNestedMenuNavigation(
    parentMenuId: string,
    menuId: string,
    nestedSubMenuId: string,
    userRoles: string[],
    params?: any
  ): boolean {
    console.log('🔍 [MenuRouterController] handleNestedMenuNavigation called:', { 
      parentMenuId, menuId, nestedSubMenuId 
    });
    
    // Kiểm tra quyền truy cập nested menu bằng hasSubItemAccess với nestedSubItemId
    const hasAccess = hasSubItemAccess(userRoles, parentMenuId, menuId, nestedSubMenuId);
    console.log('🔍 [MenuRouterController] hasAccess:', hasAccess);
    
    if (!hasAccess) {
      return false;
    }

    // Tạo route key cho nested menu
    const routeKey = `${menuId}:${nestedSubMenuId}`;
    console.log('🔍 [MenuRouterController] routeKey:', routeKey);
    
    // Kiểm tra xem có route mapping không
    if (!MENU_ROUTE_MAP[routeKey]) {
      console.log('🔍 [MenuRouterController] No route mapping found for:', routeKey);
      return false;
    }

    console.log('🔍 [MenuRouterController] Route mapping found:', MENU_ROUTE_MAP[routeKey]);

    // Thực hiện điều hướng
    const success = menuRouter.navigateByMenuId(menuId, nestedSubMenuId, params);
    console.log('🔍 [MenuRouterController] Navigation success:', success);
    return success;
  }

  /**
   * Xử lý sự kiện click vào bottom tab và điều hướng
   * @param tabKey Key của bottom tab
   * @param params Tham số tùy chỉnh truyền vào route
   * @returns boolean - true nếu điều hướng thành công, false nếu không
   */
  handleBottomTabNavigation(tabKey: string, params?: any): boolean {
    // Bottom tabs thường không cần kiểm tra quyền đặc biệt
    return menuRouter.navigateByBottomTab(tabKey, params);
  }

  /**
   * Kiểm tra xem user có quyền truy cập menu không
   * @param menuId ID của menu chính
   * @param subMenuId ID của submenu
   * @param userRoles Roles của người dùng hiện tại
   * @returns boolean - true nếu có quyền, false nếu không
   */
  canAccessMenu(
    menuId: string,
    subMenuId: string,
    userRoles: string[]
  ): boolean {
    // Kiểm tra có định nghĩa route cho menu này không
    const routeKey = `${menuId}:${subMenuId}`;
    if (!MENU_ROUTE_MAP[routeKey]) {
      return false;
    }

    // Kiểm tra quyền truy cập thông qua menuPermissions
    return hasSubItemAccess(userRoles, menuId, subMenuId);
  }
}

// Export singleton instance
const menuRouterController = new MenuRouterController();
export default menuRouterController;