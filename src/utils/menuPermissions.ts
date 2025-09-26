// src/utils/menuPermissions.ts

// ========================= MENU DEFINITIONS =========================
export interface MenuItemDef {
  id: string;
  title: string;
  icon: string | any; // Can be emoji string or require() result for local images
  hasSubItems?: boolean;
  subItems?: SubMenuItemDef[];
  allowedRoles: string[];
}

export interface SubMenuItemDef {
  id: string; 
  title: string;
  icon: string | any; // Can be emoji string or require() result for local images
  allowedRoles: string[];
}

// ========================= ROLE GROUPS =========================
export const ROLE_GROUPS = {
  // Basic User Roles
  BASIC_USER: ['All', 'Guest', 'Desk User'],
  
  // Employee Roles
  EMPLOYEE: ['Employee'],
  
  // HR Department
  HR_ROLES: ['HR Manager', 'HR User'],
  
  // Sales Department  
  SALES_ROLES: ['Sales Manager', 'Sales User'],
  
  // Accounting Department
  ACCOUNTING_ROLES: ['Accounts Manager', 'Accounts User'],
  
  // System Admin
  ADMIN_ROLES: ['Administrator', 'System Manager'],
  
  // Remak Specific
  REMAK_ROLES: ['Remak User', 'Remak'],
} as const;

// ========================= MENU CONFIGURATIONS =========================
export const MENU_DEFINITIONS: MenuItemDef[] = [
  //=== HR ===
  {
    id: 'hr',
    title: 'HR',
    icon: require('../assets/hr/hr.png'), // Using existing icon as example
    hasSubItems: true,
    allowedRoles: [
      ...ROLE_GROUPS.HR_ROLES,
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.BASIC_USER
    ],
    subItems: [
      {
        id: 'overview-hr',
        title: 'Tổng quan',
        icon: require('../assets/overview.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      },
      {
        id: 'recruitment-hr',
        title: 'Tuyển dụng',
        icon: require('../assets/hr/recruitment.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      },
      {
        id: 'employees-lifecycle-hr',
        title: 'Lý Lịch Công Tác',
        icon: require('../assets/hr/employee-lifecycle.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      },
      {
        id: 'performance-hr',
        title: 'Hiêu Suất',
        icon: require('../assets/hr/performance.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      },
      {
        id: 'shift-attendance-hr',
        title: 'Ca Làm Việc & Điểm Danh',
        icon: require('../assets/hr/shift-attendance.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      },
      {
        id: 'expense-claim-hr',
        title: 'Yêu Cầu Thanh Toán',
        icon: require('../assets/hr/expense-claim.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      },
      {
        id: 'leaves-hr',
        title: 'Nghỉ Phép',
        icon: require('../assets/hr/leaves.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      }
    ]
  },
  // === EMPLOYEE MENU ===
  {
    id: 'employee',
    title: 'Nhân viên', 
    icon: require('../assets/employee/foulder.png'), // Using existing icon as example
    hasSubItems: true,
    allowedRoles: [
      ...ROLE_GROUPS.EMPLOYEE,
      ...ROLE_GROUPS.REMAK_ROLES,
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.BASIC_USER
    ],
    subItems: [
      {
        id: 'overview-employee',
        title: 'Tổng quan',
        icon: require('../assets/overview.png'), 
        allowedRoles: [
          ...ROLE_GROUPS.EMPLOYEE,
          ...ROLE_GROUPS.REMAK_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      },
      {
        id: 'issue-employee',
        title: 'Vấn đề cần xử lý',
        icon: require("../assets/employee/issue.png"),
        allowedRoles: [
          ...ROLE_GROUPS.EMPLOYEE,
          ...ROLE_GROUPS.REMAK_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.BASIC_USER
        ]
      },
      {
        id: 'tasks-employee',
        title: 'Công việc',
        icon: require('../assets/employee/tasks.png'),
        allowedRoles: [
          ...ROLE_GROUPS.EMPLOYEE,
          ...ROLE_GROUPS.REMAK_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES
        ]
      },
      {
        id: 'tasks-manager-employee',
        title: 'Quản lý công việc',
        icon: require('../assets/employee/tasks-manager.png'),
        allowedRoles: [
          ...ROLE_GROUPS.EMPLOYEE,
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES
        ]
      }
    ]
  },
  // === SALES MENU (Nhân viên kinh doanh) ===
  {
    id: 'sales',
    title: 'Kinh doanh',
    icon: '💼',
    hasSubItems: true,
    allowedRoles: [
      ...ROLE_GROUPS.SALES_ROLES,
      ...ROLE_GROUPS.ADMIN_ROLES
    ],
    subItems: [
      {
        id: 'dashboard',
        title: 'Bảng điều khiển',
        icon: '📊',
        allowedRoles: [
          ...ROLE_GROUPS.SALES_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES
        ]
      },
      {
        id: 'leads',
        title: 'Khách hàng tiềm năng',
        icon: '🎯',
        allowedRoles: [
          ...ROLE_GROUPS.SALES_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES
        ]
      },
      {
        id: 'opportunities',
        title: 'Cơ hội bán hàng',
        icon: '💡',
        allowedRoles: [
          ...ROLE_GROUPS.SALES_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES
        ]
      },
      {
        id: 'quotations',
        title: 'Báo giá',
        icon: '📋',
        allowedRoles: [
          ...ROLE_GROUPS.SALES_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES
        ]
      },
      {
        id: 'orders',
        title: 'Đơn hàng',
        icon: '🛒',
        allowedRoles: [
          ...ROLE_GROUPS.SALES_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES
        ]
      }
    ]
  },





  
];

// ========================= LEGACY COMPATIBILITY =========================
// Giữ lại cho tương thích với code cũ
export const MENU_PERMISSIONS = MENU_DEFINITIONS.reduce((acc, menu) => {
  acc[menu.id.toUpperCase()] = menu.allowedRoles;
  return acc;
}, {} as Record<string, string[]>);

export const SUB_ITEM_PERMISSIONS = MENU_DEFINITIONS.reduce((acc, menu) => {
  if (menu.subItems) {
    acc[menu.id.toUpperCase()] = menu.subItems.reduce((subAcc, subItem) => {
      subAcc[subItem.id] = subItem.allowedRoles;
      return subAcc;
    }, {} as Record<string, string[]>);
  }
  return acc;
}, {} as Record<string, Record<string, string[]>>);



// ========================= UTILITY FUNCTIONS =========================

/**
 * Kiểm tra user có quyền truy cập menu không
 * @param userRoles - Danh sách roles của user
 * @param menuId - ID của menu cần kiểm tra
 * @returns boolean - true nếu có quyền
 */
export function hasMenuAccess(userRoles: string[], menuId: string): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  const menuDef = MENU_DEFINITIONS.find(menu => menu.id === menuId);
  if (!menuDef) {
    return false;
  }
  
  // Kiểm tra có ít nhất 1 role khớp
  const hasAccess = userRoles.some(role => menuDef.allowedRoles.includes(role));
  
  console.log(`🔐 Menu ${menuDef.title}: User roles [${userRoles.join(', ')}] -> Access: ${hasAccess}`);
  
  return hasAccess;
}

/**
 * Kiểm tra user có quyền truy cập sub-item không
 * @param userRoles - Danh sách roles của user  
 * @param menuId - ID của menu cha
 * @param subItemId - ID của sub-item
 * @returns boolean - true nếu có quyền
 */
export function hasSubItemAccess(
  userRoles: string[],
  menuId: string, 
  subItemId: string
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  const menuDef = MENU_DEFINITIONS.find(menu => menu.id === menuId);
  if (!menuDef || !menuDef.subItems) {
    return false;
  }
  
  const subItem = menuDef.subItems.find(sub => sub.id === subItemId);
  if (!subItem) {
    return false;
  }
  
  // Kiểm tra có ít nhất 1 role khớp
  const hasAccess = userRoles.some(role => subItem.allowedRoles.includes(role));
  
  console.log(`🔐 SubItem ${menuDef.title}.${subItem.title}: User roles [${userRoles.join(', ')}] -> Access: ${hasAccess}`);
  
  return hasAccess;
}

/**
 * Lấy danh sách menu items có quyền truy cập cho user
 * @param userRoles - Danh sách roles của user
 * @returns MenuItemDef[] - Danh sách menu items được phép
 */
export function getAccessibleMenus(userRoles: string[]): MenuItemDef[] {
  if (!userRoles || userRoles.length === 0) {
    return [];
  }

  return MENU_DEFINITIONS.filter(menu => {
    const hasMenuAccess = userRoles.some(role => menu.allowedRoles.includes(role));
    
    if (hasMenuAccess && menu.subItems) {
      // Filter sub-items theo quyền
      menu.subItems = menu.subItems.filter(subItem => 
        userRoles.some(role => subItem.allowedRoles.includes(role))
      );
    }
    
    return hasMenuAccess;
  });
}

/**
 * Kiểm tra user có role cụ thể không
 * @param userRoles - Danh sách roles của user
 * @param targetRole - Role cần kiểm tra
 * @returns boolean - true nếu có role
 */
export function hasRole(userRoles: string[], targetRole: string): boolean {
  return userRoles.includes(targetRole);
}

/**
 * Kiểm tra user có bất kỳ role nào trong nhóm không
 * @param userRoles - Danh sách roles của user
 * @param roleGroup - Nhóm roles cần kiểm tra
 * @returns boolean - true nếu có ít nhất 1 role trong nhóm
 */
export function hasAnyRoleInGroup(userRoles: string[], roleGroup: string[]): boolean {
  return userRoles.some(role => roleGroup.includes(role));
}
