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

  /**
   * Phương thức tiện ích để xử lý các sự kiện menu từ UI components
   * @param event Sự kiện từ menu
   * @param userRoles Roles của user
   * @returns boolean - true nếu điều hướng thành công, false nếu không
   */
  handleMenuEvent(
    event: { menuId: string; subMenuId: string; params?: any },
    userRoles: string[]
  ): boolean {
    const { menuId, subMenuId, params } = event;
    return this.handleMenuNavigation(menuId, subMenuId, userRoles, params);
  }

  // === Các phương thức điều hướng trực tiếp ===
  // (Không qua menu, không cần kiểm tra quyền từ menu)

  navigateToLeaveManagement(params?: any): void {
    menuRouter.navigateToLeaveManagement(params);
  }

  navigateToHome(): void {
    menuRouter.navigateToHome();
  }

  navigateToLogin(): void {
    menuRouter.navigateToLogin();
  }

  resetToLogin(): void {
    menuRouter.resetToLogin();
  }

  resetToHome(): void {
    menuRouter.resetToHome();
  }

  goBack(): void {
    menuRouter.goBack();
  }

  /**
   * Kiểm tra xem menu có route tương ứng không
   * @param menuId ID của menu chính
   * @param subMenuId ID của submenu
   * @returns boolean - true nếu có route tương ứng, false nếu không
   */
  hasRoute(menuId: string, subMenuId: string): boolean {
    const routeKey = `${menuId}:${subMenuId}`;
    return Boolean(MENU_ROUTE_MAP[routeKey]);
  }
}

// Export singleton instance
const menuRouterController = new MenuRouterController();
export default menuRouterController;