// src/utils/menuBuilder.ts
// ========================= MENU BUILDER UTILITY =========================
// Sử dụng file này để dễ dàng thêm menu và role mới

import { MenuItemDef, SubMenuItemDef, ROLE_GROUPS } from './menuPermissions';

/**
 * Helper function để tạo menu item mới
 * @param config - Cấu hình menu item
 * @returns MenuItemDef
 */
export function createMenuitem(config: {
  id: string;
  title: string;
  icon: string;
  allowedRoles: string[];
  subItems?: Array<{
    id: string;
    title: string;
    icon: string;
    allowedRoles: string[];
  }>;
}): MenuItemDef {
  return {
    id: config.id,
    title: config.title,
    icon: config.icon,
    hasSubItems: config.subItems ? config.subItems.length > 0 : false,
    allowedRoles: config.allowedRoles,
    subItems: config.subItems?.map(sub => ({
      id: sub.id,
      title: sub.title,
      icon: sub.icon,
      allowedRoles: sub.allowedRoles
    }))
  };
}

/**
 * Helper function để tạo sub-menu item
 * @param config - Cấu hình sub-menu item
 * @returns SubMenuItemDef
 */
export function createSubMenuItem(config: {
  id: string;
  title: string;
  icon: string;
  allowedRoles: string[];
}): SubMenuItemDef {
  return {
    id: config.id,
    title: config.title,
    icon: config.icon,
    allowedRoles: config.allowedRoles
  };
}

// ========================= COMMON ROLE COMBINATIONS =========================
export const COMMON_ROLE_SETS = {
  // Tất cả users
  ALL_USERS: [
    ...ROLE_GROUPS.BASIC_USER,
    ...ROLE_GROUPS.EMPLOYEE,
    ...ROLE_GROUPS.HR_ROLES,
    ...ROLE_GROUPS.SALES_ROLES,
    ...ROLE_GROUPS.ACCOUNTING_ROLES,
    ...ROLE_GROUPS.REMAK_ROLES,
    ...ROLE_GROUPS.ADMIN_ROLES
  ],
  
  // Chỉ employees
  EMPLOYEE_ONLY: [
    ...ROLE_GROUPS.EMPLOYEE,
    ...ROLE_GROUPS.REMAK_ROLES,
    ...ROLE_GROUPS.ADMIN_ROLES
  ],
  
  // Chỉ managers
  MANAGERS_ONLY: [
    'HR Manager',
    'Sales Manager', 
    'Accounts Manager',
    ...ROLE_GROUPS.ADMIN_ROLES
  ],
  
  // Department heads + admins
  DEPARTMENT_HEADS: [
    'HR Manager',
    'Sales Manager',
    'Accounts Manager',
    ...ROLE_GROUPS.ADMIN_ROLES
  ]
} as const;

// ========================= EXAMPLES =========================
// Ví dụ cách tạo menu mới:

/*
// 1. Tạo menu Marketing cho Marketing Manager và Marketing User
export const MARKETING_MENU = createMenuitem({
  id: 'marketing',
  title: 'Marketing',
  icon: '📢',
  allowedRoles: ['Marketing Manager', 'Marketing User', ...ROLE_GROUPS.ADMIN_ROLES],
  subItems: [
    {
      id: 'campaigns',
      title: 'Chiến dịch',
      icon: '🎯',
      allowedRoles: ['Marketing Manager', 'Marketing User', ...ROLE_GROUPS.ADMIN_ROLES]
    },
    {
      id: 'leads',
      title: 'Khách hàng tiềm năng',
      icon: '👥',
      allowedRoles: ['Marketing Manager', 'Marketing User', ...ROLE_GROUPS.ADMIN_ROLES]
    }
  ]
});

// 2. Tạo menu chỉ cho specific role
export const CEO_MENU = createMenuitem({
  id: 'executive',
  title: 'Điều hành',
  icon: '👔',
  allowedRoles: ['CEO', 'Managing Director', ...ROLE_GROUPS.ADMIN_ROLES],
  subItems: [
    {
      id: 'dashboard',
      title: 'Bảng điều khiển tổng',
      icon: '📊',
      allowedRoles: ['CEO', 'Managing Director', ...ROLE_GROUPS.ADMIN_ROLES]
    }
  ]
});

// 3. Thêm vào MENU_DEFINITIONS trong menuPermissions.ts:
// export const MENU_DEFINITIONS: MenuItemDef[] = [
//   ...existing menus...,
//   MARKETING_MENU,
//   CEO_MENU
// ];
*/

// ========================= QUICK ROLE CHECKER =========================
/**
 * Quick helper để kiểm tra role có trong danh sách không
 * @param userRoles - Roles của user
 * @param requiredRoles - Roles cần thiết
 * @returns boolean
 */
export function quickRoleCheck(userRoles: string[], requiredRoles: string[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role));
}

/**
 * Helper để lấy tất cả roles trong một role group
 * @param groupName - Tên role group
 * @returns string[] - Danh sách roles
 */
export function getRoleGroup(groupName: keyof typeof ROLE_GROUPS): string[] {
  return [...ROLE_GROUPS[groupName]];
}