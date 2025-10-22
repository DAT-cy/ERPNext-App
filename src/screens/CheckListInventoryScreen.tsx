import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CheckListInventoryScreenStyles as styles } from '../styles/CheckListInventoryScreen.styles';
import { BarcodeScanner } from '../components/Scanner/BarcodeScanner';
import { colors } from '../styles/globalStyles';
import { wp } from '../utils/responsive';
import { fetchCheckListInventory } from '../services/checkListInventoryScreen';
import { CheckListInventory } from '../types/checkListInventory.types';

// Remove duplicate interface since we're using CheckListInventory from types


const CheckListInventoryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [warehouses, setWarehouses] = useState<CheckListInventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const totalStock = warehouses.reduce((sum, warehouse) => sum + warehouse.qty, 0);
  const warehouseCount = warehouses.length;
  const lowStockCount = warehouses.filter(w => w.qty < 100).length;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setWarehouses([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchCheckListInventory(query.trim());
      console.log('✅ [CheckListInventoryScreen] Search result:', data);
      setWarehouses(data);
      setHasSearched(true);
    } catch (error) {
      console.error('❌ [CheckListInventoryScreen] Search error:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại.');
      setWarehouses([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = () => {
    setShowScanner(true);
  };

  const handleQRCodeScanned = (data: string) => {
    setShowScanner(false);
    console.log('📷 [CheckListInventoryScreen] QR Code scanned:', data);
    handleSearch(data);
  };

  const handleScannerClose = () => {
    setShowScanner(false);
  };

  const handleWarehousePress = (warehouse: CheckListInventory) => {
    // TODO: Navigate to warehouse details
    console.log('Showing details for:', warehouse.warehouse);
  };

  const handleImportStock = () => {
    // TODO: Navigate to import stock screen
    console.log('Navigate to import stock');
  };

  const handleReport = () => {
    // TODO: Navigate to report screen
    console.log('Navigate to report');
  };

  const getStockBadgeStyle = (qty: number) => {

      return styles.stockBadgeGood;
    
  };

  const getWarehouseIconStyle = (qty: number) => {
    if (qty === 0) {
      return styles.warehouseIconOut;
    } else if (qty < 100) {
      return styles.warehouseIconLow;
    } else {
      return styles.warehouseIconGood;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Kho</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm hoặc quét mã QR..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.scanButton} onPress={handleQRScan}>
            <Feather name="maximize" size={wp(4.5)} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        )}

        {/* Empty State for No Search */}
        {!isLoading && !hasSearched && warehouses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
            <Text style={styles.emptyDescription}>
              Vui lòng nhập mã sản phẩm hoặc quét mã vạch để xem thông tin tồn kho
            </Text>
          </View>
        )}

        {/* Empty State for Search */}
        {!isLoading && hasSearched && warehouses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.emptyDescription}>
              Không có sản phẩm nào với mã: "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Product Info Card */}
        {!isLoading && warehouses.length > 0 && (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <View style={styles.productIcon}>
                <Text style={styles.productIconText}>📦</Text>
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{warehouses[0]?.item_name || 'N/A'}</Text>
                <Text style={styles.productDescription}>Mã sản phẩm: {warehouses[0]?.item_code || 'N/A'}</Text>
                <View style={styles.productTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>UOM: {warehouses[0]?.uom || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Inventory Summary */}
        {!isLoading && warehouses.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tổng quan tồn kho</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalStock.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Tổng tồn</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{warehouseCount}</Text>
                <Text style={styles.summaryLabel}>Kho hàng</Text>
              </View>
            </View>
          </View>
        )}

        {/* Warehouse Inventory Table */}
        {!isLoading && warehouses.length > 0 && (
          <View style={styles.warehouseCard}>
            <View style={styles.warehouseHeader}>
              <Text style={styles.warehouseTitle}>Chi tiết theo kho</Text>
            </View>
            
            {warehouses.map((warehouse, index) => (
            <TouchableOpacity
              key={`${warehouse.item_code}-${warehouse.warehouse}-${index}`}
              style={styles.warehouseRow}
              onPress={() => handleWarehousePress(warehouse)}
            >
              <View style={styles.warehouseInfo}>
                
                <View style={styles.warehouseDetails}>
                  <Text style={styles.warehouseName}>{warehouse.warehouse}</Text>
                </View>
              </View>
                <View style={styles.warehouseStock}>
                  <View style={[styles.stockBadge, getStockBadgeStyle(warehouse.qty)]}>
                    <Text style={styles.stockBadgeText}>{warehouse.qty} {warehouse.uom}</Text>
                  </View>
                </View>
            </TouchableOpacity>
          ))}
          </View>
        )}
        </ScrollView>

        {/* QR Scanner Modal */}
        {showScanner && (
          <BarcodeScanner
            visible={showScanner}
            onScan={handleQRCodeScanned}
            onClose={handleScannerClose}
            title="Quét mã sản phẩm"
          />
        )}
      </SafeAreaView>
    );
  };


export default CheckListInventoryScreen;
