import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Input } from '../../components/Input';
import { inventoryDetailStyles as styles } from '../../styles/InventoryDetailScreen.styles';
import { colors } from '../../styles/globalStyles';
import { hp } from '../../utils/responsive';
import { DeliveryNoteDetail } from '../../types/deliveryNote.types';
import { getDeliveryNoteDetail, updateDeliveryNote, deleteDeliveryNote } from '../../services/deliveryNoteService';
import { RootStackParamList } from '../../navigation/types';

type DeliveryNoteDetailRouteProp = RouteProp<RootStackParamList, 'DeliveryNoteDetailScreen'>;

export default function DeliveryNoteDtailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<DeliveryNoteDetailRouteProp>();
  const { deliveryNoteDetail, name } = (route.params as any) || {};

  const [data, setData] = useState<DeliveryNoteDetail | null>(deliveryNoteDetail || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemsState, setItemsState] = useState<any[]>([]);
  const [originalItems, setOriginalItems] = useState<any[]>([]);
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(false);

  const defaultData: DeliveryNoteDetail = {
    name: name || 'N/A',
    customer: '—',
    customer_name: '—',
    posting_date: new Date().toISOString().slice(0, 10),
    creation: new Date().toISOString(),
    workflow_state: 'Nháp',
    custom_reference_name: '',
    custom_sales_invoice: '',
    total_qty: 0,
    items: [],
  };

  const currentData = useMemo(() => data || defaultData, [data]);

  useEffect(() => {
    setCurrentStatus(currentData.workflow_state || '');
    setOriginalStatus(currentData.workflow_state || '');
  }, [currentData.workflow_state]);

  useEffect(() => {
    setDescription(currentData.custom_reference_name || '');
  }, [currentData.custom_reference_name]);

  const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
    'Nháp': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
    'Draft': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
    'Đang xử lý': { text: 'Đang xử lý', color: '#F59E0B', bgColor: '#FFFBEB' },
    'Đã xử lý': { text: 'Đã xử lý', color: '#10B981', bgColor: '#F0FDF4' },
    'Hủy': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' },
    'Cancelled': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' },
  };

  const resolveStatus = (status?: string) => {
    if (!status) return { text: '—', color: colors.gray700, bgColor: '#F3F4F6' };
    const direct = statusMap[status];
    if (direct) return direct;
    const s = status.toLowerCase();
    if (s.includes('draft') || s.includes('nháp')) return statusMap['Nháp'];
    if (s.includes('cancel')) return statusMap['Hủy'];
    if (s.includes('process') || s.includes('xử lý')) return statusMap['Đang xử lý'];
    if (s.includes('done') || s.includes('đã xử lý')) return statusMap['Đã xử lý'];
    return { text: status, color: colors.gray700, bgColor: '#F3F4F6' };
  };
  const statusResolved = resolveStatus(currentStatus);

  // Auto-load detail when navigated with only `name`
  useEffect(() => {
    const load = async () => {
      if (!name || data) return;
      try {
        setIsLoading(true);
        const res = await getDeliveryNoteDetail(name);
        if (res.success && res.data) {
          setData(res.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [name, data]);

  const handleRefresh = async () => {
    if (!currentData.name || currentData.name === 'N/A') return;
    setIsRefreshing(true);
    try {
      const res = await getDeliveryNoteDetail(currentData.name);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải lại dữ liệu');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const items = Array.isArray(currentData.items) ? currentData.items : [];
  // Sync items to local editable state
  useEffect(() => {
    const src = Array.isArray(items) ? items : [];
    const copy = src.map((it: any) => ({ ...it }));
    setItemsState(copy);
    setOriginalItems(copy);
  }, [currentData.items]);

  // Change detection: status or any qty change
  const hasChanges = () => {
    if (currentStatus !== originalStatus) return true;
    if (itemsState.length !== originalItems.length) return true;
    for (let i = 0; i < itemsState.length; i++) {
      const a = itemsState[i];
      const b = originalItems[i];
      const qa = parseFloat(String(a?.qty ?? 0)) || 0;
      const qb = parseFloat(String(b?.qty ?? 0)) || 0;
      if (qa !== qb) return true;
    }
    return false;
  };
  const hasAnyChanges = hasChanges();

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: hp(6) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết Phiếu Giao Hàng</Text>
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
              <TouchableOpacity onPress={() => setIsStatusPickerOpen((prev) => !prev)} activeOpacity={0.7}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, lineHeight: 14, fontWeight: '700', color: statusResolved.color }}>
                    {statusResolved.text}
                  </Text>
                  <Image
                    source={require('../../assets/dropdown.png')}
                    style={{ width: 17, height: 17, tintColor: statusResolved.color, marginLeft: 4 }}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Status picker (view only for now) */}
      {isStatusPickerOpen && (
        <View style={styles.shopSection}>
          <View style={styles.productItem}>
            {Object.keys(statusMap).map((opt) => {
              const r = resolveStatus(opt);
              const isSelected = r.text === statusResolved.text;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    setIsStatusPickerOpen(false);
                    setCurrentStatus(opt);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: (isSelected ? '700' : '500') as any }}>{r.text}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: r.color }}>{r.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}


      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.container, { paddingBottom: hasAnyChanges ? 120 : 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" title="Đang tải lại..." titleColor="#6B7280" />}
      >
        {/* Top details */}
        <View style={styles.companyDetails}>
          <View style={styles.companyInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.companyLine, { fontWeight: '700', color: '#111827' }]}>Số: {currentData.name}</Text>
              <View style={{ backgroundColor: '#F3F4F6', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>Ngày: {formatDate(currentData.creation)}</Text>
              </View>
            </View>
            {!!currentData.custom_reference_name && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={[styles.companyLine, { fontWeight: '600', color: '#374151', marginRight: 6 }]}>Đơn hàng:</Text>
                <Text style={[styles.companyLine, { marginBottom: 0 }]}>{currentData.custom_reference_name}</Text>
              </View>
            )}
            {!!currentData.custom_sales_invoice && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={[styles.companyLine, { fontWeight: '600', color: '#374151', marginRight: 6 }]}>Hóa đơn:</Text>
                <Text style={[styles.companyLine, { marginBottom: 0 }]}>{currentData.custom_sales_invoice}</Text>
              </View>
            )}
            {!!currentData.customer_name && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={[styles.companyLine, { fontWeight: '600', color: '#374151', marginRight: 6 }]}>Khách hàng:</Text>
                <Text style={[styles.companyLine, { marginBottom: 0 }]}>{currentData.customer_name}</Text>
              </View>
            )}
          </View>
        </View>
        {/* Items (editable quantities) */}
        <View style={styles.mainContent}>
          {itemsState.length > 0 ? (
            itemsState.map((item: any, index: number) => (
              <View key={`${item.item_code || 'item'}-${index}`} style={styles.shopSection}>
                <View style={styles.productItem}>
                  <View style={styles.productMain}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle}>
                        {(item.item_code && item.item_name)
                          ? `${item.item_code} - ${item.item_name}`
                          : (item.item_code || item.item_name || '')}
                      </Text>
                      <Text style={styles.productCode}>{item.uom || ''}</Text>
                    </View>
                  </View>
                  <View style={styles.productPriceQuantity}>
                    <Text style={styles.currentPrice}>Số lượng</Text>
                    <View style={styles.quantityInputControl}>
                      <TouchableOpacity
                        style={styles.quantityBtn}
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
                        editable={true}
                        keyboardType="decimal-pad"
                        value={String(item.qty ?? '')}
                        onChangeText={(text) => {
                          if (text === '') { setItemsState(prev => prev.map((it, i) => i === index ? { ...it, qty: '' } : it)); return; }
                          const replaced = text.replace(',', '.');
                          const stripped = replaced.replace(/[^0-9.]/g, '');
                          const parts = stripped.split('.');
                          const singleDot = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : stripped;
                          if (singleDot === '.' || /^(\d+)\.$/.test(singleDot)) {
                            setItemsState(prev => prev.map((it, i) => i === index ? { ...it, qty: singleDot } : it));
                            return;
                          }
                          if (/^\d*(?:\.\d+)?$/.test(singleDot)) {
                            setItemsState(prev => prev.map((it, i) => i === index ? { ...it, qty: singleDot } : it));
                          }
                        }}
                        style={[styles.quantityInput, { textAlign: 'center' }]}
                      />
                      <TouchableOpacity
                        style={styles.quantityBtn}
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
      </ScrollView>

      {/* Footer Save button when changes exist */}
      <View style={styles.footer}>
        <View style={styles.footerButtonsContainer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.saveButton, !hasAnyChanges && { opacity: 0.6 }]}
            activeOpacity={0.8}
            disabled={!hasAnyChanges}
            onPress={async () => {
              if (!currentData.name) return;
              try {
                const itemsToUpdate = itemsState.map((it: any) => ({
                  name: it.name,
                  item_code: it.item_code,
                  item_name: it.item_name,
                  qty: parseFloat(String(it.qty)) || 0,
                  uom: it.uom,
                }));
                const payload: any = { items: itemsToUpdate };
                if (currentStatus !== originalStatus) {
                  payload.workflow_state = currentStatus;
                }
                const res = await updateDeliveryNote(currentData.name, payload);
                if (res.success) {
                  Alert.alert('Thành công', 'Đã cập nhật Delivery Note');
                  // reset originals
                  setOriginalStatus(currentStatus);
                  const fresh = (res.data?.items as any[])?.map((x: any) => ({ ...x })) || itemsToUpdate;
                  setItemsState(fresh);
                  setOriginalItems(fresh);
                } else {
                  Alert.alert('Lỗi', res.error?.message || 'Cập nhật thất bại');
                }
              } catch (e: any) {
                Alert.alert('Lỗi', e?.message || 'Cập nhật thất bại');
              }
            }}
          >
            <Text style={styles.saveButtonText}>Lưu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.deleteButton]}
            activeOpacity={0.8}
            onPress={() => {
              if (!currentData.name) return;
              Alert.alert(
                'Xác nhận xóa',
                `Bạn có chắc chắn muốn xóa "${currentData.name}"?`,
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                      const res = await deleteDeliveryNote(currentData.name);
                      if (res.success) {
                        Alert.alert('Thành công', 'Đã xóa Delivery Note', [
                          { text: 'OK', onPress: () => navigation.goBack() }
                        ]);
                      } else {
                        Alert.alert('Lỗi', res.error?.message || 'Xóa thất bại');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}


