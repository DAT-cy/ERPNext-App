// src/screens/DeliveryNote/DeliveryNoteScreen.tsx
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
import { DeliveryNote } from '../../types/deliveryNote.types';
import { deliveryNoteStyles } from '../../styles/DeliveryNoteScreen.styles';
import { InventoryFilterModal } from '../../components/InventoryFilter';
import { getDeliveryNote, DeliveryNoteFilters } from '../../services/deliveryNoteService';
import { RealtimePollingManager } from '../../utils/RealtimePollingManager';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';

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

// Filter categories for Delivery Note
const filterCategories: FilterCategory[] = [
    { key: 'workflow_state', title: 'Trạng Thái', icon: '📅' },
    { key: 'creation', title: 'Ngày Tạo', icon: '📅' },
];

export default function DeliveryNoteScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [deliveryNoteData, setDeliveryNoteData] = useState<DeliveryNote[]>([]);
    const [filteredData, setFilteredData] = useState<DeliveryNote[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [hasMoreData, setHasMoreData] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [isEndReachedCalled, setIsEndReachedCalled] = useState<boolean>(false);
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [filterOptions, setFilterOptions] = useState<Record<string, FilterOption[]>>({});
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isScannerVisible, setIsScannerVisible] = useState(false);
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
        creation: [
            { value: 'Một Ngày', label: 'Một Ngày', category: 'creation' },
            { value: 'Nhiều Ngày', label: 'Nhiều Ngày', category: 'creation' },
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
            // For now, use static options
            // In the future, you can add API calls to load dynamic filter options
            setFilterOptions(staticFilterOptions);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
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
    const getStatusInfo = (state: string) => {
        const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
            'Nháp': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' }, // Blue
            'Draft': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' }, // Blue
            'Đang xử lý': { text: 'Đang xử lý', color: '#F59E0B', bgColor: '#FFFBEB' }, // Yellow
            'Đã xử lý': { text: 'Đã xử lý', color: '#10B981', bgColor: '#F0FDF4' }, // Green
            'Hủy': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' }, // Red
            'Cancelled': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' }, // Red
            'Yêu cầu': { text: 'Yêu cầu', color: colors.warning, bgColor: '#FFFBEB' },
            'Submitted': { text: 'Đã gửi', color: '#F59E0B', bgColor: '#FFFBEB' }, // Yellow
            'Delivered': { text: 'Đã giao', color: '#10B981', bgColor: '#F0FDF4' }, // Green
            'In Transit': { text: 'Đang giao', color: '#F59E0B', bgColor: '#FFFBEB' }, // Yellow
        };

        return statusMap[state] || { text: state, color: colors.gray500, bgColor: colors.gray100 };
    };

    // Handle barcode scan -> try search directly
    const handleBarcodeScan = async (barcode: string) => {
        // Prevent multiple simultaneous scans
        if (isScanning) {
            console.log('🚫 [DeliveryNoteScreen] Scan already in progress, ignoring duplicate scan');
            return;
        }

        try {
            console.log('🔍 [DeliveryNoteScreen] Starting scan for barcode:', barcode);
            setIsScanning(true);
            setIsScannerVisible(false);
            
            // Validate barcode input
            if (!barcode || barcode.trim().length === 0) {
                console.log('❌ [DeliveryNoteScreen] Invalid barcode input');
                setIsScanning(false);
                return;
            }
            // Set search query and trigger search
            setSearchQuery(barcode.trim());
            console.log('✅ [DeliveryNoteScreen] Scan successful, searching for:', barcode);
        } catch (error) {
            // Error: show message
            console.log('💥 [DeliveryNoteScreen] Scan error:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi quét mã. Vui lòng thử lại.', [{ text: 'OK' }]);
        } finally {
            console.log('🏁 [DeliveryNoteScreen] Scan completed, resetting state');
            setIsScanning(false);
        }
    };

    // Search with API call (debounced)
    const performSearch = async (query: string) => {
        console.log('🔍 [DeliveryNoteScreen] Starting search with query:', query);
        setLoading(true);
        setCurrentPage(0);
        setIsEndReachedCalled(false);
        
        try {
            const filters: DeliveryNoteFilters = activeFilters.reduce((acc, filter) => {
                if (filter.category === 'creation') {
                    acc[filter.category] = filter.value;
                } else if (filter.category === 'workflow_state' && filter.value) {
                    acc[filter.category] = filter.value;
                }
                return acc;
            }, {} as DeliveryNoteFilters);

            // Add search filter for multiple fields
            if (query.trim()) {
                filters.search_query = query;
                console.log('🔍 [DeliveryNoteScreen] Search filters:', filters);
            }

            const response = await getDeliveryNote({ 
                filters,
                limit: 10, 
                offset: 0 
            });

            console.log('🔍 [DeliveryNoteScreen] Search response:', response);

            if (response.success && response.data) {
                setDeliveryNoteData(response.data);
                setFilteredData(response.data);
                setHasMoreData(response.data.length >= 10);
                console.log('✅ [DeliveryNoteScreen] Search successful, found', response.data.length, 'items');
            } else {
                console.error('❌ [DeliveryNoteScreen] Search failed:', response.error);
                setDeliveryNoteData([]);
                setFilteredData([]);
                setHasMoreData(false);
            }
        } catch (error) {
            console.error('💥 [DeliveryNoteScreen] Search error:', error);
            setDeliveryNoteData([]);
            setFilteredData([]);
            setHasMoreData(false);
        } finally {
            setLoading(false);
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
                performSearch(query);
            } else {
                // If query is empty, fetch fresh data
                fetchDeliveryNoteData(0, false);
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
                await performSearch(searchQuery);
            } else {
                await fetchDeliveryNoteData(0, false);
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    // Helper functions for error handling and state management
    const handleFetchError = (error: any) => {
        console.error('❌ [DeliveryNoteScreen] Error fetching delivery note data:', error);
        
        if (error?.response?.status === 401) {
            console.error('🔐 [DeliveryNoteScreen] Authentication error - user may need to login');
        } else if (error?.response?.status >= 500) {
            console.error('🚨 [DeliveryNoteScreen] Server error - backend issue');
        } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
            console.error('🌐 [DeliveryNoteScreen] Network error - check connection');
        } else {
            console.error('❓ [DeliveryNoteScreen] Unknown error:', error?.message || 'Unknown error');
        }
    };

    const resetLoadingStates = () => {
        setLoading(false);
        setLoadingMore(false);
        setIsEndReachedCalled(false);
    };

    const processFilters = (filters: ActiveFilter[]): DeliveryNoteFilters => {
        return filters.reduce((acc, filter) => {
            if (filter.category === 'creation') {
                acc[filter.category] = filter.value;
            } else if (filter.category === 'workflow_state' && filter.value) {
                acc[filter.category] = filter.value;
            } else if (filter.category === 'customer' && filter.value) {
                acc[filter.category] = filter.value;
            }
            return acc;
        }, {} as DeliveryNoteFilters);
    };

    const handleSuccessfulResponse = (newData: DeliveryNote[], isLoadMore: boolean, page: number) => {
        if (isLoadMore) {
            // Append new data to existing data
            setDeliveryNoteData(prev => [...prev, ...newData]);
            setFilteredData(prev => [...prev, ...newData]);
        } else {
            // Replace data for new search/filter
            setDeliveryNoteData(newData);
            setFilteredData(newData);
        }

        // Check if there's more data
        setHasMoreData(newData.length >= 10);
        setCurrentPage(page);
        setLastUpdateTime(Date.now());
    };

    // Fetch delivery note data from API
    const fetchDeliveryNoteData = async (page: number = 0, isLoadMore: boolean = false) => {
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
            const response = await getDeliveryNote({ 
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
        fetchDeliveryNoteData(0, false);
    }, [activeFilters]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            console.log('🔄 [DeliveryNoteScreen] Screen focused, refreshing data...');
            // Use current search query when refreshing
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchDeliveryNoteData(0, false);
            }
        }, [activeFilters, searchQuery])
    );

    // Realtime polling only when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            console.log('🔄 [DeliveryNoteScreen] Screen focused, starting realtime polling...');
            
            const pollingManager = new RealtimePollingManager({
                fetchData: () => {
                    // Use current search query for realtime polling
                    if (searchQuery.trim()) {
                        return performSearch(searchQuery);
                    } else {
                        return fetchDeliveryNoteData(0, false);
                    }
                },
                lastUpdateTime,
                onError: (error, consecutiveErrors) => {
                    console.error(`❌ [DeliveryNoteScreen] Polling error (${consecutiveErrors}):`, error);
                },
                onSuccess: () => {
                    console.log('✅ [DeliveryNoteScreen] Polling successful');
                },
                onActivityDetected: () => {
                    console.log('📦 [DeliveryNoteScreen] Recent activity detected');
                },
                onInactivityDetected: () => {
                    console.log('⏰ [DeliveryNoteScreen] Switching to slow polling');
                }
            });

            // Start polling when screen is focused
            pollingManager.start();

            // Cleanup function - this will be called when screen loses focus
            return () => {
                console.log('🔄 [DeliveryNoteScreen] Screen unfocused, stopping realtime polling...');
                // Cleanup completely when leaving screen
                pollingManager.cleanup();
            };
        }, [activeFilters, lastUpdateTime, searchQuery])
    );

    // Handle item click -> navigate to detail and auto fill code via params
    const handleItemPress = (item: DeliveryNote) => {
        try {
            navigation.navigate('DeliveryNoteDetailScreen', { name: item.custom_id });
        } catch (error) {
            console.error('💥 [DeliveryNoteScreen] Error navigating to detail:', error);
            Alert.alert('Lỗi', 'Không thể mở chi tiết phiếu');
        }
    };

    const loadMoreData = () => {
        if (isEndReachedCalled) {
            return;
        }
    
        if (!loadingMore && hasMoreData) {
            setIsEndReachedCalled(true);
            
            // If searching, we need to handle load more differently for multi-field search
            if (searchQuery.trim()) {
                // For multi-field search, we'll need to implement pagination in the service
                // For now, disable load more during search to avoid complexity
                console.log('⚠️ [DeliveryNoteScreen] Load more during search not yet implemented');
                return;
            } else {
                // If not searching, use normal fetch
                fetchDeliveryNoteData(currentPage + 1, true);
            }
        }
    };

    // Render delivery note item
    const renderDeliveryNoteItem = ({ item }: { item: DeliveryNote }) => {
        const statusInfo = getStatusInfo(item.workflow_state);
        
        // Debug customer data
        console.log('🔍 [DeliveryNoteScreen] Item customer data:', {
            custom_id: item.custom_id,
            customer: item.customer,
            custom_customer_company: item.customer_name,
        });

        return (
            <TouchableOpacity 
                style={deliveryNoteStyles.deliveryNoteItem}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
            >
                {/* Header với ID và Status */}
                <View style={deliveryNoteStyles.itemHeader}>
                    <View style={deliveryNoteStyles.idDateRow}>
                        <Text style={deliveryNoteStyles.itemIdWithDate}>{item.custom_id}</Text>
                        {item.creation && (
                            <Text style={deliveryNoteStyles.itemDate}> - {formatDate(item.creation)}</Text>
                        )}
                    </View>
                    <View style={[deliveryNoteStyles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                        <Text style={[deliveryNoteStyles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>
                <View style={deliveryNoteStyles.itemContent}>                    
                    <View style={deliveryNoteStyles.leftColumn}>
                        <View style={deliveryNoteStyles.compactRow}>
                            <Text style={deliveryNoteStyles.compactLabel}>Khách hàng:</Text>
                            <Text
                                style={deliveryNoteStyles.compactValue}
                                numberOfLines={2}   
                                ellipsizeMode="tail"
                            >
                                {item.customer_name}
                            </Text>
                        </View>

                        <View style={deliveryNoteStyles.compactRow}>
                            <Text style={deliveryNoteStyles.compactLabel}>Hóa đơn:</Text>
                            <Text
                                style={deliveryNoteStyles.compactValue}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {item.custom_sales_invoice || '—'}
                            </Text>
                        </View>


                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={deliveryNoteStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={deliveryNoteStyles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: wp(2) }}>
                        <Feather name="arrow-left" size={wp(5)} color={colors.gray800} />
                    </TouchableOpacity>
                    <Text style={deliveryNoteStyles.headerTitle}>Phiếu Giao Hàng</Text>
                    <View style={{ width: wp(7) }} />
                </View>

                {/* Enhanced Search Bar */}
                <View style={deliveryNoteStyles.searchContainer}>
                    <View style={deliveryNoteStyles.enhancedSearchBar}>
                        {/* Search Icon */}
                        <View style={deliveryNoteStyles.searchIconContainer}>
                            <Feather name="search" size={wp(4.5)} color={colors.gray500} />
                        </View>
                        
                        {/* Search Input */}
                        <TextInput
                            style={deliveryNoteStyles.enhancedSearchInput}
                            placeholder="Tìm theo mã, hóa đơn, khách hàng..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={colors.gray500}
                        />
                        
                        {/* Clear Search Button */}
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={deliveryNoteStyles.clearSearchButton}
                                onPress={() => setSearchQuery('')}
                                activeOpacity={0.7}
                            >
                                <Feather name="x" size={wp(4)} color={colors.gray500} />
                            </TouchableOpacity>
                        )}
                        
                        {/* Filter Button */}
                        <TouchableOpacity
                            style={[deliveryNoteStyles.enhancedFilterButton, 
                                activeFilters.length > 0 && deliveryNoteStyles.filterButtonActive]}
                            onPress={() => setIsFilterModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Feather 
                                name="filter" 
                                size={wp(4.5)} 
                                color={colors.white} 
                            />
                            {activeFilters.length > 0 && (
                                <View style={deliveryNoteStyles.filterBadge}>
                                    <Text style={deliveryNoteStyles.filterBadgeText}>
                                        {activeFilters.length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        
                        {/* Scan Button */}
                        <TouchableOpacity
                            style={deliveryNoteStyles.scanButton}
                            onPress={() => {
                                setIsScanning(false);
                                setIsScannerVisible(true);
                            }}
                            activeOpacity={0.7}
                        >
                            <Feather name="maximize" size={wp(4.5)} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={deliveryNoteStyles.activeFiltersContainer}
                    >
                        {activeFilters.map((filter) => (
                            <View key={filter.key} style={deliveryNoteStyles.activeFilterTag}>
                                <Text style={deliveryNoteStyles.activeFilterText}>{filter.label}</Text>
                                <TouchableOpacity onPress={() => removeFilter(filter)}>
                                    <Feather name="x" size={wp(3.5)} color={colors.warning} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Results */}
            <View style={deliveryNoteStyles.resultsHeader}>
                <Text style={deliveryNoteStyles.resultsTitle}>Danh Sách Phiếu Giao Hàng</Text>
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={(item, index) => `${item.custom_id}-${index}`}
                renderItem={renderDeliveryNoteItem}
                style={deliveryNoteStyles.resultsList}
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
                            <View style={deliveryNoteStyles.loadingMoreContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={deliveryNoteStyles.loadingMoreText}>Đang tải thêm...</Text>
                            </View>
                        );
                    }
                    if (!hasMoreData && filteredData.length > 0) {
                        return (
                            <View style={deliveryNoteStyles.noMoreDataContainer}>
                                <Text style={deliveryNoteStyles.noMoreDataText}>Đã tải hết dữ liệu</Text>
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
                    const options = Object.keys(filterOptions).length > 0 ? filterOptions : staticFilterOptions;
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
