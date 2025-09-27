// components/SidebarMenu/index.ts
export { default as SidebarMenu } from './SidebarMenu';
export type { MenuItem, SubMenuItem, SidebarMenuProps } from './SidebarMenu';
export { withSidebarNavigation } from './withSidebarNavigation';

// Tạo SidebarMenu với navigation đã được cấu hình
import SidebarMenuComponent from './SidebarMenu';
import { withSidebarNavigation } from './withSidebarNavigation';

export const NavigationSidebarMenu = withSidebarNavigation(SidebarMenuComponent);