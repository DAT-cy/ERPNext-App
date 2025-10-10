// src/screens/Inventory/InventoryEntryScreens.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../styles/globalStyles';
import { wp, hp, fs } from '../../utils/responsive';
import { InventoryItem } from '../../services/inventoryService';
import { inventoryEntryStyles } from '../../styles/InventoryEntryScreens.styles';
import { InventoryFilterModal } from '../../components/InventoryFilter';
import {getAllExportImportType , getWarehouse} from '../../services/inventoryService';

// Types for filters
interface FilterCategory {
  key: string;
  title: string;
  icon?: string;
}

interface FilterOption {
  value: string;
  label: string;
  category: string;
}

interface ActiveFilter {
  key: string;
  label: string;
  category: string;
  value: string;
}

// Sample data matching the new API format
const sampleData: InventoryItem[] = [
  {
    name: "NH250801001",
    stock_entry_type: "Nhập kho",
    workflow_state: "Hoàn thành",
    from_warehouse: "Lại Yên - COM",
    custom_original_target_warehouse: "Mỹ Đình - COM",
    expense_account: "6321 Nguyên vật liệu - COM",
    docstatus: 1,
    creation: "2025-08-01 10:00:01.028741",
    purpose: "Material Receipt",
    custom_interpretation: "Nhận hàng từ NCC ABC - Lô hàng tháng 8"
  },
  {
    name: "TH250802002",
    stock_entry_type: "Trả hàng", 
    workflow_state: "Đã xử lý",
    from_warehouse: "Mỹ Đình - COM",
    custom_original_target_warehouse: "",
    expense_account: "6325 Trả hàng bán - COM",
    docstatus: 2,
    creation: "2025-08-02 14:30:15.123456",
    purpose: "Material Return",
    custom_interpretation: "Trả hàng cho khách hàng - Sản phẩm lỗi"
  },
  {
    name: "XK250803003",
    stock_entry_type: "Xuất kho",
    workflow_state: "Chờ duyệt",
    from_warehouse: "Lại Yên - COM",
    custom_original_target_warehouse: "",
    expense_account: "6322 Xuất bán hàng hóa - COM", 
    docstatus: 0,
    creation: "2025-08-03 09:45:30.567890",
    purpose: "Material Issue",
    custom_interpretation: "Xuất hàng cho đơn hàng KH-2025-001"
  },
  {
    name: "SX250804004",
    stock_entry_type: "Sản xuất",
    workflow_state: "Hoàn thành",
    from_warehouse: "Nguyên liệu - COM",
    custom_original_target_warehouse: "Thành phẩm - COM",
    expense_account: "6324 Chi phí sản xuất - COM",
    docstatus: 1,
    creation: "2025-08-04 16:20:45.234567",
    purpose: "Manufacture", 
    custom_interpretation: "Sản xuất lô hàng SP-001 tháng 8"
  },
  {
    name: "TH250805005",
    stock_entry_type: "Trả hàng",
    workflow_state: "Đã xử lý",
    from_warehouse: "",
    custom_original_target_warehouse: "Lại Yên - COM",
    expense_account: "6325 Trả hàng bán - COM",
    docstatus: 1,
    creation: "2025-08-05 11:15:20.789012",
    purpose: "Material Return",
    custom_interpretation: "Khách hàng trả lại sản phẩm lỗi"
  }
];

// Filter categories
const filterCategories: FilterCategory[] = [
  { key: 'stock_entry_type', title: 'Loại Nhập Xuất', icon: '📦' },
  { key: 'workflow_state', title: 'Trạng Thái', icon: '📊' },
  { key: 'from_warehouse', title: 'Kho Xuất Mặc Định', icon: '🏪' },
  { key: 'custom_original_target_warehouse', title: 'Kho Nhập Mặc Định', icon: '🏬' },
  { key: 'expense_account', title: 'Tài Khoản Chênh Lệch', icon: '💰' },
  { key: 'is_return', title: 'Là Trả Hàng', icon: '↩️' },
  { key: 'creation_date', title: 'Ngày Ghi Sổ', icon: '📅' },
  { key: 'purpose', title: 'Mục Đích', icon: '🎯' },
  { key: 'custom_interpretation', title: 'Diễn giải', icon: '📝' },
];

export default function InventoryEntryScreens() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>(sampleData);
  const [filteredData, setFilteredData] = useState<InventoryItem[]>(sampleData);
  const [loading, setLoading] = useState<boolean>(false);
  const [exportImportTypesOption, setExportImportTypesOption] = useState<Record<string, FilterOption[]>>({});
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // Static filter options (fallback)
  const staticFilterOptions: Record<string, FilterOption[]> = {
    workflow_state: [
      // Vietnamese values (new format)
      { value: 'Hủy', label: 'Hủy', category: 'workflow_state' },
      { value: 'Đã duyệt', label: 'Đã duyệt', category: 'workflow_state' },
      { value: 'Chờ duyệt', label: 'Chờ duyệt', category: 'workflow_state' },
      { value: 'Hoàn thành', label: 'Hoàn thành', category: 'workflow_state' },
      { value: 'Đã xử lý', label: 'Đã xử lý', category: 'workflow_state' },
      // English values (legacy support)
      { value: 'Processed', label: 'Đã xử lý (EN)', category: 'workflow_state' },
      { value: 'Processing', label: 'Đang xử lý', category: 'workflow_state' },
      { value: 'Approved', label: 'Đã duyệt (EN)', category: 'workflow_state' },
      { value: 'Pending', label: 'Chờ duyệt (EN)', category: 'workflow_state' },
      { value: 'Completed', label: 'Hoàn thành (EN)', category: 'workflow_state' },
      { value: 'Draft', label: 'Nháp', category: 'workflow_state' },
      { value: 'Rejected', label: 'Từ chối', category: 'workflow_state' },
      { value: 'Cancelled', label: 'Hủy (EN)', category: 'workflow_state' },
    ],

    expense_account: [
      { value: '6321 Nguyên vật liệu - COM', label: '6321 Nguyên vật liệu - COM', category: 'expense_account' },
      { value: '6322 Xuất bán hàng hóa - COM', label: '6322 Xuất bán hàng hóa - COM', category: 'expense_account' },
      { value: '6324 Chi phí sản xuất - COM', label: '6324 Chi phí sản xuất - COM', category: 'expense_account' },
      { value: '6325 Trả hàng bán - COM', label: '6325 Trả hàng bán - COM', category: 'expense_account' },
      { value: '6326 Chênh lệch tồn kho - COM', label: '6326 Chênh lệch tồn kho - COM', category: 'expense_account' },
      { value: '6327 Hao hụt tồn kho - COM', label: '6327 Hao hụt tồn kho - COM', category: 'expense_account' },
    ],
    creation_date: [
      { value: 'today', label: 'Hôm nay', category: 'creation_date' },
      { value: 'yesterday', label: 'Hôm qua', category: 'creation_date' },
      { value: 'this_week', label: 'Tuần này', category: 'creation_date' },
      { value: 'last_week', label: 'Tuần trước', category: 'creation_date' },
      { value: 'this_month', label: 'Tháng này', category: 'creation_date' },
      { value: 'last_month', label: 'Tháng trước', category: 'creation_date' },
      { value: 'this_year', label: 'Năm nay', category: 'creation_date' },
    ],
    purpose: [
      { value: 'Material Receipt', label: 'Nhận vật tư', category: 'purpose' },
      { value: 'Material Issue', label: 'Xuất vật tư', category: 'purpose' },
      { value: 'Material Transfer', label: 'Chuyển vật tư', category: 'purpose' },
      { value: 'Material Return', label: 'Trả vật tư', category: 'purpose' },
      { value: 'Manufacture', label: 'Sản xuất', category: 'purpose' },
      { value: 'Repack', label: 'Đóng gói lại', category: 'purpose' },
      { value: 'Send to Subcontractor', label: 'Gửi gia công', category: 'purpose' },
    ],
    custom_interpretation: [
      { value: 'contains_ncc', label: 'Chứa "NCC"', category: 'custom_interpretation' },
      { value: 'contains_khach_hang', label: 'Chứa "khách hàng"', category: 'custom_interpretation' },
      { value: 'contains_san_pham_loi', label: 'Chứa "sản phẩm lỗi"', category: 'custom_interpretation' },
      { value: 'contains_don_hang', label: 'Chứa "đơn hàng"', category: 'custom_interpretation' },
      { value: 'contains_lo_hang', label: 'Chứa "lô hàng"', category: 'custom_interpretation' },
    ],
    name: [
      { value: 'starts_with_NH', label: 'Bắt đầu bằng "NH"', category: 'name' },
      { value: 'starts_with_TH', label: 'Bắt đầu bằng "TH"', category: 'name' },
      { value: 'starts_with_XK', label: 'Bắt đầu bằng "XK"', category: 'name' },
      { value: 'starts_with_SX', label: 'Bắt đầu bằng "SX"', category: 'name' },
      { value: 'contains_2025', label: 'Chứa "2025"', category: 'name' },
    ],
  };

  const transformApiDataToFilterOptions = (
    apiData: any[], 
    category: string, 
    valueKey: string = 'name',
    labelKey?: string
  ): FilterOption[] => {
    return apiData.map(item => ({
      value: item[valueKey],
      label: labelKey ? item[labelKey] : item[valueKey],
      category: category
    }));
  };

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const [stockEntryTypes, warehouseOptions] = await Promise.all([
        loadStockEntryTypes(),
        loadWarehouseOptions()
      ]);

      // Combine all options
      const combinedOptions = {
        ...staticFilterOptions,
        stock_entry_type: stockEntryTypes,
        from_warehouse: warehouseOptions,
        custom_original_target_warehouse: warehouseOptions,

      };
      
      setExportImportTypesOption(combinedOptions);
      
    } catch (error) {
        throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouseOptions = async (): Promise<FilterOption[]> => {
    try {
      const warehouses = await getWarehouse();
      const warehouseOpts = transformApiDataToFilterOptions(warehouses, 'from_warehouse');      

      // Combine API data with fallbacks and remove duplicates
      const combinedWarehouses = [...warehouseOpts];
      const uniqueWarehouses = combinedWarehouses.filter((item, index, arr) => 
        arr.findIndex(t => t.value === item.value) === index
      );
      
      return uniqueWarehouses;

    } catch (error) {
      throw error;
    }
  };

  const loadStockEntryTypes = async (): Promise<FilterOption[]> => {
    try {
      const exportImportTypes = await getAllExportImportType();
      const dynamicOptions = transformApiDataToFilterOptions(
        exportImportTypes, 
        'stock_entry_type'
      );
      
      const enhancedOptions = [
        ...dynamicOptions
      ];

      return enhancedOptions;
    } catch (error) {
      throw error
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Get status display info
  const getStatusInfo = (state: string, docstatus: string | number) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      // English status
      'Cancelled': { text: 'Hủy', color: colors.error, bgColor: '#FEF2F2' },
      'Draft': { text: 'Nháp', color: colors.info, bgColor: '#EFF6FF' },
      'Approved': { text: 'Đã duyệt', color: colors.success, bgColor: '#F0FDF4' },
      'Pending': { text: 'Chờ duyệt', color: colors.warning, bgColor: '#FFFBEB' },
      'Completed': { text: 'Hoàn thành', color: colors.success, bgColor: '#F0FDF4' },
      'Rejected': { text: 'Từ chối', color: colors.error, bgColor: '#FEF2F2' },
      'Processed': { text: 'Đã xử lý', color: colors.success, bgColor: '#F0FDF4' },
      'Processing': { text: 'Đang xử lý', color: colors.warning, bgColor: '#FFFBEB' },
      
      // Vietnamese status
      'Hủy': { text: 'Hủy', color: colors.error, bgColor: '#FEF2F2' },
      'Đã duyệt': { text: 'Đã duyệt', color: colors.success, bgColor: '#F0FDF4' },
      'Chờ duyệt': { text: 'Chờ duyệt', color: colors.warning, bgColor: '#FFFBEB' },
      'Hoàn thành': { text: 'Hoàn thành', color: colors.success, bgColor: '#F0FDF4' },
      'Đã xử lý': { text: 'Đã xử lý', color: colors.success, bgColor: '#F0FDF4' },
    };

    // Check docstatus if state not found
    if (!statusMap[state] && docstatus !== undefined) {
      const docstatusNumber = typeof docstatus === 'string' ? parseInt(docstatus) : docstatus;
      switch (docstatusNumber) {
        case 0: return { text: 'Nháp', color: colors.info, bgColor: '#EFF6FF' };
        case 1: return { text: 'Nhận hàng', color: colors.success, bgColor: '#F0FDF4' };
        case 2: return { text: 'Trả hàng', color: colors.warning, bgColor: '#FFFBEB' };
      }
    }

    return statusMap[state] || { text: state, color: colors.gray500, bgColor: colors.gray100 };
  };



  // Get entry type label (for display purposes)
  const getEntryTypeLabel = (type: string): string => {
    const labelMap: Record<string, string> = {
      // Vietnamese types (already localized)
      'Chuyển kho': 'Chuyển kho',
      'Nhập kho': 'Nhập kho',
      'Xuất kho': 'Xuất kho',
      'Sản xuất': 'Sản xuất',
      'Trả hàng': 'Trả hàng',
      // English types (translate to Vietnamese)
      'Manufacture': 'Sản xuất',
      'Material Receipt': 'Nhập kho',
      'Material Issue': 'Xuất kho',
      'Material Transfer': 'Chuyển kho', 
      'Material Return': 'Trả hàng',
      'Repack': 'Kiểm kê',
    };
    return labelMap[type] || type;
  };

  // Apply filters and search
  const applyFiltersAndSearch = () => {
    let filtered = inventoryData;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.custom_interpretation || '').toLowerCase().includes(query) ||
        item.purpose.toLowerCase().includes(query) ||
        item.stock_entry_type.toLowerCase().includes(query) ||
        item.workflow_state.toLowerCase().includes(query) ||
        (item.from_warehouse || '').toLowerCase().includes(query) ||
        (item.expense_account || '').toLowerCase().includes(query)
      );
    }

    // Apply active filters
    activeFilters.forEach(filter => {
      filtered = filtered.filter(item => {
        switch (filter.category) {
          case 'is_return':
            // Check if item is return based on docstatus or stock_entry_type
            const isReturn = item.docstatus === 2 || 
                           item.stock_entry_type.includes('Trả') ||
                           item.stock_entry_type.includes('Return');
            return filter.value === 'true' ? isReturn : !isReturn;
            
          case 'creation_date':
            const itemDate = new Date(item.creation);
            const now = new Date();
            switch (filter.value) {
              case 'today':
                return itemDate.toDateString() === now.toDateString();
              case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                return itemDate.toDateString() === yesterday.toDateString();
              case 'this_week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                return itemDate >= weekStart;
              case 'last_week':
                const lastWeekStart = new Date(now);
                lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                return itemDate >= lastWeekStart && itemDate <= lastWeekEnd;
              case 'this_month':
                return itemDate.getMonth() === now.getMonth() && 
                       itemDate.getFullYear() === now.getFullYear();
              case 'last_month':
                const lastMonth = new Date(now);
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                return itemDate.getMonth() === lastMonth.getMonth() && 
                       itemDate.getFullYear() === lastMonth.getFullYear();
              case 'this_year':
                return itemDate.getFullYear() === now.getFullYear();
              default:
                return true;
            }
            
          case 'custom_interpretation':
            const interpretation = item.custom_interpretation || '';
            switch (filter.value) {
              case 'contains_ncc':
                return interpretation.toLowerCase().includes('ncc');
              case 'contains_khach_hang':
                return interpretation.toLowerCase().includes('khách hàng');
              case 'contains_san_pham_loi':
                return interpretation.toLowerCase().includes('sản phẩm lỗi');
              case 'contains_don_hang':
                return interpretation.toLowerCase().includes('đơn hàng');
              case 'contains_lo_hang':
                return interpretation.toLowerCase().includes('lô hàng');
              default:
                return true;
            }
            
          case 'name':
            const name = item.name || '';
            switch (filter.value) {
              case 'starts_with_NH':
                return name.startsWith('NH');
              case 'starts_with_TH':
                return name.startsWith('TH');
              case 'starts_with_XK':
                return name.startsWith('XK');
              case 'starts_with_SX':
                return name.startsWith('SX');
              case 'contains_2025':
                return name.includes('2025');
              default:
                return true;
            }
            
          default:
            // Standard field matching for other categories
            const itemValue = (item as any)[filter.category];
            return itemValue === filter.value;
        }
      });
    });

    setFilteredData(filtered);
  };

  // Effect to apply filters when search or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, activeFilters, inventoryData]);

  // Remove active filter
  const removeFilter = (filterToRemove: ActiveFilter) => {
    setActiveFilters(prev => prev.filter(f => f.key !== filterToRemove.key));
  };



  // Render inventory item
  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    const statusInfo = getStatusInfo(item.workflow_state, item.docstatus);
    const typeLabel = getEntryTypeLabel(item.stock_entry_type);

    return (
      <View style={inventoryEntryStyles.inventoryItem}>
        {/* Header với ID và Status */}
        <View style={inventoryEntryStyles.itemHeader}>
          <Text style={inventoryEntryStyles.itemId}>{item.name}</Text>
          <View style={[inventoryEntryStyles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[inventoryEntryStyles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {/* Content grid 2 cột - Key xuống dòng Value */}
        <View style={inventoryEntryStyles.itemContent}>
          {/* Cột 1 */}
          <View style={inventoryEntryStyles.leftColumn}>
            <View style={inventoryEntryStyles.compactRow}>
              <Text style={inventoryEntryStyles.compactLabel}>Loại:</Text>
              <Text style={inventoryEntryStyles.compactValue}>{typeLabel}</Text>
            </View>
            
            {item.from_warehouse && (
              <View style={inventoryEntryStyles.compactRow}>
                <Text style={inventoryEntryStyles.compactLabel}>Kho xuất:</Text>
                <Text style={inventoryEntryStyles.compactValue}>{item.from_warehouse}</Text>
              </View>
            )}

            {item.expense_account && (
              <View style={inventoryEntryStyles.compactRow}>
                <Text style={inventoryEntryStyles.compactLabel}>Tài khoản:</Text>
                <Text style={inventoryEntryStyles.compactValue} numberOfLines={1}>
                  {item.expense_account.length > 20 
                    ? `${item.expense_account.substring(0, 20)}...` 
                    : item.expense_account}
                </Text>
              </View>
            )}
          </View>

          {/* Cột 2 */}
          <View style={inventoryEntryStyles.rightColumn}>
            {item.custom_original_target_warehouse && (
              <View style={inventoryEntryStyles.compactRow}>
                <Text style={inventoryEntryStyles.compactLabel}>Kho nhập:</Text>
                <Text style={inventoryEntryStyles.compactValue}>{item.custom_original_target_warehouse}</Text>
              </View>
            )}

            <View style={inventoryEntryStyles.compactRow}>
              <Text style={inventoryEntryStyles.compactLabel}>Mục đích:</Text>
              <Text style={inventoryEntryStyles.compactValue} numberOfLines={1}>
                {item.purpose}
              </Text>
            </View>

            {item.docstatus !== undefined && item.docstatus !== 0 && (
              <View style={inventoryEntryStyles.compactRow}>
                <Text style={inventoryEntryStyles.compactLabel}>
                  {item.docstatus === 1 ? 'Nhận hàng:' : item.docstatus === 2 ? 'Trả hàng:' : 'Nháp:'}
                </Text>
                <Text style={inventoryEntryStyles.compactValue}>
                  {formatDate(item.creation)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Diễn giải (full width) */}
        {item.custom_interpretation && (
          <View style={inventoryEntryStyles.interpretationRow}>
            <Text style={inventoryEntryStyles.interpretationLabel}>Diễn giải:</Text>
            <Text style={inventoryEntryStyles.interpretationValue} numberOfLines={2}>
              {`"${item.custom_interpretation}"`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={inventoryEntryStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={inventoryEntryStyles.header}>
        <Text style={inventoryEntryStyles.headerTitle}>Quản Lý Nhập Xuất Kho</Text>
        
        {/* Search Bar */}
        <View style={inventoryEntryStyles.searchContainer}>
          <View style={inventoryEntryStyles.searchBar}>
            <Feather name="search" size={wp(5)} color={colors.gray500} />
            <TextInput
              style={inventoryEntryStyles.searchInput}
              placeholder="Tìm kiếm phiếu nhập xuất..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray500}
            />
            <TouchableOpacity
              style={inventoryEntryStyles.filterButton}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <Feather name="filter" size={wp(5)} color={colors.gray600} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={inventoryEntryStyles.activeFiltersContainer}
          >
            {activeFilters.map((filter) => (
              <View key={filter.key} style={inventoryEntryStyles.activeFilterTag}>
                <Text style={inventoryEntryStyles.activeFilterText}>{filter.label}</Text>
                <TouchableOpacity onPress={() => removeFilter(filter)}>
                  <Feather name="x" size={wp(3.5)} color={colors.warning} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Results */}
      <View style={inventoryEntryStyles.resultsHeader}>
        <Text style={inventoryEntryStyles.resultsTitle}>Phiếu Nhập Xuất</Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.name}
        renderItem={renderInventoryItem}
        style={inventoryEntryStyles.resultsList}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Filter Modal */}
      <InventoryFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        filterCategories={filterCategories}
        filterOptions={(() => {
          const options = Object.keys(exportImportTypesOption).length > 0 ? exportImportTypesOption : staticFilterOptions;
          console.log('🔍 [InventoryEntryScreens] Passing filterOptions to modal:', Object.keys(options));
          return options;
        })()}
      />
    </SafeAreaView>
  );
}