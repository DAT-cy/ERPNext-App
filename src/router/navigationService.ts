import { NavigationContainerRef } from '@react-navigation/native';
import { createRef } from 'react';
import { AppRouteName } from '../navigation/routeRegistry';
import { RootStackParamList } from '../navigation/types';

export const navigationRef = createRef<NavigationContainerRef<any>>();

export type RouteParams = RootStackParamList;
export type RouteName = AppRouteName;

export const MENU_ROUTE_MAP: Record<string, {
  routeName: RouteName;
  defaultParams?: any;
}> = {
  'bottom:home': { routeName: 'Home' },
  'hr:leaves-hr': { routeName: 'LeaveManagement' },
  'hr:apply-hr': { routeName: 'ApplicationLeave', defaultParams: { leaveId: '' } },
  'leaves-hr:apply-hr': { routeName: 'ApplicationLeave', defaultParams: { leaveId: '' } },
  'inventory:inventory-operations': { routeName: 'InventoryManagement' },
  'inventory-operations:stock-entry': { routeName: 'InventoryEntry' },
  'inventory-operations:purchase-receipt': { routeName: 'PurchaseReceiptList' },
  'inventory-operations:check-quantity-inventory': { routeName: 'CheckListInventoryScreen' },
  'shipment:delivery-trip': { routeName: 'ShipmentManagement' },
  'shipment:delivery-statistics': { routeName: 'ShipmentStatitisScreen' },
};

export function navigate<T extends RouteName>(
  routeName: T,
  params?: RouteParams[T]
) {
  if (navigationRef.current) {
    navigationRef.current.navigate({
      name: routeName as string,
      params: params as object,
    });
  } else {
    console.warn('Navigation not ready yet');
  }
}

export function goBack() {
  if (navigationRef.current && navigationRef.current.canGoBack()) {
    navigationRef.current.goBack();
  }
}

export function resetTo<T extends RouteName>(
  routeName: T,
  params?: RouteParams[T]
) {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{
        name: routeName as string,
        params: params as object,
      }],
    });
  }
}

export function navigateByMenuId(
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
  navigate(routeInfo.routeName, params);
  return true;
}

export function navigateByBottomTab(tabKey: string, params?: any): boolean {
  const routeKey = `bottom:${tabKey}`;
  const routeInfo = MENU_ROUTE_MAP[routeKey];

  if (!routeInfo) {
    console.warn(`Không tìm thấy định nghĩa route cho bottom tab: ${tabKey}`);
    return false;
  }

  const finalParams = params || routeInfo.defaultParams;
  navigate(routeInfo.routeName, finalParams);
  return true;
}

