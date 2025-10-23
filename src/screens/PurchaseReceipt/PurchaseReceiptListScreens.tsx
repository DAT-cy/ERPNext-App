// src/screens/PurchaseReceipt/PurchaseReceiptListScreens.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../styles/globalStyles';
import { wp, hp } from '../../utils/responsive';
import { deliveryNoteStyles as styles } from '../../styles/DeliveryNoteScreen.styles';
import { InventoryFilterModal } from '../../components/InventoryFilter';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';
import {
  getPurchaseReceipt,
  PurchaseReceipt,
  PurchaseReceiptFilters,
} from '../../services/purchaseReceiptService';

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

export default function PurchaseReceiptListScreens() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [data, setData] = useState<PurchaseReceipt[]>([]);
  const [filteredData, setFilteredData] = useState<PurchaseReceipt[]>([]);
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

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      setFilterOptions(staticFilterOptions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
    // Set default filter for "Yêu cầu" status
    setActiveFilters([
      { key: 'workflow_state', label: 'Yêu cầu', category: 'workflow_state', value: 'Yêu cầu' }
    ]);
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

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

  const handleBarcodeScan = async (barcode: string) => {
    if (isScanning) return;
    try {
      setIsScanning(true);
      setIsScannerVisible(false);
      if (!barcode || barcode.trim().length === 0) return;
      setSearchQuery(barcode.trim());
    } finally {
      setIsScanning(false);
    }
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setCurrentPage(0);
    setIsEndReachedCalled(false);
    try {
      const filters: PurchaseReceiptFilters = activeFilters.reduce((acc, filter) => {
        if (filter.category === 'creation') acc[filter.category] = filter.value;
        else if (filter.category === 'workflow_state' && filter.value) acc[filter.category] = filter.value;
        return acc;
      }, {} as PurchaseReceiptFilters);

      if (query.trim()) {
        filters.search_query = query;
      }

      const response = await getPurchaseReceipt({ filters, limit: 10, offset: 0 });
      if (response.success && response.data) {
        setData(response.data);
        setFilteredData(response.data);
        setHasMoreData(response.data.length >= 10);
      } else {
        setData([]);
        setFilteredData([]);
        setHasMoreData(false);
      }
    } catch (error) {
      setData([]);
      setFilteredData([]);
      setHasMoreData(false);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = (query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      if (query.trim()) performSearch(query);
      else fetchData(0, false);
    }, 1000);
    setSearchTimeout(timeout);
  };

  const applyFiltersAndSearch = () => {
    debouncedSearch(searchQuery);
  };

  useEffect(() => {
    applyFiltersAndSearch();
    setIsEndReachedCalled(false);
  }, [searchQuery, activeFilters]);

  useEffect(() => () => { if (searchTimeout) clearTimeout(searchTimeout); }, [searchTimeout]);

  const removeFilter = (filterToRemove: ActiveFilter) => {
    setActiveFilters(prev => prev.filter(f => f.key !== filterToRemove.key));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setCurrentPage(0);
      setIsEndReachedCalled(false);
      if (searchQuery.trim()) await performSearch(searchQuery);
      else await fetchData(0, false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchData = async (page: number = 0, isLoadMore: boolean = false) => {
    if (isLoadMore) setLoadingMore(true); else { setLoading(true); setCurrentPage(0); setIsEndReachedCalled(false); }
    try {
      const filters = activeFilters.reduce((acc, filter) => {
        if (filter.category === 'creation') (acc as any)[filter.category] = filter.value;
        else if (filter.category === 'workflow_state' && filter.value) (acc as any)[filter.category] = filter.value;
        return acc;
      }, {} as PurchaseReceiptFilters);

      const offset = page * 10;
      const response = await getPurchaseReceipt({ filters, limit: 10, offset });
      if (response.success && response.data) {
        if (isLoadMore) {
          setData(prev => [...prev, ...response.data!]);
          setFilteredData(prev => [...prev, ...response.data!]);
        } else {
          setData(response.data);
          setFilteredData(response.data);
        }
        setHasMoreData(response.data.length >= 10);
        setCurrentPage(page);
        setLastUpdateTime(Date.now());
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      setHasMoreData(false);
      throw error;
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsEndReachedCalled(false);
    }
  };

  useEffect(() => { fetchData(0, false); }, [activeFilters]);

  useFocusEffect(
    React.useCallback(() => {
      if (searchQuery.trim()) performSearch(searchQuery); else fetchData(0, false);
    }, [activeFilters, searchQuery])
  );

  const loadMoreData = () => {
    if (isEndReachedCalled) return;
    if (!loadingMore && hasMoreData) {
      setIsEndReachedCalled(true);
      if (searchQuery.trim()) return; // disable during multi-field search
      fetchData(currentPage + 1, true);
    }
  };

  const handleItemPress = (item: PurchaseReceipt) => {
    try {
      navigation.navigate('PurchaseReceiptDetailScreen', { name: item.name });
    } catch (error) {
      console.error('💥 [PurchaseReceiptList] Error navigating to detail:', error);
      Alert.alert('Lỗi', 'Không thể mở chi tiết phiếu');
    }
  };

  const renderItem = ({ item }: { item: PurchaseReceipt }) => {
    const statusInfo = getStatusInfo(item.workflow_state);
    return (
      <TouchableOpacity style={styles.deliveryNoteItem} onPress={() => handleItemPress(item)} activeOpacity={0.7}>
        <View style={styles.itemHeader}>
          <View style={styles.idDateRow}>
            <Text style={styles.itemIdWithDate}>{item.name}</Text>
            {item.posting_date && (
              <Text style={styles.itemDate}> - {formatDate(item.posting_date)}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>
        </View>
        <View style={styles.itemContent}>
          <View style={styles.leftColumn}>
            <View style={styles.compactRow}>
              <Text style={styles.compactLabel}>Nhà cung cấp:</Text>
              <Text style={styles.compactValue} numberOfLines={2} ellipsizeMode="tail">
                {item.supplier_name || item.supplier || '—'}
              </Text>
            </View>
            <View style={styles.compactRow}>
              <Text style={styles.compactLabel}>Tổng SL:</Text>
              <Text style={styles.compactValue} numberOfLines={1} ellipsizeMode="tail">
                {String(item.total_qty ?? '—')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: wp(2) }}>
            <Feather name="arrow-left" size={wp(5)} color={colors.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phiếu Nhập Hàng</Text>
          <View style={{ width: wp(7) }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.enhancedSearchBar}>
            <View style={styles.searchIconContainer}>
              <Feather name="search" size={wp(4.5)} color={colors.gray500} />
            </View>
            <TextInput
              style={styles.enhancedSearchInput}
              placeholder="Tìm theo mã phiếu, nhà cung cấp..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray500}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Feather name="x" size={wp(4)} color={colors.gray500} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.enhancedFilterButton, activeFilters.length > 0 && styles.filterButtonActive]}
              onPress={() => setIsFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Feather name="filter" size={wp(4.5)} color={colors.white} />
              {activeFilters.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => { setIsScanning(false); setIsScannerVisible(true); }}
              activeOpacity={0.7}
            >
              <Feather name="maximize" size={wp(4.5)} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersContainer}>
            {activeFilters.map((filter) => (
              <View key={filter.key} style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>{filter.label}</Text>
                <TouchableOpacity onPress={() => removeFilter(filter)}>
                  <Feather name="x" size={wp(3.5)} color={colors.warning} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Results header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Danh Sách Phiếu Nhập Hàng</Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderItem}
        style={styles.resultsList}
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
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
              </View>
            );
          }
          if (!hasMoreData && filteredData.length > 0) {
            return (
              <View style={styles.noMoreDataContainer}>
                <Text style={styles.noMoreDataText}>Đã tải hết dữ liệu</Text>
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
      <BarcodeScanner visible={isScannerVisible} onClose={() => setIsScannerVisible(false)} onScan={handleBarcodeScan} title="Quét Mã QR" />
    </SafeAreaView>
  );
}


