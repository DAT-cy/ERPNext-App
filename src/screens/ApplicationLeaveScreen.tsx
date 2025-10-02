import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { InformationUser } from '../types';
import { getInformationEmployee  } from '../services/checkinService';
import { useApplicationLeave } from '../hooks/useApplicationLeave';
import { SelectOption } from '../components';
// Import các components đã tách
import PersonalInfoSection from './ApplicationLeave/PersonalInfoSection';
import LeaveDetailsSection from './ApplicationLeave/LeaveDetailsSection';
import ApprovalSection from './ApplicationLeave/ApprovalSection';
import FormActions from './ApplicationLeave/FormActions';
import Header from './ApplicationLeave/Header';

import { formatDisplayDate } from '../utils';

interface FormData {
  leaveType: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
  approver: string;
  emailNotify: boolean;
  approverName: string;
  recordDate: string;
  leaveDuration: string; // '0' = cả ngày, '1' = nửa ngày
  halfDayType?: string;
  timeFrom?: string;
  timeTo?: string;
}

interface FormErrors {
  leaveType?: string;
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
  approver?: string;
  approverName?: string;
  recordDate?: string;
  leaveDuration?: string;
  halfDayType?: string;
  timeFrom?: string;
  timeTo?: string;
  [key: string]: string | undefined;
}

const ApplicationLeave: React.FC = () => {
  // Use ApplicationLeave hook
  const {
    loading,
    approvers,
    loadApprovers,
    leaveTypes,
    loadLeaveTypes,
    error
  } = useApplicationLeave();

  // State for form data
  const [formData, setFormData] = useState<FormData>({
    leaveType: '',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: '',
    reason: '',
    approver: '',
    emailNotify: false,
    approverName: '',
    recordDate: new Date().toLocaleDateString('vi-VN'), // Mặc định ngày hiện tại
    leaveDuration: '0', // Mặc định cả ngày (0)
    halfDayType: '',
    timeFrom: '',
    timeTo: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [userInfo, setUserInfo] = useState<InformationUser | undefined>();
  const [approverText, setApproverText] = useState<string>('');

  const [leaveTypeOptions, setLeaveTypeOptions] = useState<SelectOption[]>([]);

  // Load loại nghỉ phép khi component được khởi tạo
  useEffect(() => {
    const loadLeaveTypesData = async () => {
      console.log('🔄 ApplicationLeave: Loading leave types');
      try {
        const success = await loadLeaveTypes();
        console.log('📊 ApplicationLeave: loadLeaveTypes success:', success);
      } catch (err) {
        console.error('❌ ApplicationLeave: Error loading leave types:', err);
      }
    };
      
    loadLeaveTypesData();
  }, [loadLeaveTypes]);

  // Chuyển đổi leaveTypes từ API thành leaveTypeOptions
  useEffect(() => {
    if (leaveTypes && leaveTypes.length > 0) {
      console.log('📋 ApplicationLeave: Converting leaveTypes to options:', leaveTypes);
      const options: SelectOption[] = leaveTypes.map(type => ({
        label: type.name || type.leave_type_name || type.type_name || 'Không xác định',
        value: type.name || type.leave_type_name || type.type_name || 'unknown'
      }));
      console.log('✅ ApplicationLeave: Leave type options:', options);
      setLeaveTypeOptions(options);
    }
  }, [leaveTypes]);

  // Cập nhật approverText khi approvers thay đổi
  useEffect(() => {
    if (approvers && typeof approvers === 'string') {
      setApproverText(approvers);
    }
  }, [approvers]);

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Fetch employee info
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      const info = await getInformationEmployee();
      setUserInfo(info);
    };
    fetchEmployeeInfo();
  }, []);

  // Handle approver input change
  const handleApproverChange = (text: string) => {
    setApproverText(text);
    if (text.length === 0) {
      setErrors({ ...errors, approver: 'Trường này không thể để trống' });
    } else {
      setErrors({ ...errors, approver: undefined });
    }
  };

  // Form field validation
  const validateField = (field: string, value: any): boolean => {
    const newErrors = { ...errors };

    switch (field) {
      case 'leaveType':
      case 'approver':
      case 'approverName':
      case 'leaveDuration':
        if (!value || value === '') {
          newErrors[field] = 'Vui lòng chọn thông tin bắt buộc';
          setErrors(newErrors);
          return false;
        }
        break;
      case 'halfDayType':
        if (formData.leaveDuration === '1' && (!value || value === '')) {
          newErrors[field] = 'Vui lòng chọn loại nửa ngày';
          setErrors(newErrors);
          return false;
        }
        break;
      case 'timeFrom':
      case 'timeTo':
        if (formData.halfDayType === 'custom' && (!value || value === '')) {
          newErrors[field] = 'Vui lòng nhập thời gian';
          setErrors(newErrors);
          return false;
        }
        // Validate time format HH:MM
        if (value && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          newErrors[field] = 'Vui lòng nhập đúng định dạng HH:MM';
          setErrors(newErrors);
          return false;
        }
        break;
      case 'dateFrom':
      case 'dateTo':
      case 'recordDate':
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

  // Form validation
  const validateForm = (): boolean => {
    let fields: (keyof FormData)[] = [
      'leaveType', 'dateFrom', 'dateTo', 'reason', 'approver',
      'approverName', 'recordDate', 'leaveDuration'
    ];
    
    // Add conditional fields based on selection
    if (formData.leaveDuration === '1') { // Nửa ngày
      fields.push('halfDayType');
      if (formData.halfDayType === 'custom') {
        fields.push('timeFrom', 'timeTo');
      }
    }
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

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    Alert.alert(
      type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : 'Thông báo',
      message
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      showNotification('Đơn xin nghỉ phép đã được gửi thành công! ✅', 'success');
    } else {
      showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    showNotification('Đã lưu nháp thành công! 💾', 'success');
  };

  // Handle cancel
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

  // Handle form data change
  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle email notification
  const toggleEmailNotify = () => {
    setFormData(prev => ({
      ...prev,
      emailNotify: !prev.emailNotify
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

      {/* Header */}
      <Header onBack={handleCancel} onSaveDraft={handleSaveDraft} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          
          {/* Personal Info Section */}
          <PersonalInfoSection userInfo={userInfo} />

          {/* Leave Details Section */}
          <LeaveDetailsSection
            formData={formData}
            errors={errors}
            leaveTypeOptions={leaveTypeOptions}
            loading={loading}
            onChangeFormData={handleFormDataChange}
            validateField={validateField}
          />

          {/* Approval Section */}
          <ApprovalSection
            formData={formData}
            errors={errors}
            approverText={approverText}
            loading={loading}
            onChangeApproverText={handleApproverChange}
            toggleEmailNotify={toggleEmailNotify}
            onChangeApproverName={(text) => handleFormDataChange('approverName', text)}
            onChangeRecordDate={(date) => handleFormDataChange('recordDate', date)}
          />
        </Animated.View>
      </ScrollView>

      {/* Form Actions */}
      <FormActions
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
});

export default ApplicationLeave;