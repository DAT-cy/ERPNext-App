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
      console.warn(
        `User không có quyền truy cập menu: ${menuId}, submenu: ${subMenuId}`
      );
      return false;
    }

    // Thực hiện điều hướng
    return menuRouter.navigateByMenuId(menuId, subMenuId, params);
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