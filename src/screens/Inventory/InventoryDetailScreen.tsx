import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { hp } from '../../utils/responsive';
import { InventoryDetailData, updateStockEntry, getInventoryDetail } from '../../services/inventoryDetailService';
import { Input } from '../../components/Input';
import { inventoryDetailStyles as styles } from '../../styles/InventoryDetailScreen.styles';
import { colors } from '../../styles/globalStyles';
import { RootStackParamList } from '../../navigation/types';

 

type InventoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'InventoryDetailScreen'>;

export default function InventoryDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<InventoryDetailScreenRouteProp>();
  const { inventoryDetail } = route.params || {};
  
  const [commentText, setCommentText] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [itemsState, setItemsState] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [data, setData] = useState<InventoryDetailData | null>(null);
  
  // Track original values to detect changes
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalStatus, setOriginalStatus] = useState('');
  const [originalItems, setOriginalItems] = useState<any[]>([]);
  
  // Fallback data if no inventory detail provided
  const defaultData: InventoryDetailData = {
    name: 'N/A',
    stock_entry_type: 'N/A',
    workflow_state: 'N/A',
    from_warehouse: 'N/A',
    custom_original_target_warehouse: 'N/A',
    expense_account: 'N/A',
    docstatus: 0,
    creation: new Date().toISOString(),
    purpose: 'N/A',
    custom_interpretation: 'N/A',
    owner: 'N/A',
  };
  
  // Initialize data from route params or use current state
  const currentData = data || inventoryDetail || defaultData;
  
  // Initialize data from route params on mount
  useEffect(() => {
    if (inventoryDetail && !data) {
      setData(inventoryDetail);
    }
  }, [inventoryDetail, data]);

  useEffect(() => {
    const desc = currentData.custom_interpretation || '';
    setDescription(desc);
    setOriginalDescription(desc);
  }, [currentData.custom_interpretation]);

  // Sync items into local state for editable quantity
  useEffect(() => {
    const srcItems = Array.isArray((currentData as any)?.items) ? (currentData as any).items : [];
    const itemsCopy = srcItems.map((it: any) => ({ ...it }));
    setItemsState(itemsCopy);
    setOriginalItems(itemsCopy);
  }, [(currentData as any)?.items]);

  // Sync current status from data and update when data changes
  useEffect(() => {
    const status = currentData.workflow_state || '';
    setCurrentStatus(status);
    setOriginalStatus(status);
  }, [currentData.workflow_state]);

  // Status mapping (aligned with InsertInventoryEntry)
  const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
    'Nháp': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
    'Draft': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
    'Đang xử lý': { text: 'Đang xử lý', color: '#F59E0B', bgColor: '#FFFBEB' },
    'Đã xử lý': { text: 'Đã xử lý', color: '#10B981', bgColor: '#F0FDF4' },
    'Hủy': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' },
    'Cancelled': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' },
    'Yêu cầu': { text: 'Yêu cầu', color: colors.warning, bgColor: '#FFFBEB' },
  };

  const resolveStatus = (status?: string) => {
    if (!status) return { text: '—', color: colors.gray700, bgColor: '#F3F4F6' };
    const direct = statusMap[status];
    if (direct) return direct;
    // Fallbacks by lowercase includes
    const s = status.toLowerCase();
    if (s.includes('draft') || s.includes('nháp')) return statusMap['Nháp'];
    if (s.includes('cancel')) return statusMap['Hủy'];
    if (s.includes('process') || s.includes('xử lý')) return statusMap['Đang xử lý'];
    if (s.includes('done') || s.includes('xử lý xong') || s.includes('đã xử lý')) return statusMap['Đã xử lý'];
    return { text: status, color: colors.gray700, bgColor: '#F3F4F6' };
  };
  const statusResolved = resolveStatus(currentStatus);
  const isEditable = ['Nháp', 'Draft', 'Yêu cầu', 'Đang xử lý','Đóng'].includes(statusResolved.text);

  // Allowed transitions
  const transitionMap: Record<string, string[]> = {
    'Nháp': ['Yêu cầu'],
    'Yêu cầu': ['Đang xử lý', 'Đóng'],
    'Đang xử lý': ['Đã xử lý', 'Đóng'],
    'Đã xử lý' : ['Hủy'],
  };
  const allowedNextStatuses = transitionMap[statusResolved.text] || [];

  // Function to check if there are any changes
  const hasChanges = () => {
    // Check description changes
    if (description !== originalDescription) {
      return true;
    }
    
    // Check status changes
    if (currentStatus !== originalStatus) {
      return true;
    }
    
    // Check items changes
    if (itemsState.length !== originalItems.length) {
      return true;
    }
    
    // Check individual item changes (quantity, basic_rate)
    for (let i = 0; i < itemsState.length; i++) {
      const currentItem = itemsState[i];
      const originalItem = originalItems[i];
      
      if (!originalItem) return true;
      
      // Compare quantities (handle both string and number)
      const currentQty = parseFloat(String(currentItem.qty)) || 0;
      const originalQty = parseFloat(String(originalItem.qty)) || 0;
      
      if (currentQty !== originalQty) {
        return true;
      }
      
      // Compare basic rates
      const currentRate = parseFloat(String(currentItem.basic_rate)) || 0;
      const originalRate = parseFloat(String(originalItem.basic_rate)) || 0;
      
      if (currentRate !== originalRate) {
        return true;
      }
    }
    
    return false;
  };

  const hasAnyChanges = hasChanges();

  // Function to refresh data
  const refreshData = async () => {
    if (!currentData.name || currentData.name === 'N/A') {
      console.log('⚠️ [InventoryDetail] No valid data name to refresh');
      return;
    }

    try {
      console.log('🔄 [InventoryDetail] Refreshing data for:', currentData.name);
      const result = await getInventoryDetail(currentData.name);
      
      if (result.success && result.data) {
        console.log('✅ [InventoryDetail] Data refreshed successfully');
        setData(result.data);
      } else {
        console.error('❌ [InventoryDetail] Failed to refresh data:', result.error);
      }
    } catch (error) {
      console.error('💥 [InventoryDetail] Refresh error:', error);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Prepare items data for update
      const itemsToUpdate = itemsState.map(item => ({
        item_code: item.item_code,
        item_name: item.item_name,
        is_finished_item: item.is_finished_item ? 1 : 0,
        qty: parseFloat(String(item.qty)) || 0,
        uom: item.uom,
        basic_rate: parseFloat(String(item.basic_rate)) || 0
      }));

      console.log('🔄 [InventoryDetail] Saving changes...');
      
      // Call update API with only changed fields
      const result = await updateStockEntry(currentData.name, currentData, {
        custom_interpretation: description,
        workflow_state: currentStatus,
        items: itemsToUpdate
      });

      if (result.success) {
        console.log('✅ [InventoryDetail] Save successful');
        // Update original values to reset change detection
        setOriginalDescription(description);
        setOriginalStatus(currentStatus);
        setOriginalItems([...itemsState]);
        
        // Update local data with server response
        if (result.data) {
          console.log('📝 [InventoryDetail] Data updated from server');
        }
        // TODO: Show success message to user
        // You can add a toast notification here
      } else {
        console.error('❌ [InventoryDetail] Save failed:', result.error);
        // TODO: Show error message to user
        // You can add error toast notification here
      }
    } catch (error) {
      console.error('💥 [InventoryDetail] Save error:', error);
      // TODO: Show error message to user
      // You can add error toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle comment input focus - do not auto scroll
  const handleCommentFocus = () => {};

  // Handle comment input content size change - auto expand
  const handleCommentContentSizeChange = () => {};

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (commentText.trim().length === 0) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to submit comment
      console.log('Submitting comment:', commentText);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear comment text after successful submission
      setCommentText('');
      
      // TODO: Show success message
      console.log('Comment submitted successfully');
    } catch (error) {
      console.error('Error submitting comment:', error);
      // TODO: Show error message
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date and time from creation field
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Actions can be added later if needed

  return (
    <KeyboardAvoidingView 
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header (Insert style) */}
      <View style={[styles.header, { paddingTop: hp(6) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết Nhập Xuất Kho</Text>
        </View>
        <View style={styles.headerRight}>
          {!!currentStatus && (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: statusResolved.bgColor,
                borderWidth: 1,
                borderColor: statusResolved.bgColor,
                opacity: 1,
              }}
            >
              <TouchableOpacity
                onPress={() => allowedNextStatuses.length > 0 && setIsStatusPickerOpen(prev => !prev)}
                activeOpacity={0.7}
                disabled={allowedNextStatuses.length === 0}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, lineHeight: 14, fontWeight: '700', color: statusResolved.color }}>
                    {statusResolved.text}
                  </Text>
                  {allowedNextStatuses.length > 0 && (
                    <Image
                      source={require('../../assets/dropdown.png')}
                      style={{ width: 17, height: 17, tintColor: statusResolved.color, marginLeft: 4 }}
                      resizeMode="contain"
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Status picker options */}
      {isStatusPickerOpen && allowedNextStatuses.length > 0 && (
        <View style={styles.shopSection}>
          <View style={styles.productItem}>
            {allowedNextStatuses.map((opt) => {
              const r = resolveStatus(opt);
              const isSelected = opt === statusResolved.text;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    // Just change local state, don't call API immediately
                    setIsStatusPickerOpen(false);
                    setCurrentStatus(opt);
                    console.log('📝 [InventoryDetail] Status changed locally to:', opt);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    opacity: 1,
                  }}
                  activeOpacity={0.7}
                  disabled={false}
                >
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: isSelected ? '700' as any : '500' as any }}>
                    {r.text}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: r.color }}>
                    {r.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Progress Bar (mirrors insert) */}
      <View style={styles.progressBar}>
        <View style={styles.progressContainer}>
          {[{ id: 'export', label: (currentData.from_warehouse || 'Kho xuất') }, { id: 'import', label: (currentData.custom_original_target_warehouse || 'Kho nhập') }].map((step, index) => {
            const isSelected = true; // in detail view both are effectively selected/completed
            const isCompleted = true;
            return (
              <View key={step.id} style={styles.progressStep}>
                <TouchableOpacity
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isSelected && styles.stepCircleActive,
                    !isSelected && styles.stepCirclePending,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepText}>{isCompleted ? '✓' : (index + 1).toString()}</Text>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isSelected && styles.stepLabelActive,
                    !isSelected && styles.stepLabelPending,
                  ]}
                  numberOfLines={2}
                >
                  {step.label}
                </Text>
                {index < 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      isCompleted && styles.progressLineCompleted,
                      isSelected && styles.progressLineActive,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.container, 
          { paddingBottom: hasAnyChanges ? 120 : 20 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
      >
        {/* Company Details (Insert style) */}
        <View style={styles.companyDetails}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyLine}>{currentData.name} - {formatDate(currentData.creation)} - {formatTime(currentData.creation)}</Text>
            {currentData.owner ? (
              <Text style={styles.companyLine}>Người tạo: {currentData.owner}</Text>
            ) : null}
            {currentData.outgoing_stock_entry ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={styles.companyLine}>Mã (GIT): </Text>
                <TouchableOpacity 
                  onPress={async () => {
                    try {
                      console.log('=== NAVIGATION DEBUG ===');
                      console.log('Mã được ấn:', currentData.outgoing_stock_entry);
                      console.log('Current screen name:', route.name);
                      
                      // Fetch data for the outgoing stock entry
                      console.log('Fetching data for:', currentData.outgoing_stock_entry);
                      const result = await getInventoryDetail(currentData.outgoing_stock_entry);
                      console.log('API Result:', result);
                      
                      if (result.success && result.data) {
                        console.log('Data fetched successfully:', result.data);
                        console.log('Navigating to InventoryDetailScreen with real data...');
                        
                        // Navigate to detail screen with the fetched data
                        navigation.push('InventoryDetailScreen', {
                          inventoryDetail: result.data
                        });
                        
                        console.log('Navigation with real data called successfully');
                      } else {
                        // Show error or fallback
                        console.warn('Không thể tải dữ liệu cho mã:', currentData.outgoing_stock_entry);
                        console.warn('Result:', result);
                        console.warn('Error details:', result.error);
                        
                        // Fallback: Navigate với data cơ bản
                        console.log('Using fallback navigation...');
                        navigation.push('InventoryDetailScreen', {
                          inventoryDetail: {
                            name: currentData.outgoing_stock_entry,
                            stock_entry_type: 'Unknown',
                            creation: new Date().toISOString(),
                            workflow_state: 'Unknown',
                            from_warehouse: 'Unknown',
                            custom_original_target_warehouse: 'Unknown',
                            expense_account: 'Unknown',
                            docstatus: 0,
                            purpose: 'Unknown',
                            custom_interpretation: 'Không thể tải dữ liệu',
                            owner: 'Unknown',
                            items: []
                          }
                        });
                      }
                    } catch (error) {
                      console.error('Lỗi khi tải dữ liệu:', error);
                      console.error('Error stack:', (error as Error).stack);
                      
                      // Fallback navigation on error
                      console.log('Using error fallback navigation...');
                      navigation.push('InventoryDetailScreen', {
                        inventoryDetail: {
                          name: currentData.outgoing_stock_entry,
                          stock_entry_type: 'Error',
                          creation: new Date().toISOString(),
                          workflow_state: 'Error',
                          from_warehouse: 'Error',
                          custom_original_target_warehouse: 'Error',
                          expense_account: 'Error',
                          docstatus: 0,
                          purpose: 'Error',
                          custom_interpretation: 'Lỗi khi tải dữ liệu',
                          owner: 'Error',
                          items: []
                        }
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.companyLine, { 
                    color: colors.primary, 
                    textDecorationLine: 'underline',
                    fontWeight: '600'
                  }]}>
                    {currentData.outgoing_stock_entry}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

          {/* Insert-style description card */}
          <View style={styles.shopSection}>
            <View style={styles.productItem}>
              <Input
                placeholder="Nhập / chỉnh sửa diễn giải..."
                autoGrow
                minHeight={100}
                maxHeight={260}
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#9CA3AF"
                containerStyle={{ marginBottom: 0 }}
                editable={isEditable}
                selectTextOnFocus={isEditable}
                style={[
                  styles.input,
                  styles.textarea,
                  !isEditable ? { backgroundColor: '#F3F4F6', color: '#6B7280' } : null,
                ] as any}
                onFocus={handleCommentFocus}
                onContentSizeChange={handleCommentContentSizeChange}
              />
            </View>
          </View>

        {/* Items (Insert style cards) */}
        <View style={styles.mainContent}>
          {Array.isArray(itemsState) && itemsState.length > 0 ? (
            itemsState.map((item: any, index: number) => (
              <View key={`${item.item_code}-${index}`} style={styles.shopSection}>
                <View style={styles.productItem}>
                  <View style={styles.productMain}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle}>
                        {item.item_code && item.item_name ? `${item.item_code} - ${item.item_name}` : (item.item_code || item.item_name || '')}
                      </Text>
                      <Text style={styles.productCode}>{item.uom}</Text>
                    </View>
                  </View>
                  <View style={styles.productPriceQuantity}>
                    <Text style={styles.currentPrice}>Số lượng</Text>
                    <View style={styles.quantityInputControl}>
                      <TouchableOpacity
                        style={styles.quantityBtn}
                        disabled={!isEditable}
                        onPress={() => {
                          const current = parseFloat(String(item.qty)) || 0;
                          const next = Math.max(0, current - 1);
                          setItemsState(prev => prev.map((it, i) => i === index ? { ...it, qty: next } : it));
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quantityBtnText}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        keyboardType="decimal-pad"
                        value={String(item.qty ?? '')}
                        editable={isEditable}
                        selectTextOnFocus={isEditable}
                        onChangeText={(text) => {
                          if (text === '') { setItemsState(prev => prev.map((it, i) => i === index ? { ...it, qty: '' } : it)); return; }
                          const replaced = text.replace(',', '.');
                          const stripped = replaced.replace(/[^0-9.]/g, '');
                          const parts = stripped.split('.');
                          const singleDot = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : stripped;
                          // allow "." or "12." during typing without coercion
                          if (singleDot === '.' || /^(\d+)\.$/.test(singleDot)) {
                            setItemsState(prev => prev.map((it, i) => i === index ? { ...it, qty: singleDot } : it));
                            return;
                          }
                          if (/^\d*(?:\.\d+)?$/.test(singleDot)) {
                            setItemsState(prev => prev.map((it, i) => i === index ? { ...it, qty: singleDot } : it));
                          }
                          // else: ignore invalid input
                        }}
                        style={[
                          styles.quantityInput,
                          { textAlign: 'center' },
                          !isEditable ? { backgroundColor: '#F3F4F6', color: '#6B7280' } : null,
                        ]}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        style={styles.quantityBtn}
                        disabled={!isEditable}
                        onPress={() => {
                          const current = parseFloat(String(item.qty)) || 0;
                          const next = current + 1;
                          setItemsState(prev => prev.map((it, i) => i === index ? { ...it, qty: next } : it));
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quantityBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.shopSection}>
              <View style={styles.productItem}>
                <Text style={styles.productCode}>Không có mặt hàng nào</Text>
              </View>
            </View>
          )}
        </View>

          {/* Action Buttons */}
          {/* <View style={styles.sectionCard}>
            <View style={styles.mobileActionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.mobileActionButton, styles.mobileActionButtonPrimary]} 
                onPress={handleDownload}
                disabled={isDownloading}
              >
                <Feather name="download" size={wp(5)} color={colors.white} />
                <Text style={styles.mobileActionButtonText}>
                  {isDownloading ? 'Đang tải...' : 'Tải Xuống'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mobileActionButton, styles.mobileActionButtonSuccess]} 
                onPress={handleUpdatePrice}
                disabled={isUpdating}
              >
                <Feather name="refresh-cw" size={wp(5)} color={colors.white} />
                <Text style={styles.mobileActionButtonText}>
                  {isUpdating ? 'Đang cập nhật...' : 'Cập Nhật'}
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}
      </ScrollView>

      {/* Footer (mirrors insert: single primary action) - Only show when there are changes */}
      {hasAnyChanges && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              isSubmitting && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <Text style={styles.checkoutBtnText}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
