export type RootStackParamList = {
  Login: undefined;  // Không có tham số
  Home: undefined;   // Không có tham số
  InventoryEntry: undefined; // Inventory Entry Screen
  LeaveManagement: {
    selectedDate?: string;
    initialTab?: 'pending' | 'approved' | 'rejected';
  };
  ApplicationLeave: {
    leaveId: string;
  };
  InventoryManagement: undefined;
};