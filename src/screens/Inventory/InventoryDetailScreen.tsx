import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../styles/globalStyles';
import { wp, hp, fs } from '../../utils/responsive';
import { InventoryDetailData } from '../../services/inventoryDetailService';
import { RootStackParamList } from '../../navigation/types';
import { inventoryDetailStyles as styles } from '../../styles/InventoryDetailScreen.styles';

 

type InventoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'InventoryDetailScreen'>;

export default function InventoryDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<InventoryDetailScreenRouteProp>();
  const { inventoryDetail } = route.params || {};
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentInputHeight, setCommentInputHeight] = useState(hp(25));
  const scrollViewRef = useRef<ScrollView>(null);
  
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
  
  // Handle comment input focus - scroll to comment section
  const handleCommentFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300); // Tăng delay để đảm bảo keyboard đã hiện hoàn toàn
  };

  // Handle comment input content size change - auto expand
  const handleCommentContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const minHeight = hp(25);
    const maxHeight = hp(40); // Giới hạn chiều cao tối đa
    
    if (height > minHeight && height < maxHeight) {
      setCommentInputHeight(height);
      // Scroll to end when content expands
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

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

  const handleUpdatePrice = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 2000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.sectionCard}>
            {/* Back Button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(1) }}>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: wp(2) }}>
                <Feather name="arrow-left" size={wp(5)} color={colors.gray800} />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
            </View>
            <View style={styles.mobileHeaderContainer}>
              <Text style={styles.mobileTitle}>Chi tiết phiếu nhập xuất</Text>
              <Text style={styles.mobileSubtitle}>{data.name}</Text>
            </View>
            
            
            <View style={styles.mobileFormGrid}>

              
              <View style={styles.mobileFormRow}>
                <Text style={styles.mobileFieldLabel}>Ngày Ghi Sổ</Text>
                <Text style={styles.mobileFieldValue}>{formatDate(data.creation)}</Text>
              </View>    
              <View style={styles.mobileFormRow}>
                <Text style={styles.mobileFieldLabel}>Diễn Giải</Text>
                <Text style={styles.mobileFieldValue}>{data.custom_interpretation || 'N/A'}</Text>
              </View>
              <View style={styles.mobileFormRow}>
                <Text style={styles.mobileFieldLabel}>Trạng thái:</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{data.workflow_state || 'N/A'}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.documentInfoCard}>
              <Text style={styles.documentInfoTitle}>Thông Tin Phiếu</Text>
              <View style={styles.documentInfoRow}>
                <Text style={styles.documentInfoLabel}>Mã phiếu (GIT) :</Text>
                <Text style={styles.documentInfoValue}>{data.outgoing_stock_entry}</Text>
              </View>
            
              <View style={styles.documentInfoRow}>
                <Text style={styles.documentInfoLabel}>Người tạo:</Text>
                <Text style={styles.documentInfoValue}>{data.owner || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Warehouse Information Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Thông Tin Kho</Text>
            
            <View style={styles.mobileWarehouseCard}>
              <View style={styles.mobileFormRow}>
                <Text style={styles.mobileWarehouseLabel}>Kho xuất</Text>
                <Text style={[styles.mobileWarehouseLabel, { color: colors.primary, textAlign: 'center' }]}>→</Text>
                <Text style={styles.mobileWarehouseLabel}>Kho nhập</Text>
              </View>
              <View style={styles.mobileFormRow}>
                <Text style={[styles.mobileWarehouseValue, { color: colors.gray800 }]}>
                  {(data.from_warehouse || 'N/A').split(' - ')[0]}
                </Text>
                <Text style={[styles.mobileWarehouseValue, { color: colors.gray800, textAlign: 'right' }]}>
                  {(data.custom_original_target_warehouse || 'N/A').split(' - ')[0]}
                </Text>
              </View>
            </View>
          </View>

          {/* Material Information Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderWithTotal}>
              <Text style={styles.sectionTitle}>Danh Sách Mặt Hàng</Text>
              <View style={styles.totalItemsContainer}>
                <Text style={styles.totalItemsText}>
                  Tổng: {data.items?.length || 0}
                </Text>
              </View>
            </View>
            
            {data.items && data.items.length > 0 ? (
              data.items.map((item: any, index: number) => (
                <View key={index} style={styles.enhancedItemCard}>
                  {/* Header with item code and status */}
                  <View style={styles.enhancedItemHeader}>
                    <View style={styles.itemCodeContainer}>
                      <Text style={styles.enhancedItemCode}>{item.item_code}</Text>
                      <View style={[styles.statusIndicator, { 
                        backgroundColor: item.is_finished_item ? colors.success + '20' : colors.gray200 
                      }]}>
                        <Text style={[styles.enhancedStatusText, { 
                          color: item.is_finished_item ? colors.success : colors.gray600 
                        }]}>
                          {item.is_finished_item ? '✓ Thành phẩm' : '○ Vật tư'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Item name */}
                  <Text style={styles.enhancedItemName} numberOfLines={2}>
                    {item.item_name}
                  </Text>
                  
                  {/* Quantity and UOM */}
                  <View style={styles.quantityContainer}>
                    <View style={styles.quantityInfo}>
                      <Text style={styles.quantityLabel}>Số lượng</Text>
                      <Text style={styles.quantityValue}>{item.qty}</Text>
                    </View>
                    <View style={styles.uomContainer}>
                      <Text style={styles.uomText}>{item.uom}</Text>
                    </View>
                  </View>
                  
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>📦</Text>
                <Text style={styles.emptyStateText}>Không có mặt hàng nào</Text>
                <Text style={styles.emptyStateSubtext}>Danh sách mặt hàng trống</Text>
              </View>
            )}
          </View>

          {/* Stock Movement Information */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tổng Kết</Text>
            
            <View style={styles.mobileSummaryGrid}>
              <View style={styles.mobileSummaryCard}>
                <Text style={styles.mobileSummaryLabel}>Tổng Giá Trị Nhập</Text>
                <Text style={styles.mobileSummaryValue}>{data.total_incoming_value?.toLocaleString('vi-VN') || '0'} VNĐ</Text>
              </View>
              
              <View style={styles.mobileSummaryCard}>
                <Text style={styles.mobileSummaryLabel}>Tổng Giá Trị Xuất</Text>
                <Text style={styles.mobileSummaryValue}>{data.total_outgoing_value?.toLocaleString('vi-VN') || '0'} VNĐ</Text>
              </View>
              
              <View style={styles.mobileSummaryCard}>
                <Text style={styles.mobileSummaryLabel}>Chênh Lệch</Text>
                <Text style={[styles.mobileSummaryValue, { 
                  color: (data.value_difference || 0) >= 0 ? colors.success : colors.error 
                }]}>
                  {data.value_difference?.toLocaleString('vi-VN') || '0'} VNĐ
                </Text>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Nhận Xét</Text>
            {/* Comment Input Form */}
            <View style={styles.commentFormContainer}>
              <TextInput
                style={[styles.commentInput, { height: commentInputHeight }]}
                placeholder="Nhập nhận xét của bạn..."
                placeholderTextColor={colors.gray500}
                multiline
                textAlignVertical="top"
                value={commentText}
                onChangeText={setCommentText}
                onFocus={handleCommentFocus}
                onContentSizeChange={handleCommentContentSizeChange}
                scrollEnabled={false}
              />
              
              <TouchableOpacity
                style={[styles.submitButton, 
                  commentText.trim().length === 0 && styles.submitButtonDisabled]}
                onPress={handleSubmitComment}
                disabled={commentText.trim().length === 0 || isSubmitting}
                activeOpacity={0.7}
              >
                <Text style={[styles.submitButtonText,
                  commentText.trim().length === 0 && styles.submitButtonTextDisabled]}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                </Text>
              </TouchableOpacity>
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
