import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InformationUser } from '../types';
import { getInformationEmployee  } from '../services/checkinService';
import { useApplicationLeave } from '../hooks/useApplicationLeave';
import { SelectOption } from '../components';
import { saveLeaveApplication , getLeaveApproversName} from '../services/applicationLeave';
import { SaveLeaveApplicationPayload } from '../types/applicationLeave.types';

// Import các components đã tách
import PersonalInfoSection from './ApplicationLeave/PersonalInfoSection';
import LeaveDetailsSection from './ApplicationLeave/LeaveDetailsSection';
import ApprovalSection from './ApplicationLeave/ApprovalSection';
import FormActions from './ApplicationLeave/FormActions';
import Header from './ApplicationLeave/Header';
// Local interfaces
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
  halfDayType: string;
  halfDayDate: string; // Ngày cụ thể cho nửa ngày
  timeFrom: string;
  timeTo: string;
  username?: string;
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
  halfDayDate?: string;
  timeFrom?: string;
  timeTo?: string;
  [key: string]: string | undefined;
}

const ApplicationLeave: React.FC = () => {
  // Navigation hook
  const navigation = useNavigation();
  
  // Use ApplicationLeave hook
  const {
    loading,
    approvers,
    leaveTypes,
    loadLeaveTypes,
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
    halfDayDate: '', // Ngày cụ thể cho nửa ngày
    timeFrom: '',
    timeTo: '',
    username: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [userInfo, setUserInfo] = useState<InformationUser | undefined>();
  const [approverText, setApproverText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

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

  // Cập nhật approverText và formData.approver khi approvers thay đổi
  useEffect(() => {
    console.log('🔍 [DEBUG] Approvers effect triggered, approvers:', approvers);
    
    if (approvers && typeof approvers === 'string') {
      console.log('✅ [DEBUG] Setting approverText with string approvers:', approvers);
      setApproverText(approvers);
      
      // Set email approver vào formData
      setFormData(prev => ({
        ...prev,
        approver: approvers // Giả sử approvers là email
      }));
    } else if (Array.isArray(approvers) && approvers.length > 0) {
      // Nếu approvers là array, lấy phần tử đầu tiên
      const firstApprover = approvers[0];
      console.log('✅ [DEBUG] Setting approverText with first approver:', firstApprover);
      
      // Kiểm tra xem approver có email property không
      const approverEmail = firstApprover.email || firstApprover.user_id || firstApprover.name || firstApprover;
      setApproverText(approverEmail);
      
      setFormData(prev => ({
        ...prev,
        approver: approverEmail
      }));
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

    // load tên người dùng 
  useEffect(() => {
    const loadUserName = async () => {
      if (!formData.approver || formData.approver.trim() === '') {
        return;
      }
      
      try {
        const approver = formData.approver
        const employeeInfo = await getLeaveApproversName(approver);
    
        console.log('✅ [DEBUG] Got employee info:', employeeInfo);
        setFormData(prev => ({
          ...prev,
          username: employeeInfo || '',
          approverName: employeeInfo || '', // Set tên người phê duyệt
        }));
      } catch (error) {
        console.error("❌ ApplicationLeave: Error loading user name:", error);
      }
    };

    loadUserName();
  }, [formData.approver]); // Dependency: chỉ chạy khi formData.approver thay đổi

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
      case 'halfDayDate':
        if (formData.leaveDuration === '1' && (!value || value === '')) {
          newErrors[field] = 'Vui lòng chọn ngày nghỉ nửa ngày';
          setErrors(newErrors);
          return false;
        }
        // Validate date is within the range from dateFrom to dateTo
        if (value && formData.dateFrom && formData.dateTo) {
          const halfDayDate = new Date(value);
          const fromDate = new Date(formData.dateFrom);
          const toDate = new Date(formData.dateTo);
          
          if (halfDayDate < fromDate || halfDayDate > toDate) {
            newErrors[field] = 'Ngày nghỉ nửa ngày phải nằm trong khoảng từ ngày đến ngày';
            setErrors(newErrors);
            return false;
          }
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

  // Form validation - CHỈ VALIDATE CÁC FIELD CẦN THIẾT CHO API
  const validateForm = (): boolean => {
    console.log('🔍 Validating form with data:', formData);
    
    // CHỈ VALIDATE CÁC FIELD TRONG SaveLeaveApplicationPayload
    let fields: (keyof FormData)[] = [
      'leaveType',    // -> leave_type
      'dateFrom',     // -> from_date  
      'dateTo',       // -> to_date
      'reason',       // -> description
      'leaveDuration' // -> half_day (0 hoặc 1)
    ];
    
    // Nếu chọn nửa ngày, cần thêm halfDayDate
    if (formData.leaveDuration === '1') { // Nửa ngày
      fields.push('halfDayDate'); // -> half_day_date
    }
    
    console.log('📋 Fields to validate for API:', fields);
    let isValid = true;
    const failedFields: string[] = [];

    // Validate từng field
    fields.forEach(field => {
      const fieldValue = formData[field];
      console.log(`🔎 Checking field "${field}":`, fieldValue);
      
      // Kiểm tra field bắt buộc
      if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        console.log(`❌ Field "${field}" is empty or invalid`);
        isValid = false;
        failedFields.push(field);
      }
    });
    
    // Validate date range
    if (formData.dateFrom && formData.dateTo && new Date(formData.dateFrom) > new Date(formData.dateTo)) {
      console.log('❌ Date range validation failed');
      isValid = false;
      failedFields.push('dateRange');
    }
    
    if (!isValid) {
      console.log('❌ Validation failed for API fields:', failedFields);
      
      // Map field names to Vietnamese
      const fieldNames: { [key: string]: string } = {
        'leaveType': 'Loại nghỉ phép',
        'dateFrom': 'Từ ngày',
        'dateTo': 'Đến ngày',
        'reason': 'Lý do nghỉ phép',
        'leaveDuration': 'Thời lượng nghỉ',
        'halfDayDate': 'Ngày nghỉ nửa ngày',
        'dateRange': 'Khoảng thời gian (Đến ngày phải sau Từ ngày)'
      };
      
      const missingFieldsVN = failedFields.map(field => fieldNames[field] || field).join(', ');
      showNotification(`Vui lòng điền đầy đủ thông tin: ${missingFieldsVN}`, 'error');
    } else {
      console.log('✅ API validation passed');
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
  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    if (!userInfo?.name) {
      showNotification('Không tìm thấy thông tin nhân viên', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      // Chuẩn bị payload theo yêu cầu
      const payload: SaveLeaveApplicationPayload = {
        employee: userInfo.name,
        leave_type: formData.leaveType,
        from_date: formData.dateFrom,
        to_date: formData.dateTo,
        half_day: formData.leaveDuration === '1' ? 1 : 0, // Nửa ngày = 1, cả ngày = 0
        half_day_date: formData.halfDayDate || '',
        description: formData.reason,
        doctype: 'Leave Application',
        web_form_name: 'leave-application'
      };

      console.log('🚀 Submitting leave application with payload:', payload);
      console.log('👤 User Info:', userInfo);
      console.log('📋 Form Data:', formData);
      
      const result = await saveLeaveApplication(payload);
      
      console.log('✅ Leave application submitted successfully:', result);
      showNotification('Đơn xin nghỉ phép đã được gửi thành công! ✅', 'success');
      
      // Reset form sau khi submit thành công
      setFormData({
        leaveType: '',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: '',
        reason: '',
        approver: '',
        emailNotify: false,
        approverName: '',
        recordDate: new Date().toLocaleDateString('vi-VN'),
        leaveDuration: '0',
        halfDayType: '',
        halfDayDate: '',
        timeFrom: '',
        timeTo: '',
      });
      setErrors({});
      
    } catch (error) {
      console.error('❌ Error submitting leave application:', error);
      showNotification(
        'Có lỗi xảy ra khi gửi đơn xin nghỉ phép. Vui lòng thử lại.',
        'error'
      );
    } finally {
      setSubmitting(false);
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
        { 
          text: 'Có', 
          onPress: () => {
            navigation.goBack();
          }
        },
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
        loading={loading || submitting}
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