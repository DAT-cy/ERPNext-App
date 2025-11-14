import { ComponentType } from "react";
import { StackNavigationOptions } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import LeaveManagementScreen from "../screens/LeaveManagementScreen";
import { ApplicationLeave } from "../screens";
import InventoryManagementScreen from "../screens/Inventory/InventoryManagementScreen";
import InventoryEntryScreens from "../screens/Inventory/InventoryEntryScreens";
import InventoryDetailScreen from "../screens/Inventory/InventoryDetailScreen";
import InsertInventoryScreen from "@/screens/Inventory/InsertInventoryScreen";
import DeliveryNoteScreen from "../screens/DeliveryNote/DeliveryNoteScreen";
import DeliveryNoteDetailScreen from "../screens/DeliveryNote/DeliveryNoteDetailScreen";
import PurchaseReceiptListScreens from "../screens/PurchaseReceipt/PurchaseReceiptListScreens";
import PurchaseReceiptDetailScreen from "../screens/PurchaseReceipt/PurchaseReceiptDetailScreen";
import CheckListInventoryScreen from "../screens/CheckListInventoryScreen";
import ShipmentScreen from "../screens/ship/ShipmentScreen";
import ShipmentDetailScreen from "../screens/ship/ShipmentDetailScreen";
import InsertShipmentDetailScreen from "../screens/ship/InsertShipmentDetailScreen";
import { RootStackParamList } from "./types";

type RouteConfig = {
  component: ComponentType<any>;
  options?: StackNavigationOptions;
};

export const ROUTE_REGISTRY: Record<keyof RootStackParamList, RouteConfig> = {
  Login: { component: LoginScreen },
  Home: { component: HomeScreen },
  LeaveManagement: { component: LeaveManagementScreen },
  ApplicationLeave: { component: ApplicationLeave },
  InventoryManagement: { component: InventoryManagementScreen },
  InventoryEntry: { component: InventoryEntryScreens },
  InventoryDetailScreen: { component: InventoryDetailScreen },
  InsertInventoryScreen: { component: InsertInventoryScreen },
  DeliveryNote: { component: DeliveryNoteScreen },
  DeliveryNoteDetailScreen: { component: DeliveryNoteDetailScreen },
  PurchaseReceiptList: { component: PurchaseReceiptListScreens },
  PurchaseReceiptDetailScreen: { component: PurchaseReceiptDetailScreen },
  CheckListInventoryScreen: { component: CheckListInventoryScreen },
  ShipmentManagement: { component: ShipmentScreen },
  ShipmentScreenDetail: { component: ShipmentDetailScreen },
  InsertShipment: { component: InsertShipmentDetailScreen },
};

export type AppRouteName = keyof typeof ROUTE_REGISTRY;

export const APP_ROUTES = Object.entries(ROUTE_REGISTRY).map(([name, config]) => ({
  name: name as AppRouteName,
  ...config,
}));

export function getRouteConfig(name: AppRouteName) {
  return ROUTE_REGISTRY[name];
}

