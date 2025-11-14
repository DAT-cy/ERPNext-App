
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
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../styles/globalStyles';
import { wp } from '../../utils/responsive';
import { inventoryEntryStyles } from '../../styles/InventoryEntryScreens.styles';
import { InventoryFilterModal } from '../../components/InventoryFilter';
import { RealtimePollingManager } from '../../utils/RealtimePollingManager';
import { getAllShipments, Shipment, ShipmentFilters } from '../../services/shipmentService';

type ShipmentItem = Shipment;

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
      { value: 'Draft', label: 'Nháp', category: 'workflow_state' },
      { value: 'Yêu cầu vận chuyển', label: 'Yêu cầu vận chuyển', category: 'workflow_state' },
      { value: 'Lái xe vào lấy hàng', label: 'Lái xe vào lấy hàng', category: 'workflow_state' },
      { value: 'Đang vận chuyển', label: 'Đang vận chuyển', category: 'workflow_state' },
      { value: 'Hoàn thành', label: 'Hoàn thành', category: 'workflow_state' },
      { value: 'Hủy', label: 'Hủy', category: 'workflow_state' },
    ],
    creation: [
      { value: 'Một Ngày', label: 'Một Ngày', category: 'creation' },
      { value: 'Nhiều Ngày', label: 'Nhiều Ngày', category: 'creation' },
    ],
    vehicle: [
      { value: 'Nội bộ', label: 'Nội bộ', category: 'custom_service_provider_type' },
      { value: 'Grab', label: 'Grab', category: 'custom_service_provider_type' },
      { value: 'Xe ôm', label: 'Xe ôm', category: 'custom_service_provider_type' },
      { value: 'Xe tải', label: 'Xe tải', category: 'custom_service_provider_type' },
      { value: 'xe lôi', label: 'xe lôi', category: 'custom_service_provider_type' },
    ],
  };

  useEffect(() => {
    // initial load
    fetchData(0, false);
  }, []);


  const getStatusInfo = (state?: string, docstatus?: string | number) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      'Nháp': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
      'Yêu cầu vận chuyển': { text: 'Yêu cầu vận chuyển', color: '#F59E0B', bgColor: '#FFFBEB' },
      'Lái xe vào lấy hàng': { text: 'Lái xe vào lấy hàng', color: '#06B6D4', bgColor: '#ECFEFF' },
      'Đang vận chuyển': { text: 'Đang vận chuyển', color: '#3B82F6', bgColor: '#EFF6FF' },
      'Hoàn thành': { text: 'Hoàn thành', color: '#8B5CF6', bgColor: '#F5F3FF' },
      'Hủy': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' },
      'Draft': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
    };

    if (!state && docstatus !== undefined) {
      const docstatusNumber = typeof docstatus === 'string' ? parseInt(docstatus) : docstatus;
      switch (docstatusNumber) {
        case 0: return { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' };
        case 1: return { text: 'Yêu cầu vận chuyển', color: '#F59E0B', bgColor: '#FFFBEB' };
        case 2: return { text: 'Lái xe vào lấy hàng', color: '#06B6D4', bgColor: '#ECFEFF' };
        case 3: return { text: 'Đang vận chuyển', color: '#3B82F6', bgColor: '#EFF6FF' };
        case 4: return { text: 'Hoàn thành', color: '#8B5CF6', bgColor: '#F5F3FF' };
        case 5: return { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' };
      }
    }

    // Nếu không tìm thấy trong statusMap, trả về giá trị mặc định
    const statusInfo = statusMap[state || ''];
    if (statusInfo) {
      return statusInfo;
    }

    // Hiển thị giá trị gốc nếu không match
    return { text: state || '—', color: colors.gray500, bgColor: colors.gray100 };
  };

  const transformFilters = (filters: ActiveFilter[]): ShipmentFilters => {
    return filters.reduce((acc, filter) => {
      acc[filter.category as keyof ShipmentFilters] = filter.value;
      return acc;
    }, {} as ShipmentFilters);
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
      const filters = transformFilters(activeFilters);
      const offset = page * 10;
      const response = await getAllShipments({
        filters,
        limit: 10,
        offset,
        fields: ["name", "workflow_state", "custom_posting_date", "custom_vehicle", "custom_service_provider_type"]
      });

      if (response.success && response.data) {
        if (isLoadMore) {
          setData(prev => [...prev, ...response.data!]);
        } else {
          setData(response.data);
        }
        setHasMoreData(response.data.length >= 10);
        setCurrentPage(page);
        setLastUpdateTime(Date.now());
      } else {
        if (!isLoadMore) {
          setData([]);
        }
        setHasMoreData(false);
        if (response.error) {
          Alert.alert('Lỗi', response.error);
        }
      }
    } catch (error) {
      console.error('❌ [ShipmentScreen] Fetch error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phiếu giao hàng');
      setHasMoreData(false);
      if (!isLoadMore) {
        setData([]);
      }
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
      const filters: ShipmentFilters = {
        ...transformFilters(activeFilters),
        name: `%${query.trim()}%`
      };

      const response = await getAllShipments({
        filters,
        limit: 10,
        offset: 0,
        fields: ["name", "workflow_state", "custom_posting_date", "custom_vehicle", "custom_service_provider_type"]
      });

      if (response.success && response.data) {
        setData(response.data);
        setHasMoreData(response.data.length >= 10);
      } else {
        setData([]);
        setHasMoreData(false);
        if (response.error) {
          console.error('💥 [ShipmentScreen] Search error:', response.error);
        }
      }
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
        onActivityDetected: () => { },
        onInactivityDetected: () => { },
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
    const statusInfo = getStatusInfo(item.workflow_state);
    return (
      <TouchableOpacity style={inventoryEntryStyles.inventoryItem} activeOpacity={0.7}
        onPress={() => {
          navigation.push('ShipmentScreenDetail', {
            shipmentDetail: item
          });
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
        {item.custom_posting_date && (
          <View style={inventoryEntryStyles.compactRow}>
            <Text style={inventoryEntryStyles.compactLabel}>Ngày đăng:</Text>
            <Text style={inventoryEntryStyles.compactValue}>{item.custom_posting_date}</Text>
          </View>
        )}
        <View style={inventoryEntryStyles.itemContent}>
          <View style={inventoryEntryStyles.leftColumn}>
            {item.custom_vehicle && (
              <View style={inventoryEntryStyles.compactRow}>
                <Text style={inventoryEntryStyles.compactLabel}>Xe:</Text>
                <Text style={inventoryEntryStyles.compactValue} numberOfLines={1} ellipsizeMode="tail">
                  {item.custom_vehicle}
                </Text>
              </View>
            )}
            {item.custom_service_provider_type && (
              <View style={inventoryEntryStyles.compactRow}>
                <Text style={inventoryEntryStyles.compactLabel}>Loại dịch vụ:</Text>
                <Text style={inventoryEntryStyles.compactValue} numberOfLines={1} ellipsizeMode="tail">
                  {item.custom_service_provider_type}
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
            <TouchableOpacity
              style={inventoryEntryStyles.addButton}
              onPress={() => {
                navigation.navigate('InsertShipment');
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
        <Text style={inventoryEntryStyles.resultsTitle}>Phiếu Giao Hàng</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderItem}
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
          if (!hasMoreData && data.length > 0) {
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
        filterOptions={staticFilterOptions}
      />
    </SafeAreaView>
  );
}


