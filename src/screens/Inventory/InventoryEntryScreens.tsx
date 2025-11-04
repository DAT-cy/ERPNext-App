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
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../styles/globalStyles';
import { wp, hp, fs } from '../../utils/responsive';
import { InventoryItem } from '../../services/inventoryService';
import { inventoryEntryStyles } from '../../styles/InventoryEntryScreens.styles';
import { InventoryFilterModal } from '../../components/InventoryFilter';
import { getAllExportImportType, getWarehouse, getAllInventory } from '../../services/inventoryService';
import { getInventoryDetail } from '../../services/inventoryDetailService';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';
import { RealtimePollingManager } from '../../utils/RealtimePollingManager';

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

// Filter categories
const filterCategories: FilterCategory[] = [
    { key: 'stock_entry_type', title: 'Loại Nhập Xuất', icon: '📦' },
    { key: 'creation', title: 'Ngày Ghi Sổ', icon: '📅' },
    { key: 'workflow_state', title: 'Trạng Thái', icon: '📅' },

    // { key: 'from_warehouse', title: 'Kho Xuất Mặc Định', icon: '🏪' },
    // { key: 'custom_original_target_warehouse', title: 'Kho Nhập Mặc Định', icon: '🏬' },
    //   { key: 'expense_account', title: 'Tài Khoản Chênh Lệch', icon: '💰' },
    //   { key: 'is_return', title: 'Là Trả Hàng', icon: '↩️' },
    //   { key: 'purpose', title: 'Mục Đích', icon: '🎯' },
    //   { key: 'custom_interpretation', title: 'Diễn giải', icon: '📝' },
];

export default function InventoryEntryScreens() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [filteredData, setFilteredData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [hasMoreData, setHasMoreData] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [isEndReachedCalled, setIsEndReachedCalled] = useState<boolean>(false);
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [exportImportTypesOption, setExportImportTypesOption] = useState<Record<string, FilterOption[]>>({});
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;

    // Static filter options (fallback)
    const staticFilterOptions: Record<string, FilterOption[]> = {
        workflow_state: [
            { value: 'Yêu cầu', label: 'Yêu cầu', category: 'workflow_state' },
            { value: 'Đang xử lý', label: 'Đang xử lý', category: 'workflow_state' },
            { value: 'Đã xử lý', label: 'Đã xử lý', category: 'workflow_state' },
            { value: 'Draft', label: 'Nháp', category: 'workflow_state' },
            { value: 'Hủy', label: 'Hủy', category: 'workflow_state' },
            { value: 'Đóng', label: 'Đóng', category: 'workflow_state' },
        ],
        stock_entry_type: [
            // default value is English canonical for filtering, label stays Vietnamese for display
            { value: 'Material Transfer', label: 'Chuyển kho', category: 'stock_entry_type' },
        ],
    };

    const transformApiDataToFilterOptions = (
        apiData: any[],
        category: string,
        valueKey: string = 'name',
        labelKey?: string
    ): FilterOption[] => {
        return apiData.map(item => ({
            // Keep label in Vietnamese for UI, but set value to English canonical for filtering
            value: getEnglishValueForCategory(category, item[valueKey]),
            label: labelKey ? item[labelKey] : item[valueKey],
            category: category
        }));
    };

    // Convert Vietnamese to English canonical values used by backend for filtering
    const getEnglishValueForCategory = (category: string, vnValue: string): string => {
        if (category === 'stock_entry_type') {
            const map: Record<string, string> = {
                'Chuyển kho': 'Material Transfer',
                'Nhập kho': 'Material Receipt',
                'Xuất kho': 'Material Issue',
                'Sản xuất': 'Manufacture',
                'Trả hàng': 'Material Return',
                'Kiểm kê': 'Repack',
                // Extended types from provided dataset
                'Xuất vật tư': 'Material Issue',
                'Nhập vật tư': 'Material Receipt',
                'Đóng gói': 'Repack',
                'Gửi nhà thầu phụ': 'Send to Subcontractor',
                'Chuyển vật tư cho sản xuất': 'Material Transfer for Manufacture',
                'Tiêu hao vật tư cho sản xuất': 'Material Consumption for Manufacture',
            };
            return map[vnValue] || vnValue;
        }
        return vnValue;
    };

    const loadFilterOptions = async () => {
        try {
            setLoading(true);
            const [stockEntryTypes, warehouseOptions , customOriginalTargetWarehouse , creationOptions] = await Promise.all([
                loadStockEntryTypes(),
                loadWarehouseOptions(),
                loadCustomOriginalTargetWarehouse(),
                loadCreationOptions()
            ]);

            // Combine all options
            const combinedOptions = {
                ...staticFilterOptions,
                stock_entry_type: stockEntryTypes,
                from_warehouse: warehouseOptions,
                custom_original_target_warehouse: customOriginalTargetWarehouse,
                creation: creationOptions,

            };

            setExportImportTypesOption(combinedOptions);

            // Reconcile default stock_entry_type with available options (Material Transfer / Chuyển kho)
            const stockOptions = combinedOptions.stock_entry_type || [];
            const preferred = stockOptions.find(o => o.value === 'Material Transfer')
                || stockOptions[0];
            if (preferred) {
                setActiveFilters(prev => {
                    // Replace or add stock_entry_type to match available option value/label
                    const others = prev.filter(f => f.category !== 'stock_entry_type');
                    return [
                        ...others,
                        { key: 'stock_entry_type', label: preferred.label, category: 'stock_entry_type', value: preferred.value },
                    ];
                });
            }

        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };
    const loadCreationOptions = async (): Promise<FilterOption[]> => {
        try {
            const creationOptions = ['Một Ngày', 'Nhiều Ngày'];
            const creationOpts = transformApiDataToFilterOptions(creationOptions, 'creation');
            return creationOpts;
        } catch (error) {
            throw error;
        }
    };

    const loadCustomOriginalTargetWarehouse = async (): Promise<FilterOption[]> => {
        try {
            const warehouses = await getWarehouse();
            const warehouseOpts = transformApiDataToFilterOptions(warehouses, 'custom_original_target_warehouse');

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
        // Set default workflow_state and stock_entry_type filters on first load if not present
        setActiveFilters(prev => {
            let next = prev;
            if (!next.some(f => f.category === 'workflow_state')) {
                next = [
                    ...next,
                    { key: 'workflow_state', label: 'Yêu cầu', category: 'workflow_state', value: 'Yêu cầu' },
                ];
            }
            if (!next.some(f => f.category === 'stock_entry_type')) {
                next = [
                    ...next,
                    { key: 'stock_entry_type', label: 'Chuyển kho', category: 'stock_entry_type', value: 'Material Transfer' },
                ];
            }
            return next;
        });
        loadFilterOptions();
    }, []);

    // Keep current filters when screen is focused (no reset)

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
            'Nháp': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' }, // Blue
            'Draft': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' }, // Blue
            'Đang xử lý': { text: 'Đang xử lý', color: '#F59E0B', bgColor: '#FFFBEB' }, // Yellow
            'Đã xử lý': { text: 'Đã xử lý', color: '#10B981', bgColor: '#F0FDF4' }, // Green
            'Hủy': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' }, // Red
            'Cancelled': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' }, // Red
            'Yêu cầu': { text: 'Yêu cầu', color: colors.warning, bgColor: '#FFFBEB' },
            'Đóng': { text: 'Đóng', color: '#6B7280', bgColor: '#F3F4F6' }, // Gray
            'Closed': { text: 'Đóng', color: '#6B7280', bgColor: '#F3F4F6' }, // Gray
        };

        // Check docstatus if state not found
        if (!statusMap[state] && docstatus !== undefined) {
            const docstatusNumber = typeof docstatus === 'string' ? parseInt(docstatus) : docstatus;
            switch (docstatusNumber) {
                case 0: return { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' }; // Blue
                case 1: return { text: 'Đã xử lý', color: '#10B981', bgColor: '#F0FDF4' }; // Green
                case 2: return { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' }; // Red
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

    // Handle barcode scan -> try open detail directly; fallback to search
    const handleBarcodeScan = async (barcode: string) => {
        // Prevent multiple simultaneous scans
        if (isScanning) {
            console.log('🚫 [InventoryEntryScreens] Scan already in progress, ignoring duplicate scan');
            return;
        }

        try {
            console.log('🔍 [InventoryEntryScreens] Starting scan for barcode:', barcode);
            setIsScanning(true);
            setIsScannerVisible(false);
            
            // Validate barcode input
            if (!barcode || barcode.trim().length === 0) {
                console.log('❌ [InventoryEntryScreens] Invalid barcode input');
                setIsScanning(false);
                return;
            }

            // Try fetch detail by scanned code (assumed to be document name/ID)
            const response = await getInventoryDetail(barcode.trim());
            if (response?.success && response?.data) {
                console.log('✅ [InventoryEntryScreens] Scan successful, navigating to detail');
                (navigation as any).navigate('InventoryDetailScreen', {
                    inventoryDetail: response.data
                });
                return;
            }
            // Not found: show message
            console.log('❌ [InventoryEntryScreens] No data found for barcode:', barcode);
            Alert.alert('Không tìm thấy', `Không có phiếu nào với mã: ${barcode}`, [{ text: 'OK' }]);
        } catch (error) {
            // Error: show message
            console.log('💥 [InventoryEntryScreens] Scan error:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi tra cứu chi tiết phiếu. Vui lòng thử lại.', [{ text: 'OK' }]);
        } finally {
            console.log('🏁 [InventoryEntryScreens] Scan completed, resetting state');
            setIsScanning(false);
        }
    };

    // Search with API call (debounced)
    const performSearch = async (query: string, page: number = 0, isLoadMore: boolean = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setCurrentPage(0);
            setIsEndReachedCalled(false);
        }
        
        try {
            const filters = activeFilters.reduce((acc, filter) => {
                if (filter.category === 'creation') {
                    acc[filter.category] = filter.value;
                } else {
                    acc[filter.category] = filter.value;
                }
                return acc;
            }, {} as Record<string, string>);

            const offset = page * 10; // 10 items per page

            // Add search filter to API call with LIKE operator for partial search
            const response = await getAllInventory({ 
                filters: {
                    ...filters,
                    name: `%${query}%` // Partial search with LIKE operator
                }, 
                limit: 10, 
                offset: offset 
            });

            if (response.success && response.data) {
                if (isLoadMore) {
                    // Append new data to existing data
                    setInventoryData(prev => [...prev, ...(response.data || [])]);
                    setFilteredData(prev => [...prev, ...(response.data || [])]);
                } else {
                    // Replace data for new search
                    setInventoryData(response.data || []);
                    setFilteredData(response.data || []);
                }
                setHasMoreData((response.data || []).length >= 10);
                setCurrentPage(page);
            } else {
                console.error('❌ [InventoryEntryScreens] Search failed:', response.error);
                if (!isLoadMore) {
                    setInventoryData([]);
                    setFilteredData([]);
                }
                setHasMoreData(false);
            }
        } catch (error) {
            console.error('💥 [InventoryEntryScreens] Search error:', error);
            if (!isLoadMore) {
                setInventoryData([]);
                setFilteredData([]);
            }
            setHasMoreData(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Debounced search function
    const debouncedSearch = (query: string) => {
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
            if (query.trim()) {
                performSearch(query, 0, false);
            } else {
                // If query is empty, fetch fresh data
                fetchInventoryData(0, false);
            }
        }, 1000); // 1 second delay
        setSearchTimeout(timeout);
    };

    // Apply filters and search
    const applyFiltersAndSearch = () => {
        // Always use debounced search to handle both search and clear cases
        debouncedSearch(searchQuery);
    };

    // Effect to apply filters when search or filters change
    useEffect(() => {
        applyFiltersAndSearch();
        setIsEndReachedCalled(false);
    }, [searchQuery, activeFilters]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Remove active filter
    const removeFilter = (filterToRemove: ActiveFilter) => {
        setActiveFilters(prev => prev.filter(f => f.key !== filterToRemove.key));
    };

    // Handle pull-to-refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Reset to first page and reload data
            setCurrentPage(0);
            setIsEndReachedCalled(false);
            // Use current search query when refreshing
            if (searchQuery.trim()) {
                await performSearch(searchQuery, 0, false);
            } else {
                await fetchInventoryData(0, false);
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    // Helper functions for error handling and state management
    const handleFetchError = (error: any) => {
        console.error('❌ [InventoryEntryScreens] Error fetching inventory data:', error);
        
        if (error?.response?.status === 401) {
            console.error('🔐 [InventoryEntryScreens] Authentication error - user may need to login');
        } else if (error?.response?.status >= 500) {
            console.error('🚨 [InventoryEntryScreens] Server error - backend issue');
        } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
            console.error('🌐 [InventoryEntryScreens] Network error - check connection');
        } else {
            console.error('❓ [InventoryEntryScreens] Unknown error:', error?.message || 'Unknown error');
        }
    };

    const resetLoadingStates = () => {
        setLoading(false);
        setLoadingMore(false);
        setIsEndReachedCalled(false);
    };

    const processFilters = (filters: ActiveFilter[]): Record<string, string> => {
        return filters.reduce((acc, filter) => {
            if (filter.category === 'creation') {
                acc[filter.category] = filter.value;
            } else {
                acc[filter.category] = filter.value;
            }
            return acc;
        }, {} as Record<string, string>);
    };

    const handleSuccessfulResponse = (newData: InventoryItem[], isLoadMore: boolean, page: number) => {
        if (isLoadMore) {
            // Append new data to existing data
            setInventoryData(prev => [...prev, ...newData]);
            setFilteredData(prev => [...prev, ...newData]);
        } else {
            // Replace data for new search/filter
            setInventoryData(newData);
            setFilteredData(newData);
        }

        // Check if there's more data
        setHasMoreData(newData.length >= 10);
        setCurrentPage(page);
        setLastUpdateTime(Date.now());
    };

    // Fetch inventory data from API
    const fetchInventoryData = async (page: number = 0, isLoadMore: boolean = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setCurrentPage(0);
            setIsEndReachedCalled(false); // Reset flag for new search/filter
        }

        try {
            const filters = processFilters(activeFilters);

            const offset = page * 10; // 10 items per page
            const response = await getAllInventory({ 
                filters, 
                limit: 10, 
                offset: offset 
            });

            if (response.success && response.data) {
                handleSuccessfulResponse(response.data, isLoadMore, page);
            } else {
                setHasMoreData(false);
            }
        } catch (error: any) {
            handleFetchError(error);
            setHasMoreData(false);
            throw error;
        } finally {
            resetLoadingStates();
        }
    };

    // Initial load and when filters change
    useEffect(() => {
        fetchInventoryData(0, false);
    }, [activeFilters]);

    // Refresh data when screen comes into focus (e.g., after delete)
    useFocusEffect(
        React.useCallback(() => {
            console.log('🔄 [InventoryEntryScreens] Screen focused, refreshing data...');
            // Use current search query when refreshing
            if (searchQuery.trim()) {
                performSearch(searchQuery, 0, false);
            } else {
                fetchInventoryData(0, false);
            }
        }, [activeFilters, searchQuery])
    );

    // Realtime polling only when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            console.log('🔄 [InventoryEntryScreens] Screen focused, starting realtime polling...');
            
            const pollingManager = new RealtimePollingManager({
                fetchData: () => {
                    // Use current search query for realtime polling
                    if (searchQuery.trim()) {
                        return performSearch(searchQuery, 0, false);
                    } else {
                        return fetchInventoryData(0, false);
                    }
                },
                lastUpdateTime,
                onError: (error, consecutiveErrors) => {
                    console.error(`❌ [InventoryEntryScreens] Polling error (${consecutiveErrors}):`, error);
                },
                onSuccess: () => {
                    console.log('✅ [InventoryEntryScreens] Polling successful');
                },
                onActivityDetected: () => {
                    console.log('📦 [InventoryEntryScreens] Recent activity detected');
                },
                onInactivityDetected: () => {
                    console.log('⏰ [InventoryEntryScreens] Switching to slow polling');
                }
            });

            // Start polling when screen is focused
            pollingManager.start();

            // Cleanup function - this will be called when screen loses focus
            return () => {
                console.log('🔄 [InventoryEntryScreens] Screen unfocused, stopping realtime polling...');
                // Cleanup completely when leaving screen
                pollingManager.cleanup();
            };
        }, [activeFilters, lastUpdateTime, searchQuery])
    );

    // Handle item click to navigate to detail
    const handleItemPress = async (item: InventoryItem) => {
        try {            
            // Call API to get detail
            const response = await getInventoryDetail(item.name);
            
            if (response.success && response.data) {
                
                // Navigate to detail screen with data
                (navigation as any).navigate('InventoryDetailScreen', {
                    inventoryDetail: response.data
                });
            } else {
                Alert.alert('Lỗi', 'Không thể tải chi tiết phiếu nhập xuất');
            }
        } catch (error) {
            console.error('💥 [InventoryEntryScreens] Error handling item press:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải chi tiết');
        }
    };

    const loadMoreData = () => {
        if (isEndReachedCalled) {
            return;
        }
    
        if (!loadingMore && hasMoreData) {
            setIsEndReachedCalled(true);
            
            // If searching, use performSearch with load more
            if (searchQuery.trim()) {
                performSearch(searchQuery, currentPage + 1, true);
            } else {
                // If not searching, use normal fetch
                fetchInventoryData(currentPage + 1, true);
            }
        }
    };

    // Render inventory item
    const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
        const statusInfo = getStatusInfo(item.workflow_state, item.docstatus);
        const typeLabel = getEntryTypeLabel(item.stock_entry_type);

        return (
            <TouchableOpacity 
                style={inventoryEntryStyles.inventoryItem}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
            >
                {/* Header với ID và Status */}
                <View style={inventoryEntryStyles.itemHeader}>
                    <Text style={inventoryEntryStyles.itemId}>{item.name}</Text>
                    <View style={[inventoryEntryStyles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                        <Text style={[inventoryEntryStyles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>
                {item.creation !== undefined && (
                            <View style={inventoryEntryStyles.compactRow}>
                                <Text style={inventoryEntryStyles.compactLabel}>
                                    Ngày Ghi Sổ:
                                </Text>
                                <Text style={inventoryEntryStyles.compactValue}>
                                    {formatDate(item.creation)}
                                </Text>
                            </View>
                        )}

                <View style={inventoryEntryStyles.itemContent}>                    
                    <View style={inventoryEntryStyles.leftColumn}>
                        <View style={inventoryEntryStyles.compactRow}>
                            <Text style={inventoryEntryStyles.compactLabel}>Mô tả:</Text>
                            <Text
                                style={inventoryEntryStyles.compactValue}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {item.custom_interpretation || '—'}
                            </Text>
                        </View>

    
                    </View>

                    
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={inventoryEntryStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={inventoryEntryStyles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: wp(2) }}>
                        <Feather name="arrow-left" size={wp(5)} color={colors.gray800} />
                    </TouchableOpacity>
                    <Text style={inventoryEntryStyles.headerTitle}>Quản Lý Nhập Xuất Kho</Text>
                    <View style={{ width: wp(7) }} />
                </View>

                {/* Enhanced Search Bar */}
                <View style={inventoryEntryStyles.searchContainer}>
                    <View style={inventoryEntryStyles.enhancedSearchBar}>
                        {/* Search Icon */}
                        <View style={inventoryEntryStyles.searchIconContainer}>
                            <Feather name="search" size={wp(4.5)} color={colors.gray500} />
                        </View>
                        
                        {/* Search Input */}
                        <TextInput
                            style={inventoryEntryStyles.enhancedSearchInput}
                            placeholder="Nhập mã phiếu"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={colors.gray500}
                        />
                        
                        {/* Clear Search Button */}
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={inventoryEntryStyles.clearSearchButton}
                                onPress={() => setSearchQuery('')}
                                activeOpacity={0.7}
                            >
                                <Feather name="x" size={wp(4)} color={colors.gray500} />
                            </TouchableOpacity>
                        )}
                        
                        {/* Filter Button */}
                        <TouchableOpacity
                            style={[inventoryEntryStyles.enhancedFilterButton, 
                                activeFilters.length > 0 && inventoryEntryStyles.filterButtonActive]}
                            onPress={() => setIsFilterModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Feather 
                                name="filter" 
                                size={wp(4.5)} 
                                color={activeFilters.length > 0 ? colors.white : colors.gray600} 
                            />
                            {activeFilters.length > 0 && (
                                <View style={inventoryEntryStyles.filterBadge}>
                                    <Text style={inventoryEntryStyles.filterBadgeText}>
                                        {activeFilters.length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        
                        {/* Scan Button */}
                        <TouchableOpacity
                            style={inventoryEntryStyles.scanButton}
                            onPress={() => {
                                setIsScanning(false);
                                setIsScannerVisible(true);
                            }}
                            activeOpacity={0.7}
                        >
                            <Feather name="maximize" size={wp(4.5)} color={colors.white} />
                        </TouchableOpacity>
                        
                        {/* Add Button */}
                        <TouchableOpacity
                            style={inventoryEntryStyles.addButton}
                            onPress={() => {
                                navigation.navigate('InsertInventoryScreen');
                            }}
                            activeOpacity={0.7}
                        >
                            <Feather name="plus" size={wp(4.5)} color={colors.white} />
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
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={renderInventoryItem}
                style={inventoryEntryStyles.resultsList}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#3B82F6']} // Android
                        tintColor="#3B82F6" // iOS
                        title="Đang tải lại..."
                        titleColor="#6B7280"
                    />
                }
                ListFooterComponent={() => {
                    if (loadingMore) {
                        return (
                            <View style={inventoryEntryStyles.loadingMoreContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={inventoryEntryStyles.loadingMoreText}>Đang tải thêm...</Text>
                            </View>
                        );
                    }
                    if (!hasMoreData && filteredData.length > 0) {
                        return (
                            <View style={inventoryEntryStyles.noMoreDataContainer}>
                                <Text style={inventoryEntryStyles.noMoreDataText}>Đã tải hết dữ liệu</Text>
                            </View>
                        );
                    }
                    return null;
                }}
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
                    return options;
                })()}
            />

            {/* Barcode Scanner */}
            <BarcodeScanner
                visible={isScannerVisible}
                onClose={() => setIsScannerVisible(false)}
                onScan={handleBarcodeScan}
                title="Quét Mã QR"
            />
        </SafeAreaView>
    );
}