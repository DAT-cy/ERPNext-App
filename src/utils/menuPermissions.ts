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
  description?: string; // Optional description for detailed menu items
  backgroundColor?: string; // Optional background color for feature cards
  hasSubItems?: boolean; // Optional for nested submenu
  subItems?: SubMenuItemDef[]; // Optional nested submenu items
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
  // Stock/Inventory Department
  STOCK_ROLES: ['Stock Manager', 'Stock User'],

  // System Admin
  ADMIN_ROLES: ['Administrator', 'System Manager'],

  // Remak Specific
  REMAK_ROLES: ['Remak User', 'Remak'],

  SHIPMENT_ROLES: ['Driver User', 'Delivery User','Driver Managers'],

} as const;

// ========================= MENU CONFIGURATIONS =========================
export const MENU_DEFINITIONS: MenuItemDef[] = [
  // === INVENTORY ===
  {
    id: 'inventory',
    title: 'Tồn Kho',
    icon: require('../assets/inventory/inventory.png'),
    hasSubItems: true,
    allowedRoles: [
      ...ROLE_GROUPS.STOCK_ROLES,
      ...ROLE_GROUPS.ADMIN_ROLES,
    ],
    subItems: [
      {
        id: 'inventory-operations',
        title: 'Nghiệp Vụ Tồn Kho',
        icon: require('../assets/inventory/nghiep-vu-ton-kho.png'),
        hasSubItems: true,
        allowedRoles: [
          ...ROLE_GROUPS.STOCK_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
        ],
        subItems: [
          {
            id: 'stock-entry',
            title: 'Nhập Xuất Kho',
            icon: '↔️',
            description: 'Quản lý việc nhập và xuất kho, bao gồm việc đăng ký các giao dịch kho để đảm bảo lưu trữ chính xác và hiệu quả.',
            backgroundColor: '#f59e0b',
            allowedRoles: [
              ...ROLE_GROUPS.STOCK_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES,
            ]
          },
          {
            id: 'delivery-note',
            title: 'Phiếu Giao Hàng',
            icon: '🚚',
            description: 'Quản lý và theo dõi các đơn giao hàng, đảm bảo giao đúng, đủ và lưu trữ thông tin chính xác.',
            backgroundColor: '#34d399', // xanh lá nhạt
            allowedRoles: [
              ...ROLE_GROUPS.STOCK_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES,
            ]
          },
          {
            id: 'purchase-receipt',
            title: 'Phiếu Nhập Hàng',
            icon: '📥',
            description: 'Ghi nhận các giao dịch nhập hàng từ nhà cung cấp, đảm bảo lưu kho đầy đủ và chính xác.',
            backgroundColor: '#fbbf24', // vàng nhạt
            allowedRoles: [
              ...ROLE_GROUPS.STOCK_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES,
            ]
          },
          {
            id: 'check-quantity-inventory',
            title: 'Kiểm kê Tồn Kho',
            icon: '📊',
            description: 'Quét QR hoặc nhập mã sản phẩm để kiểm tra số lượng tồn kho nhanh chóng và chính xác.',
            backgroundColor: '#a78bfa', // tím nhạt
            allowedRoles: [
              ...ROLE_GROUPS.STOCK_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES,
            ]
          }
        ]
      }
    ]
  },

  //=== HR ===
  {
    id: 'hr',
    title: 'HR',
    icon: require('../assets/hr/hr.png'), // Using existing icon as example
    hasSubItems: true,
    allowedRoles: [
      ...ROLE_GROUPS.HR_ROLES,
      ...ROLE_GROUPS.ADMIN_ROLES,
    ],
    subItems: [
      {
        id: 'overview-hr',
        title: 'Tổng quan',
        icon: require('../assets/hr/hr.png'), // Using existing icon as example
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
        ]
      },
      {
        id: 'recruitment-hr',
        title: 'Tuyển dụng',
        icon: require('../assets/hr/hr.png'), // Using existing icon as example
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
        ]
      },
      {
        id: 'employees-lifecycle-hr',
        title: 'Lý Lịch Công Tác',
        icon: require('../assets/hr/employee-lifecycle.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
        ]
      },
      {
        id: 'performance-hr',
        title: 'Hiêu Suất',
        icon: require('../assets/hr/performance.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
        ]
      },
      {
        id: 'shift-attendance-hr',
        title: 'Ca Làm Việc & Điểm Danh',
        icon: require('../assets/hr/shift-attendance.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
        ]
      },
      {
        id: 'expense-claim-hr',
        title: 'Yêu Cầu Thanh Toán',
        icon: require('../assets/hr/expense-claim.png'),
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
        ]
      },
      {
        id: 'leaves-hr',
        title: 'Nghỉ Phép',
        icon: require('../assets/hr/leaves.png'),
        hasSubItems: true,
        allowedRoles: [
          ...ROLE_GROUPS.HR_ROLES,
          ...ROLE_GROUPS.ADMIN_ROLES,
        ],
        subItems: [
          {
            id: 'apply-hr',
            title: 'Đơn Xin Nghỉ Phép',
            icon: '📝',
            description: 'Tạo đơn xin nghỉ phép mới và theo dõi trạng thái',
            backgroundColor: '#10b981',
            allowedRoles: [
              ...ROLE_GROUPS.HR_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES,
            ]
          },
          {
            id: 'compensatory',
            title: 'Yêu Cầu Nghỉ Phép Bù',
            icon: '⏱',
            description: 'Đăng ký nghỉ bù cho những ngày làm thêm',
            backgroundColor: '#f59e0b',
            allowedRoles: [
              ...ROLE_GROUPS.HR_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES,
            ]
          },
          {
            id: 'allocation',
            title: 'Nghỉ Phép Hưởng Lương',
            icon: '💼',
            description: 'Xem chi tiết ngày phép được hưởng lương',
            backgroundColor: '#3b82f6',
            allowedRoles: [
              ...ROLE_GROUPS.HR_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES,
            ]
          },
          {
            id: 'settings',
            title: 'Loại Nghỉ Phép',
            icon: '⚙️',
            description: 'Cấu hình và quản lý các loại nghỉ phép',
            backgroundColor: '#8b5cf6',
            allowedRoles: [
              ...ROLE_GROUPS.HR_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES
            ]
          },
          {
            id: 'balance',
            title: 'Số Dư Ngày Phép',
            icon: '📊',
            description: 'Báo cáo chi tiết số dư ngày phép cá nhân',
            backgroundColor: '#ef4444',
            allowedRoles: [
              ...ROLE_GROUPS.HR_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES,
            ]
          },
          {
            id: 'summary',
            title: 'Tóm Tắt Số Dư Nhân Viên',
            icon: '📈',
            description: 'Báo cáo tổng hợp cho quản lý nhân sự',
            backgroundColor: '#06b6d4',
            allowedRoles: [
              ...ROLE_GROUPS.HR_ROLES,
              ...ROLE_GROUPS.ADMIN_ROLES
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'shipment',
    title: 'VNShipment',
    icon: require('../assets/hr/hr.png'), // Using existing icon as example
    hasSubItems: true,
    allowedRoles: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.SHIPMENT_ROLES,
      ...ROLE_GROUPS.STOCK_ROLES,
    ],
    subItems: [
      {
        id: 'delivery-trip',
        title: 'Vận chuyển',
        icon: require('../assets/hr/hr.png'), // Using existing icon as example
        allowedRoles: [
          ...ROLE_GROUPS.ADMIN_ROLES,
          ...ROLE_GROUPS.SHIPMENT_ROLES,
          ...ROLE_GROUPS.STOCK_ROLES,

        ]
      }
    ]
  }

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

// ========================= PERMISSION CHECK FUNCTIONS =========================
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

  return hasAccess;
}

/**
 * Kiểm tra user có quyền truy cập sub-item không (hỗ trợ nested submenu)
 * @param userRoles - Danh sách roles của user  
 * @param menuId - ID của menu cha
 * @param subItemId - ID của sub-item
 * @param nestedSubItemId - ID của nested sub-item (optional)
 * @returns boolean - true nếu có quyền
 */
export function hasSubItemAccess(
  userRoles: string[],
  menuId: string,
  subItemId: string,
  nestedSubItemId?: string
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

  // Nếu có nestedSubItemId, kiểm tra nested submenu
  if (nestedSubItemId && subItem.subItems) {
    const nestedSubItem = subItem.subItems.find(nested => nested.id === nestedSubItemId);
    if (!nestedSubItem) {
      return false;
    }

    const hasAccess = userRoles.some(role => nestedSubItem.allowedRoles.includes(role));
    return hasAccess;
  }

  // Kiểm tra có ít nhất 1 role khớp
  const hasAccess = userRoles.some(role => subItem.allowedRoles.includes(role));

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
