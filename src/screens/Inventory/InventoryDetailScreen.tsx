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
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { hp } from '../../utils/responsive';
import { InventoryDetailData } from '../../services/inventoryDetailService';
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [itemsState, setItemsState] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  
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
  
  const data = inventoryDetail || defaultData;
  useEffect(() => {
    setDescription(data.custom_interpretation || '');
  }, [data.custom_interpretation]);

  // Sync items into local state for editable quantity
  useEffect(() => {
    const srcItems = Array.isArray((data as any)?.items) ? (data as any).items : [];
    setItemsState(srcItems.map((it: any) => ({ ...it })));
  }, [(data as any)?.items]);

  // Sync current status from data and update when data changes
  useEffect(() => {
    setCurrentStatus(data.workflow_state || '');
  }, [data.workflow_state]);

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
  const isEditable = ['Nháp', 'Draft', 'Yêu cầu', 'Đang xử lý'].includes(statusResolved.text);

  // Allowed transitions
  const transitionMap: Record<string, string[]> = {
    'Nháp': ['Yêu cầu'],
    'Yêu cầu': ['Đang xử lý', 'Hủy'],
    'Đang xử lý': ['Đã xử lý', 'Hủy'],
  };
  const allowedNextStatuses = transitionMap[statusResolved.text] || [];

  const handleSave = () => {
    // TODO: connect to API to save description, quantities, and status
    console.log('[InventoryDetail] Save clicked', {
      name: data.name,
      status: currentStatus,
      description,
      items: itemsState.map(it => ({ item_code: it.item_code, qty: it.qty })),
    });
    // You can navigate back after successful save
    // (navigation as any)?.goBack?.();
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
                  onPress={() => { setCurrentStatus(opt); setIsStatusPickerOpen(false); }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                  }}
                  activeOpacity={0.7}
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
          {[{ id: 'export', label: (data.from_warehouse || 'Kho xuất') }, { id: 'import', label: (data.custom_original_target_warehouse || 'Kho nhập') }].map((step, index) => {
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
        contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Company Details (Insert style) */}
        <View style={styles.companyDetails}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyLine}>{data.name}</Text>
            <Text style={styles.companyLine}>{formatDate(data.creation)} - {formatTime(data.creation)}</Text>

            {data.owner ? (
              <Text style={styles.companyLine}>Người tạo: {data.owner}</Text>
            ) : null}
            {data.outgoing_stock_entry ? (
            <Text style={styles.companyLine}>Mã (GIT): {data.outgoing_stock_entry}</Text>
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

          {/* Stock Summary (Insert style) */}
          <View style={styles.shopSection}>
            <View style={styles.productItem}>
              <Text style={styles.sectionTitle}>Tổng Kết</Text>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.productCode}>Tổng Giá Trị Nhập: {data.total_incoming_value?.toLocaleString('vi-VN') || '0'} VNĐ</Text>
                <Text style={styles.productCode}>Tổng Giá Trị Xuất: {data.total_outgoing_value?.toLocaleString('vi-VN') || '0'} VNĐ</Text>
                <Text style={styles.productCode}>Chênh Lệch: {data.value_difference?.toLocaleString('vi-VN') || '0'} VNĐ</Text>
              </View>
            </View>
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

      {/* Footer (mirrors insert: single primary action) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutBtnText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
