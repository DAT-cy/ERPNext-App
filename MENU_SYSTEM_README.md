# Menu Permissions System

Hệ thống quản lý menu và phân quyền theo role dễ dàng mở rộng và tái sử dụng.

## 🏗️ Cấu trúc hệ thống

### 1. **Role Groups** (`ROLE_GROUPS`)
Định nghĩa các nhóm roles chuẩn:
```typescript
BASIC_USER: ['All', 'Guest', 'Desk User']
EMPLOYEE: ['Employee'] 
HR_ROLES: ['HR Manager', 'HR User']
SALES_ROLES: ['Sales Manager', 'Sales User']
ADMIN_ROLES: ['Administrator', 'System Manager']
```

### 2. **Menu Definitions** (`MENU_DEFINITIONS`)
Danh sách tất cả menu items và sub-items với roles được phép:
```typescript
{
  id: 'sales',
  title: 'Kinh doanh', 
  icon: '💼',
  allowedRoles: [...ROLE_GROUPS.SALES_ROLES, ...ROLE_GROUPS.ADMIN_ROLES],
  subItems: [...]
}
```

## 🚀 Cách sử dụng

### Thêm Menu mới:

#### Bước 1: Thêm role group mới (nếu cần)
```typescript
// Trong menuPermissions.ts
export const ROLE_GROUPS = {
  // ... existing roles
  MARKETING_ROLES: ['Marketing Manager', 'Marketing User'],
  IT_ROLES: ['IT Manager', 'IT User', 'System Admin']
}
```

#### Bước 2: Tạo menu definition
```typescript
// Trong MENU_DEFINITIONS array
{
  id: 'marketing',
  title: 'Marketing',
  icon: '📢',
  hasSubItems: true,
  allowedRoles: [
    ...ROLE_GROUPS.MARKETING_ROLES,
    ...ROLE_GROUPS.ADMIN_ROLES
  ],
  subItems: [
    {
      id: 'campaigns',
      title: 'Chiến dịch',
      icon: '🎯',
      allowedRoles: [
        ...ROLE_GROUPS.MARKETING_ROLES,
        ...ROLE_GROUPS.ADMIN_ROLES
      ]
    }
  ]
}
```

#### Bước 3: Menu tự động hiển thị
Menu sẽ tự động hiển thị cho users có đúng roles!

## 📋 Ví dụ thực tế

### Case 1: Thêm menu "Kho hàng" cho Warehouse roles
```typescript
// 1. Thêm role group
WAREHOUSE_ROLES: ['Warehouse Manager', 'Warehouse User']

// 2. Thêm menu
{
  id: 'warehouse',
  title: 'Kho hàng',
  icon: '📦',
  hasSubItems: true,
  allowedRoles: [
    ...ROLE_GROUPS.WAREHOUSE_ROLES,
    ...ROLE_GROUPS.ADMIN_ROLES
  ],
  subItems: [
    {
      id: 'inventory',
      title: 'Tồn kho',
      icon: '📊',
      allowedRoles: [
        ...ROLE_GROUPS.WAREHOUSE_ROLES,
        ...ROLE_GROUPS.ADMIN_ROLES
      ]
    },
    {
      id: 'stock-transfer',
      title: 'Chuyển kho',
      icon: '🔄',
      allowedRoles: ['Warehouse Manager', ...ROLE_GROUPS.ADMIN_ROLES]
    }
  ]
}
```

### Case 2: Menu chỉ cho CEO
```typescript
{
  id: 'executive',
  title: 'Điều hành',
  icon: '👔',
  hasSubItems: true,
  allowedRoles: ['CEO', 'Managing Director', ...ROLE_GROUPS.ADMIN_ROLES],
  subItems: [
    {
      id: 'company-overview',
      title: 'Tổng quan công ty',
      icon: '📈',
      allowedRoles: ['CEO', 'Managing Director', ...ROLE_GROUPS.ADMIN_ROLES]
    }
  ]
}
```

## 🔧 Utility Functions

### `hasMenuAccess(userRoles, menuId)`
Kiểm tra user có quyền xem menu không

### `hasSubItemAccess(userRoles, menuId, subItemId)`  
Kiểm tra user có quyền xem sub-item không

### `getAccessibleMenus(userRoles)`
Lấy tất cả menus user có quyền truy cập

### `hasRole(userRoles, targetRole)`
Kiểm tra user có role cụ thể không

### `hasAnyRoleInGroup(userRoles, roleGroup)`
Kiểm tra user có bất kỳ role nào trong nhóm không

## 📱 Trong Component

```typescript
// SidebarMenu tự động sử dụng
const { roles } = useAuth();
const menuItems = getAccessibleMenus(roles);

// Custom component
const { roles } = useAuth();
const canViewSales = hasMenuAccess(roles, 'sales');
const canViewLeads = hasSubItemAccess(roles, 'sales', 'leads');
```

## ✅ Test Cases

### User với role "Sales User":
- ✅ Thấy menu "Kinh doanh" 
- ✅ Thấy menu "Nhân viên"
- ❌ Không thấy menu "Nhân sự" (chỉ HR)
- ❌ Không thấy menu "Kế toán"

### User với role "Employee":
- ✅ Thấy menu "Nhân viên"
- ✅ Thấy menu "Remak"
- ❌ Không thấy menu "Kinh doanh"
- ❌ Không thấy menu "Nhân sự"

### Administrator:
- ✅ Thấy TẤT CẢ menu items

## 🎯 Lợi ích

1. **Dễ mở rộng**: Chỉ cần thêm vào MENU_DEFINITIONS
2. **Tái sử dụng**: Role groups có thể dùng chung
3. **Type-safe**: Full TypeScript support
4. **Flexible**: Hỗ trợ nested permissions
5. **Maintainable**: Code tách biệt rõ ràng
6. **Scalable**: Hỗ trợ unlimited menus/roles

## 🚨 Lưu ý

- Luôn include `...ROLE_GROUPS.ADMIN_ROLES` cho admin access
- Role names phải khớp chính xác với ERPNext
- Test kỹ permissions trước khi deploy
- Sử dụng console.log để debug permissions