export type RootStackParamList = {
  Login: undefined;  // Không có tham số
  Home: undefined;   // Không có tham số
  InventoryEntry: undefined; // Inventory Entry Screen
  InsertInventoryScreen: undefined;
  LeaveManagement: {
    selectedDate?: string;
    initialTab?: 'pending' | 'approved' | 'rejected';
  };
  ApplicationLeave: {
    leaveId: string;
  };
  InventoryManagement: undefined;
  InventoryDetailScreen: {
    inventoryDetail: any; // InventoryDetailData type
  };
  DeliveryNote: undefined; // Delivery Note Screen
  DeliveryNoteDetailScreen: {
    deliveryNoteDetail?: any;
    name?: string;
  };
  PurchaseReceiptList: undefined; // Purchase Receipt List Screen
  PurchaseReceiptDetailScreen: {
    purchaseReceiptDetail?: any;
    name?: string;
  };
  ShipmentScreenDetail: {
    shipmentDetail?: any;
    name?: string;
  };
};