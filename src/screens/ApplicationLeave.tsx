import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { InformationUser } from '../types';
import { getInformationEmployee } from '../services/checkinService';
import { useApplicationLeave } from '../hooks/useApplicationLeave';


interface FormData {
  leaveType: string;
  dateFrom: string;
  dateTo: string;
  leaveForm: string;
  reason: string;
  approver: string;
  emailNotify: boolean;
}

interface FormErrors {
  leaveType?: string;
  dateFrom?: string;
  dateTo?: string;
  leaveForm?: string;
  reason?: string;
  approver?: string;
  [key: string]: string | undefined;
}

interface PickerOption {
  label: string;
  value: string;
}

const ApplicationLeave: React.FC = () => {
  // Use ApplicationLeave hook
  const {
    loading,
    approvers: apiApprovers,
    loadApprovers,
    error
  } = useApplicationLeave();

  // Fixed approvers data
  const approvers = [
    {
      name: "HR-EMP-00001",
      employee_name: "Nguyễn Văn Minh",
      employee: "HR-EMP-00001"
    },
    {
      name: "HR-EMP-00002", 
      employee_name: "Trần Thị Hương",
      employee: "HR-EMP-00002"
    },
    {
      name: "HR-EMP-00003",
      employee_name: "Lê Quang Hải", 
      employee: "HR-EMP-00003"
    },
    {
      name: "HR-EMP-00004",
      employee_name: "Phạm Thị Lan",
      employee: "HR-EMP-00004"
    }
  ];
  const [formData, setFormData] = useState<FormData>({
    leaveType: '',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: '',
    leaveForm: '',
    reason: '',
    approver: '',
    emailNotify: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [showLeaveFormModal, setShowLeaveFormModal] = useState(false);
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [getInfor , setInfor] = useState<InformationUser | undefined>();


  

  const leaveTypeOptions: PickerOption[] = [
    { label: 'Nghỉ phép năm', value: 'annual' },
    { label: 'Nghỉ ốm', value: 'sick' },
    { label: 'Nghỉ không lương', value: 'unpaid' },
    { label: 'Nghỉ thai sản', value: 'maternity' },
    { label: 'Nghỉ việc riêng', value: 'personal' },
  ];

  const leaveFormOptions: PickerOption[] = [
    { label: 'Nghỉ cả ngày', value: 'full-day' },
    { label: 'Nghỉ buổi sáng', value: 'morning' },
    { label: 'Nghỉ buổi chiều', value: 'afternoon' },
    { label: 'Nghỉ nửa ngày', value: 'half-day' },
  ];

  const approverOptions: PickerOption[] = [
    { label: 'Trần Thị Bình - Trưởng phòng', value: 'manager1' },
    { label: 'Lê Văn Cường - Giám đốc', value: 'manager2' },
    { label: 'Phòng Nhân sự', value: 'hr' },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      const info = await getInformationEmployee();
      setInfor(info);
    };
    fetchEmployeeInfo();
  }, []);
  // Debug: Log fixed approvers data
  useEffect(() => {
    console.log('🔍 Fixed Approvers data:', approvers);
    console.log('🔍 Approvers type:', typeof approvers);
    console.log('🔍 Is array:', Array.isArray(approvers));
  }, []);


  const validateField = (field: keyof FormData, value: any): boolean => {
    const newErrors = { ...errors };

    switch (field) {
      case 'leaveType':
      case 'leaveForm':
      case 'approver':
        if (!value || value === '') {
          newErrors[field] = 'Vui lòng chọn thông tin bắt buộc';
          setErrors(newErrors);
          return false;
        }
        break;
      case 'dateFrom':
      case 'dateTo':
        if (!value) {
          newErrors[field] = 'Vui lòng chọn ngày';
          setErrors(newErrors);
          return false;
        }
        break;
      case 'reason':
        if (!value || value.trim() === '') {
          newErrors[field] = 'Vui lòng nhập lý do nghỉ phép';
          setErrors(newErrors);
          return false;
        }
        break;
    }

    delete newErrors[field];
    setErrors(newErrors);
    return true;
  };

  const validateForm = (): boolean => {
    const fields: (keyof FormData)[] = ['leaveType', 'dateFrom', 'dateTo', 'leaveForm', 'reason', 'approver'];
    let isValid = true;

    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    // Validate date range
    if (formData.dateFrom && formData.dateTo && new Date(formData.dateFrom) > new Date(formData.dateTo)) {
      showNotification('Ngày kết thúc phải sau ngày bắt đầu', 'error');
      isValid = false;
    }

    return isValid;
  };

  
   const getApproverLabel = (approvers: any, selectedId: string | null) => {
    if (!approvers || !selectedId) {
      return '';
    }
    
    // Handle case where approvers is an array
    if (Array.isArray(approvers)) {
      const approver = approvers.find((app) => app.name === selectedId);
      return approver ? `${approver.employee_name} (${approver.name})` : '';
    }
    
    // Handle case where approvers is a single object or has message property
    if (approvers.message === selectedId) {
      return approvers.message;
    }
    
    return '';
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    Alert.alert(
      type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : 'Thông báo',
      message
    );
  };

  const handleSubmit = () => {
    if (validateForm()) {
      showNotification('Đơn xin nghỉ phép đã được gửi thành công! ✅', 'success');
    } else {
      showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
    }
  };

  const handleSaveDraft = () => {
    showNotification('Đã lưu nháp thành công! 💾', 'success');
  };

  const handleCancel = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', onPress: () => showNotification('Quay lại danh sách nghỉ phép') },
      ]
    );
  };

  const getOptionLabel = (options: PickerOption[], value: string): string => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : '';
  };

  const renderCustomPicker = (
    title: string,
    options: PickerOption[],
    selectedValue: string,
    onSelect: (value: string) => void,
    visible: boolean,
    onClose: () => void,
    placeholder: string
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerNav}>
          <TouchableOpacity style={styles.navBtn} onPress={handleCancel}>
            <Text style={styles.navBtnText}>← Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={handleSaveDraft}>
            <Text style={styles.navBtnText}>💾 Lưu nháp</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>📝 Đơn Xin Nghỉ Phép</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {/* Leave Balance */}
          {/* <View style={styles.leaveBalance}>
            <Text style={styles.balanceNumber}>12</Text>
            <Text style={styles.balanceLabel}>Ngày phép còn lại</Text>
          </View> */}

          {/* Personal Information Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>👤 Thông tin cơ bản</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã số:</Text>
                <Text style={styles.infoValue}>HR-LAP-.YYYY.</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nhân viên:</Text>
                <Text style={styles.infoValue}>{getInfor?.employee_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Công ty:</Text>
                <Text style={styles.infoValue}>{getInfor?.company}</Text>
              </View>
            </View>
          </View>

          {/* Leave Details Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>🗓️ Chi tiết nghỉ phép</Text>

            {/* Leave Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Loại nghỉ phép <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectInput, errors.leaveType && styles.errorBorder]}
                onPress={() => setShowLeaveTypeModal(true)}
              >
                <Text style={[
                  styles.selectText, 
                  !formData.leaveType && styles.placeholderText
                ]}>
                  {getOptionLabel(leaveTypeOptions, formData.leaveType) || 'Chọn loại nghỉ phép'}
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
              {errors.leaveType && <Text style={styles.errorText}>{errors.leaveType}</Text>}
            </View>

            {/* Date Range */}
            <View style={styles.dateGroup}>
              <View style={styles.dateGroupItem}>
                <Text style={styles.formLabel}>
                  Từ ngày <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.dateInput, errors.dateFrom && styles.errorBorder]}
                  value={formData.dateFrom}
                  onChangeText={(text) => {
                    setFormData({ ...formData, dateFrom: text });
                    validateField('dateFrom', text);
                  }}
                  placeholder="YYYY-MM-DD"
                />
                {errors.dateFrom && <Text style={styles.errorText}>{errors.dateFrom}</Text>}
              </View>

              <View style={styles.dateGroupItem}>
                <Text style={styles.formLabel}>
                  Đến ngày <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.dateInput, errors.dateTo && styles.errorBorder]}
                  value={formData.dateTo}
                  onChangeText={(text) => {
                    setFormData({ ...formData, dateTo: text });
                    validateField('dateTo', text);
                  }}
                  placeholder="YYYY-MM-DD"
                />
                {errors.dateTo && <Text style={styles.errorText}>{errors.dateTo}</Text>}
              </View>
            </View>

            {/* Leave Form */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Hình thức nghỉ <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectInput, errors.leaveForm && styles.errorBorder]}
                onPress={() => setShowLeaveFormModal(true)}
              >
                <Text style={[
                  styles.selectText, 
                  !formData.leaveForm && styles.placeholderText
                ]}>
                  {getOptionLabel(leaveFormOptions, formData.leaveForm) || 'Chọn hình thức nghỉ'}
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
              {errors.leaveForm && <Text style={styles.errorText}>{errors.leaveForm}</Text>}
            </View>

            {/* Reason */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Lý do nghỉ phép <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textArea, errors.reason && styles.errorBorder]}
                multiline
                numberOfLines={4}
                placeholder="Nhập lý do nghỉ phép..."
                value={formData.reason}
                onChangeText={(text) => {
                  setFormData({ ...formData, reason: text });
                  validateField('reason', text);
                }}
                textAlignVertical="top"
              />
              {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
            </View>
          </View>

          {/* Approval Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>✅ Phê duyệt</Text>

            {/* Approver */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Người phê duyệt <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectInput, errors.approver && styles.errorBorder]}
                onPress={() => setShowApproverModal(true)}
              >
                <Text style={[
                  styles.selectText, 
                  !formData.approver && styles.placeholderText
                ]}>
                  {getApproverLabel(approvers, formData.approver) || 'Chọn người phê duyệt'}
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
              {errors.approver && <Text style={styles.errorText}>{errors.approver}</Text>}
            </View>

            {/* Email Notification */}
            <TouchableOpacity
              style={styles.checkboxGroup}
              onPress={() => setFormData({ ...formData, emailNotify: !formData.emailNotify })}
            >
              <View style={[styles.checkbox, formData.emailNotify && styles.checkboxChecked]}>
                {formData.emailNotify && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Gửi thông báo qua email</Text>
            </TouchableOpacity>

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Trạng thái</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>⏳ Đang soạn thảo</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Form Actions */}
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleCancel}>
          <Text style={styles.btnSecondaryText}>❌ Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
          <Text style={styles.btnPrimaryText}>📤 Gửi đơn</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Pickers */}
      {renderCustomPicker(
        'Chọn loại nghỉ phép',
        leaveTypeOptions,
        formData.leaveType,
        (value) => {
          setFormData({ ...formData, leaveType: value });
          validateField('leaveType', value);
        },
        showLeaveTypeModal,
        () => setShowLeaveTypeModal(false),
        'Chọn loại nghỉ phép'
      )}

      {renderCustomPicker(
        'Chọn hình thức nghỉ',
        leaveFormOptions,
        formData.leaveForm,
        (value) => {
          setFormData({ ...formData, leaveForm: value });
          validateField('leaveForm', value);
        },
        showLeaveFormModal,
        () => setShowLeaveFormModal(false),
        'Chọn hình thức nghỉ'
      )}

      {renderCustomPicker(
        'Chọn người phê duyệt',
        Array.isArray(approvers) 
          ? approvers.map(approver => ({
              label: `${approver.employee_name} (${approver.name})`,
              value: approver.name
            }))
          : (approvers as any)?.message 
            ? [{ label: (approvers as any).message, value: (approvers as any).message }]
            : [],
        formData.approver,
        (value) => {
          setFormData({ ...formData, approver: value });
          validateField('approver', value);
        },
        showApproverModal,
        () => setShowApproverModal(false),
        'Chọn người phê duyệt'
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  leaveBalance: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  selectText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  selectArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateGroupItem: {
    flex: 1,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  formActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  btnSecondary: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  btnPrimary: {
    flex: 1,
    padding: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseBtnText: {
    fontSize: 18,
    color: '#6b7280',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default ApplicationLeave;
