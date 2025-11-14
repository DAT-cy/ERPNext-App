import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { hp } from '../../utils/responsive';
import { Input } from '../../components/Input';
import { inventoryDetailStyles as styles } from '../../styles/InventoryDetailScreen.styles';
import { colors } from '../../styles/globalStyles';
import { RootStackParamList } from '../../navigation/types';
import { Shipment, ShipmentParcel, getShipmentDetail } from '../../services/shipmentService';

type ShipmentDetailScreenRouteProp = RouteProp<RootStackParamList, 'ShipmentScreenDetail'>;

const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
  'Nháp': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
  'Draft': { text: 'Nháp', color: '#3B82F6', bgColor: '#EFF6FF' },
  'Yêu cầu vận chuyển': { text: 'Yêu cầu vận chuyển', color: '#F59E0B', bgColor: '#FFFBEB' },
  'Lái xe vào lấy hàng': { text: 'Lái xe vào lấy hàng', color: '#06B6D4', bgColor: '#ECFEFF' },
  'Đang vận chuyển': { text: 'Đang vận chuyển', color: '#3B82F6', bgColor: '#EFF6FF' },
  'Hoàn thành': { text: 'Hoàn thành', color: '#8B5CF6', bgColor: '#F5F3FF' },
  'Hủy': { text: 'Hủy', color: '#EF4444', bgColor: '#FEF2F2' },
};

const transitionMap: Record<string, string[]> = {
  'Nháp': ['Yêu cầu vận chuyển'],
  'Yêu cầu vận chuyển': ['Lái xe vào lấy hàng'],
  'Lái xe vào lấy hàng': ['Đang vận chuyển'],
  'Đang vận chuyển': ['Hoàn thành'],
  'Hoàn thành': [],
};

const defaultShipment: Shipment = {
  name: 'N/A',
  workflow_state: 'N/A',
  custom_posting_date: 'N/A',
  custom_vehicle: 'N/A',
  custom_service_provider_type: 'N/A',
};

export default function ShipmentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ShipmentDetailScreenRouteProp>();
  const { shipmentDetail } = route.params || {};
  const routeName = route.params?.name || shipmentDetail?.name;

  const [data, setData] = useState<Shipment | null>(shipmentDetail || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalStatus, setOriginalStatus] = useState('');
  const [isGoodsDescriptionExpanded, setIsGoodsDescriptionExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentData = data || shipmentDetail || defaultShipment;

  useEffect(() => {
    if (!data && shipmentDetail) {
      setData(shipmentDetail);
    }
  }, [shipmentDetail, data]);

  useEffect(() => {
    if (!routeName) return;
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        console.log('🔄 [ShipmentDetail] Fetching detail for', routeName);
        const result = await getShipmentDetail(routeName);
        if (isMounted && result.success && result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error('💥 [ShipmentDetail] Fetch error:', error);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [routeName]);

  useEffect(() => {
    const desc = currentData.custom_delivery_remark || '';
    setDescription(desc);
    setOriginalDescription(desc);
  }, [currentData.custom_delivery_remark]);

  useEffect(() => {
    const status = currentData.workflow_state || '';
    setCurrentStatus(status);
    setOriginalStatus(status);
  }, [currentData.workflow_state]);

  const statusResolved = useMemo(() => {
    if (!currentStatus) return { text: '—', color: colors.gray700, bgColor: '#F3F4F6' };
    const direct = statusMap[currentStatus];
    if (direct) return direct;

    const lowered = currentStatus.toLowerCase();
    if (lowered.includes('draft') || lowered.includes('nháp')) return statusMap['Nháp'];
    if (lowered.includes('cancel') || lowered.includes('hủy')) return statusMap['Hủy'];
    if (lowered.includes('hoàn thành') || lowered.includes('complete')) return statusMap['Hoàn thành'];
    if (lowered.includes('vận chuyển') || lowered.includes('transport')) return statusMap['Đang vận chuyển'];
    return { text: currentStatus, color: colors.gray700, bgColor: '#F3F4F6' };
  }, [currentStatus]);

  const allowedNextStatuses = transitionMap[statusResolved.text] || [];
  const isEditable = ['Nháp', 'Draft', 'Yêu cầu vận chuyển', 'Lái xe vào lấy hàng'].includes(statusResolved.text);

  const hasChanges = useMemo(() => {
    return description !== originalDescription || currentStatus !== originalStatus;
  }, [description, originalDescription, currentStatus, originalStatus]);

  const footerPaddingBottom = hasChanges ? 220 : 180;

  const parseDateValue = (value?: string) => {
    if (!value) return null;
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  };

  const formatDateOnly = (value?: string) => {
    const date = parseDateValue(value);
    if (!date) return displayValue(value);
    return date.toLocaleDateString('vi-VN');
  };

  const formatDateTime = (value?: string) => {
    const date = parseDateValue(value);
    if (!date) return displayValue(value);
    const datePart = date.toLocaleDateString('vi-VN');
    const timePart = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  };

  const formatNumber = (value?: number | string | null) => {
    if (value === undefined || value === null) return '—';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return displayValue(value);
    return numeric.toLocaleString('vi-VN');
  };

  const formatCurrency = (value?: number | string | null) => {
    if (value === undefined || value === null) return '—';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return displayValue(value);
    return `${numeric.toLocaleString('vi-VN')} ₫`;
  };

  const boolToText = (value?: number | boolean | string | null) => {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (!normalized) return '—';
      if (['1', 'true', 'yes', 'có'].includes(normalized)) return 'Có';
      if (['0', 'false', 'no', 'không'].includes(normalized)) return 'Không';
    }
    return value ? 'Có' : 'Không';
  };

  const docstatusText = useMemo(() => {
    const value = currentData.docstatus;
    if (value === undefined || value === null) return '—';
    const normalized = String(value);
    switch (normalized) {
      case '0':
        return 'Nháp';
      case '1':
        return 'Đã xác nhận';
      case '2':
        return 'Đã hủy';
      default:
        return normalized;
    }
  }, [currentData.docstatus]);

  const displayValue = (value: any): string => {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'number') {
      if (Number.isNaN(value)) return '—';
      return Number(value).toLocaleString('vi-VN');
    }
    const stringValue = String(value).trim();
    return stringValue.length ? stringValue : '—';
  };

  const refreshData = async () => {
    if (!currentData.name || currentData.name === 'N/A') {
      console.log('⚠️ [ShipmentDetail] Missing name for refresh');
      return;
    }
    try {
      console.log('🔄 [ShipmentDetail] Refreshing data for', currentData.name);
      const result = await getShipmentDetail(currentData.name);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        console.error('❌ [ShipmentDetail] Refresh failed:', result.error);
      }
    } catch (error) {
      console.error('💥 [ShipmentDetail] Refresh error:', error);
    }
  };

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
      console.log('🔄 [ShipmentDetail] Saving changes...');
      Alert.alert('Thông báo', 'Chức năng cập nhật đang được phát triển');
      setOriginalDescription(description);
      setOriginalStatus(currentStatus);
    } catch (error) {
      console.error('💥 [ShipmentDetail] Save error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeStatus = (nextStatus: string) => {
    if (isSubmitting) return;

    Alert.alert(
      'Xác nhận thay đổi trạng thái',
      `Bạn có chắc chắn muốn chuyển trạng thái từ "${currentStatus}" sang "${nextStatus}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              console.log('🔄 [ShipmentDetail] Changing status to:', nextStatus);
              setCurrentStatus(nextStatus);
              setOriginalStatus(nextStatus);
              Alert.alert('Thông báo', 'Chức năng cập nhật trạng thái đang được phát triển');
            } catch (error) {
              console.error('💥 [ShipmentDetail] Status change error:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi thay đổi trạng thái. Vui lòng thử lại.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };
  
  const parcelContent = useMemo(() => {
    if (!Array.isArray(currentData.shipment_parcel) || currentData.shipment_parcel.length === 0) {
      return null;
    }

    return (
      <View style={detailStyles.parcelContainer}>
        {currentData.shipment_parcel.map((parcel: ShipmentParcel, index: number) => (
          <View
            key={parcel.name || `parcel-${index}`}
            style={[detailStyles.parcelCard, index > 0 && detailStyles.parcelCardSpacing]}
          >
            <View style={detailStyles.badge}>
              <Text style={detailStyles.badgeText}>Kiện {index + 1}</Text>
            </View>
            <View style={detailStyles.parcelBody}>
              <View style={detailStyles.row}>
                <Text style={detailStyles.label}>Mã kiện</Text>
                <Text style={detailStyles.value}>{displayValue(parcel.name)}</Text>
              </View>
              <View style={detailStyles.row}>
                <Text style={detailStyles.label}>Số lượng</Text>
                <Text style={detailStyles.value}>{formatNumber(parcel.count)}</Text>
              </View>
              <View style={detailStyles.row}>
                <Text style={detailStyles.label}>Trọng lượng</Text>
                <Text style={detailStyles.value}>{formatNumber(parcel.weight)}</Text>
              </View>
              <View style={detailStyles.row}>
                <Text style={[detailStyles.label, detailStyles.valueMultiline]}>Kích thước (D x R x C)</Text>
                <Text style={[detailStyles.value, detailStyles.valueMultiline]}>
                  {`${formatNumber(parcel.length)} x ${formatNumber(parcel.width)} x ${formatNumber(parcel.height)}`}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }, [currentData.shipment_parcel]);

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: hp(6) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết Giao Hàng</Text>
        </View>
        <View style={styles.headerRight}>
          {!!statusResolved.text && statusResolved.text !== '—' && (
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
              <Text style={{ fontSize: 12, lineHeight: 14, fontWeight: '700', color: statusResolved.color }}>
                {statusResolved.text}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.container, { paddingBottom: footerPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
      >
        <View style={styles.companyDetails}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyLine}>{displayValue(currentData.name)}</Text>
            {!!currentData.custom_posting_date && (
              <Text style={styles.companyLine}>Ngày ghi sổ: {formatDateOnly(currentData.custom_posting_date)}</Text>
            )}
            {!!currentData.owner && (
              <Text style={styles.companyLine}>Người tạo: {currentData.owner}</Text>
            )}
          </View>
        </View>

        <View style={styles.shopSection}>
          <View style={styles.productItem}>
            <Text style={detailStyles.sectionTitle}>Ghi chú giao hàng</Text>
            <Input
              placeholder="Nhập / chỉnh sửa ghi chú giao hàng..."
              autoGrow
              minHeight={100}
              maxHeight={260}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#9CA3AF"
              containerStyle={{ marginBottom: 0 }}
              editable={isEditable}
              selectTextOnFocus={isEditable}
              style={[styles.input, styles.textarea, !isEditable ? { backgroundColor: '#F3F4F6', color: '#6B7280' } : null] as any}
            />
          </View>
        </View>
        {!!currentData.description_of_content && (
          <View style={styles.shopSection}>
            <View style={styles.productItem}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsGoodsDescriptionExpanded((prev) => !prev)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text style={detailStyles.sectionTitle}>Mô tả hàng hóa</Text>
                </View>
              </TouchableOpacity>
              {isGoodsDescriptionExpanded && (
                <Text style={detailStyles.multiLineText}>{currentData.description_of_content}</Text>
              )}
            </View>
          </View>
        )}
        {/* Thông tin vận chuyển */}
        <View style={styles.shopSection}>
          <View style={styles.productItem}>
            <Text style={detailStyles.sectionTitle}>Thông tin vận chuyển</Text>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Vận chuyển bên ngoài</Text>
              <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{boolToText((currentData as any).custom_is_external_ship)}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Đối tác vận chuyển</Text>
              <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{displayValue(currentData.custom_party)}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Người dùng đối tác</Text>
              <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{displayValue(currentData.custom_party_user)}</Text></View>
            </View>
          <View style={detailStyles.row}>
            <Text style={detailStyles.label}>Tài xế (ID)</Text>
            <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{displayValue((currentData as any).custom_driver)}</Text></View>
          </View>
          <View style={detailStyles.row}>
            <Text style={detailStyles.label}>Tên tài xế</Text>
            <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{displayValue((currentData as any).custom_driver_name)}</Text></View>
          </View>
          <View style={detailStyles.row}>
            <Text style={detailStyles.label}>SĐT tài xế</Text>
            <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{displayValue((currentData as any).custom_driver_phone)}</Text></View>
          </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Loại dịch vụ</Text>
              <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{displayValue(currentData.custom_service_provider_type)}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Trạng thái hệ thống</Text>
              <View style={detailStyles.chipPrimary}><Text style={detailStyles.chipPrimaryText}>{displayValue(currentData.status)}</Text></View>
            </View>
          </View>
        </View>

        {/* Chi phí & Doanh thu */}
        <View style={styles.shopSection}>
          <View style={styles.productItem}>
            <Text style={detailStyles.sectionTitle}>Chi phí & Doanh thu</Text>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Giá bán vận chuyển</Text>
              <View style={detailStyles.amt}><Text style={detailStyles.amtText}>{formatCurrency(currentData.custom_selling_amount)}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Chi phí vận chuyển</Text>
              <View style={detailStyles.amt}><Text style={detailStyles.amtText}>{formatCurrency(currentData.custom_expense_amount)}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Giá vận chuyển</Text>
              <View style={detailStyles.amt}><Text style={detailStyles.amtText}>{formatCurrency(currentData.shipment_amount)}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Chi phí tài xế</Text>
              <View style={detailStyles.amt}><Text style={detailStyles.amtText}>{formatCurrency(currentData.custom_party_amount)}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Lợi nhuận</Text>
              <View style={detailStyles.amtSuccess}><Text style={detailStyles.amtSuccessText}>{formatCurrency(currentData.custom_profit_amount)}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>COD</Text>
              <View style={detailStyles.amt}><Text style={detailStyles.amtText}>{formatCurrency(currentData.custom_cod_amount)}</Text></View>
            </View>
          </View>
        </View>

        {/* Khoảng cách */}
        <View style={styles.shopSection}>
          <View style={styles.productItem}>
            <Text style={detailStyles.sectionTitle}>Khoảng cách</Text>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Distance (GPS)</Text>
              <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{`${formatNumber((currentData as any).custom_distance_gps)} km`}</Text></View>
            </View>
            <View style={detailStyles.row}>
              <Text style={detailStyles.label}>Distance (Actual)</Text>
              <View style={detailStyles.chip}><Text style={detailStyles.chipText}>{`${formatNumber((currentData as any).custom_distance_actual)} km`}</Text></View>
            </View>
          </View>
        </View>

        
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtonsContainer}>
          {hasChanges ? (
            <TouchableOpacity
              style={[styles.footerButton, styles.saveButton, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Text style={styles.saveButtonText}>{isSubmitting ? 'Đang lưu...' : 'Lưu'}</Text>
            </TouchableOpacity>
          ) : (
            allowedNextStatuses.map((status, index) => {
              const resolved = statusMap[status] || { text: status, color: '#3B82F6', bgColor: '#EFF6FF' };
              return (
                <TouchableOpacity
                  key={`${status}-${index}`}
                  style={[styles.footerButton, { backgroundColor: resolved.color }, isSubmitting && { opacity: 0.6 }]}
                  onPress={() => handleChangeStatus(status)}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <Text style={styles.changeStatusButtonText}>{isSubmitting ? 'Đang cập nhật...' : status}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const detailStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 12,
  },
  value: {
    flex: 1.2,
    fontSize: 13,
    color: '#111827',
    textAlign: 'right',
    fontWeight: '600',
  },
  valueBold: {
    fontWeight: '700',
  },
  valueMultiline: {
    textAlign: 'left',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-end',
  },
  chipText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  chipPrimary: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-end',
  },
  chipPrimaryText: {
    fontSize: 12,
    color: '#3730A3',
    fontWeight: '700',
  },
  amt: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    alignSelf: 'flex-end',
  },
  amtText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  amtSuccess: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-end',
  },
  amtSuccessText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '700',
  },
  parcelContainer: {
    marginTop: 8,
  },
  parcelCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  parcelCardSpacing: {
    marginTop: 12,
  },
  parcelBody: {
    marginTop: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray700,
  },
  multiLineText: {
    fontSize: 12,
    color: colors.gray800,
    lineHeight: 18,
  },
});



