// src/screens/shipmentScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../styles/globalStyles';
import { wp } from '../utils/responsive';
import { inventoryEntryStyles } from '../styles/InventoryEntryScreens.styles';
import { InventoryFilterModal } from '../components/InventoryFilter';
import { RealtimePollingManager } from '../utils/RealtimePollingManager';

type ShipmentItem = {
  name: string;
  creation?: string;
  customer_name?: string;
  workflow_state?: string;
  docstatus?: number | string;
  description?: string;
};

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

const filterCategories: FilterCategory[] = [
  { key: 'workflow_state', title: 'Trạng Thái', icon: '📅' },
  { key: 'creation', title: 'Ngày Tạo', icon: '📅' },
];

export default function ShipmentScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [data, setData] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isEndReachedCalled, setIsEndReachedCalled] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // Set default workflow_state on first load if not present
    setActiveFilters(prev => {
      let next = prev;
      if (!next.some(f => f.category === 'workflow_state')) {
        next = [
          ...next,
          { key: 'workflow_state', label: 'Yêu cầu', category: 'workflow_state', value: 'Yêu cầu' },
        ];
      }
      return next;
    });
    // initial load
    fetchData(0, false);
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusInfo = (state?: string, docstatus?: string | number) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      'Nháp': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
      'Draft': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
      'Đang xử lý': { text: 'Đang xử lý', color: '#F59E0B', bgColor: '#FFFBEB' },
      'Đã xử lý': { text: 'Đã xử lý', color: '#10B981', bgColor: '#F0FDF4' },
      'Hủy': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' },
      'Cancelled': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' },
      'Yêu cầu': { text: 'Yêu cầu', color: colors.warning, bgColor: '#FFFBEB' },
      'Đóng': { text: 'Đóng', color: '#6B7280', bgColor: '#F3F4F6' },
      'Closed': { text: 'Đóng', color: '#6B7280', bgColor: '#F3F4F6' },
    };

    if (!state && docstatus !== undefined) {
      const docstatusNumber = typeof docstatus === 'string' ? parseInt(docstatus) : docstatus;
      switch (docstatusNumber) {
        case 0: return { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' };
        case 1: return { text: 'Đã xử lý', color: '#10B981', bgColor: '#F0FDF4' };
        case 2: return { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' };
      }
    }

    return statusMap[state || ''] || { text: state || '—', color: colors.gray500, bgColor: colors.gray100 };
  };

  const transformFilters = (filters: ActiveFilter[]): Record<string, string> => {
    return filters.reduce((acc, filter) => {
      acc[filter.category] = filter.value;
      return acc;
    }, {} as Record<string, string>);
  };

  const fetchData = async (page: number = 0, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setCurrentPage(0);
      setIsEndReachedCalled(false);
    }

    try {
      // TODO: Replace with shipmentService API when available
      // const filters = transformFilters(activeFilters);
      // const offset = page * 10;
      // const response = await getShipments({ filters, limit: 10, offset });
      // if (response.success && response.data) {
      //   ...
      // }

      const mock: ShipmentItem[] = [];
      if (isLoadMore) {
        setData(prev => [...prev, ...mock]);
      } else {
        setData(mock);
      }
      setHasMoreData(mock.length >= 10);
      setCurrentPage(page);
      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error('❌ [ShipmentScreen] Fetch error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phiếu giao hàng');
      setHasMoreData(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setCurrentPage(0);
    setIsEndReachedCalled(false);
    try {
      // TODO: connect search with shipment service
      const filtered = data.filter(it => it.name?.toLowerCase().includes(query.toLowerCase()));
      setData(filtered);
      setHasMoreData(false);
    } catch (error) {
      console.error('💥 [ShipmentScreen] Search error:', error);
      setData([]);
      setHasMoreData(false);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = (query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        fetchData(0, false);
      }
    }, 800);
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    debouncedSearch(searchQuery);
    setIsEndReachedCalled(false);
  }, [searchQuery, activeFilters]);

  useEffect(() => () => { if (searchTimeout) clearTimeout(searchTimeout); }, [searchTimeout]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (searchQuery.trim()) {
        await performSearch(searchQuery);
      } else {
        await fetchData(0, false);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const pollingManager = new RealtimePollingManager({
        fetchData: () => {
          if (searchQuery.trim()) {
            return performSearch(searchQuery);
          } else {
            return fetchData(0, false);
          }
        },
        lastUpdateTime,
        onError: (error, consecutiveErrors) => {
          console.error(`❌ [ShipmentScreen] Polling error (${consecutiveErrors}):`, error);
        },
        onSuccess: () => {
          // no-op
        },
        onActivityDetected: () => {},
        onInactivityDetected: () => {},
      });

      pollingManager.start();
      return () => pollingManager.cleanup();
    }, [lastUpdateTime, searchQuery])
  );

  const removeFilter = (filterToRemove: ActiveFilter) => {
    setActiveFilters(prev => prev.filter(f => f.key !== filterToRemove.key));
  };

  const loadMoreData = () => {
    if (isEndReachedCalled) return;
    if (!loadingMore && hasMoreData) {
      setIsEndReachedCalled(true);
      if (searchQuery.trim()) {
        // for now, disable load-more in search mode
        return;
      } else {
        fetchData(currentPage + 1, true);
      }
    }
  };

  const renderItem = ({ item }: { item: ShipmentItem }) => {
    const statusInfo = getStatusInfo(item.workflow_state, item.docstatus);
    return (
      <TouchableOpacity style={inventoryEntryStyles.inventoryItem} activeOpacity={0.7}
        onPress={() => {
          Alert.alert('Thông tin', `Mở chi tiết: ${item.name}`);
        }}
      >
        <View style={inventoryEntryStyles.itemHeader}>
          <Text style={inventoryEntryStyles.itemId}>{item.name}</Text>
          <View style={[inventoryEntryStyles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[inventoryEntryStyles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        {item.creation && (
          <View style={inventoryEntryStyles.compactRow}>
            <Text style={inventoryEntryStyles.compactLabel}>Ngày tạo:</Text>
            <Text style={inventoryEntryStyles.compactValue}>{formatDate(item.creation)}</Text>
          </View>
        )}
        <View style={inventoryEntryStyles.itemContent}>
          <View style={inventoryEntryStyles.leftColumn}>
            <View style={inventoryEntryStyles.compactRow}>
              <Text style={inventoryEntryStyles.compactLabel}>Khách hàng:</Text>
              <Text style={inventoryEntryStyles.compactValue} numberOfLines={1} ellipsizeMode="tail">
                {item.customer_name || '—'}
              </Text>
            </View>
            {!!item.description && (
              <View style={inventoryEntryStyles.compactRow}>
                <Text style={inventoryEntryStyles.compactLabel}>Mô tả:</Text>
                <Text style={inventoryEntryStyles.compactValue} numberOfLines={2} ellipsizeMode="tail">
                  {item.description}
                </Text>
              </View>
            )}
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
          <Text style={inventoryEntryStyles.headerTitle}>Quản Lý Giao Hàng</Text>
          <View style={{ width: wp(7) }} />
        </View>

        {/* Enhanced Search Bar */}
        <View style={inventoryEntryStyles.searchContainer}>
          <View style={inventoryEntryStyles.enhancedSearchBar}>
            <View style={inventoryEntryStyles.searchIconContainer}>
              <Feather name="search" size={wp(4.5)} color={colors.gray500} />
            </View>
            <TextInput
              style={inventoryEntryStyles.enhancedSearchInput}
              placeholder="Nhập mã phiếu giao hàng, khách hàng..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray500}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={inventoryEntryStyles.clearSearchButton}
                onPress={() => setSearchQuery('')}
                activeOpacity={0.7}
              >
                <Feather name="x" size={wp(4)} color={colors.gray500} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[inventoryEntryStyles.enhancedFilterButton, activeFilters.length > 0 && inventoryEntryStyles.filterButtonActive]}
              onPress={() => setIsFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Feather name="filter" size={wp(4.5)} color={activeFilters.length > 0 ? colors.white : colors.gray600} />
              {activeFilters.length > 0 && (
                <View style={inventoryEntryStyles.filterBadge}>
                  <Text style={inventoryEntryStyles.filterBadgeText}>{activeFilters.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={inventoryEntryStyles.activeFiltersContainer}>
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
        <Text style={inventoryEntryStyles.resultsTitle}>Phiếu Giao Hàng</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderItem}
        style={inventoryEntryStyles.resultsList}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
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
          if (!hasMoreData && data.length > 0) {
            return (
              <View style={inventoryEntryStyles.noMoreDataContainer}>
                <Text style={inventoryEntryStyles.noMoreDataText}>Đã tải hết dữ liệu</Text>
              </View>
            );
          }
          return null;
        }}
        ListEmptyComponent={() => (
          !loading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.gray600 }}>Không có dữ liệu</Text>
            </View>
          ) : null
        )}
      />

      {/* Filter Modal */}
      <InventoryFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        filterCategories={filterCategories}
        filterOptions={staticFilterOptions}
      />
    </SafeAreaView>
  );
}


