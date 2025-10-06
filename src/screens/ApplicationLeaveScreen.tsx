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


  // Mapping từ tiếng Anh (API) sang tiếng Việt (hiển thị)
  const leaveTypeMapping: Record<string, string> = {
    'Compensatory Off': 'Nghỉ bù',
    'Annual Leave': 'Nghỉ phép năm',
    'Sick Leave': 'Nghỉ ốm',
    'Casual Leave': 'Nghỉ có phép',
    'Emergency Leave': 'Nghỉ khẩn cấp',
    'Maternity Leave': 'Nghỉ thai sản',
    'Paternity Leave': 'Nghỉ chăm con',
    'Compensatory Leave': 'Nghỉ bù',
    'Study Leave': 'Nghỉ học tập',
    'Marriage Leave': 'Nghỉ cưới',
    'Bereavement Leave': 'Nghỉ tang lễ',
    'Medical Leave': 'Nghỉ điều trị',
    'Personal Leave': 'Nghỉ cá nhân',
    'Unpaid Leave': 'Nghỉ không lương',
    'Leave Without Pay': 'Nghỉ không lương',
    'Privilege Leave': 'Nghỉ đặc biệt',
    'Earned Leave': 'Nghỉ tích lũy',
    'Half Day': 'Nghỉ nửa ngày',
    'Work From Home': 'Làm việc tại nhà',
    'Quarantine Leave': 'Nghỉ cách ly',
    'Vaccination Leave': 'Nghỉ tiêm chủng'
  };

  // Chuyển đổi leaveTypes từ API thành leaveTypeOptions với tiếng Việt
  useEffect(() => {
    if (leaveTypes && leaveTypes.length > 0) {
      console.log('📋 ApplicationLeave: Converting leaveTypes to options:', leaveTypes);
      const options: SelectOption[] = leaveTypes.map(type => {
        const englishValue = type.name || type.leave_type_name || type.type_name || 'unknown';
        const vietnameseLabel = leaveTypeMapping[englishValue] || englishValue;
        
        return {
          label: vietnameseLabel, // Hiển thị tiếng Việt
          value: englishValue     // Gửi lên API bằng tiếng Anh
        };
      });
      console.log('✅ ApplicationLeave: Leave type options with Vietnamese labels:', options);
      setLeaveTypeOptions(options);
      
      // Tự động chọn mặc định "Leave Without Pay" nếu có trong danh sách
      const defaultLeaveType = options.find(option => option.value === 'Leave Without Pay');
      if (defaultLeaveType && !formData.leaveType) {
        console.log('🎯 Setting default leave type to "Leave Without Pay"');
        setFormData(prev => ({
          ...prev,
          leaveType: 'Leave Without Pay'
        }));
      }
    }
  }, [leaveTypes]);

  // Cập nhật approverText và formData.approver khi approvers thay đổi
  useEffect(() => {    
    if (approvers && typeof approvers === 'string') {
      setApproverText(approvers);
      
      setFormData(prev => ({
        ...prev,
        approver: approvers // Giả sử approvers là email
      }));
    } else if (Array.isArray(approvers) && approvers.length > 0) {
      // Nếu approvers là array, lấy phần tử đầu tiên
      const firstApprover = approvers[0];
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
            setFormData(prev => ({
          ...prev,
          username: employeeInfo || '',
          approverName: employeeInfo || '', 
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
      const result = await saveLeaveApplication(payload);
      
      showNotification('Đơn xin nghỉ phép đã được gửi thành công! ', 'success');
      
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
      
    } catch (error: any) {
      let errorMessage = 'Có lỗi xảy ra khi gửi đơn xin nghỉ phép. Vui lòng thử lại.';
            if (error?.type) {
        switch (error.type) {
          case 'overlap':
            const { leaveType, dateRange, docId } = error.details;
            const vietnameseLeaveType = leaveTypeMapping[leaveType] || leaveType || formData.leaveType;
            const displayDateRange = dateRange || `${formData.dateFrom} - ${formData.dateTo}`;
            
            errorMessage = `⚠️ Đơn nghỉ phép bị trùng lặp!\n\n` +
              `📅 Bạn đã đăng ký nghỉ phép "${vietnameseLeaveType}" trong khoảng thời gian ${displayDateRange}\n\n` +
              `📝 Mã đơn đã tồn tại: ${docId}\n\n` +
              `💡 Giải pháp:\n` +
              `• Kiểm tra lại ngày nghỉ\n` +
              `• Chọn thời gian khác\n` +
              `• Hoặc hủy đơn cũ trước khi tạo đơn mới`;
            break;
            
          case 'insufficient_balance':
            errorMessage = `❌ Không đủ số ngày nghỉ phép!\n\n` +
              `📊 Số ngày nghỉ còn lại không đủ cho đơn này.\n\n` +
              `💡 Giải pháp:\n` +
              `• Kiểm tra số ngày nghỉ còn lại\n` +
              `• Giảm số ngày nghỉ trong đơn\n` +
              `• Hoặc chọn loại nghỉ khác`;
            break;
            
          case 'network':
            errorMessage = `🌐 Lỗi kết nối mạng!\n\n` +
              `💡 Giải pháp:\n` +
              `• Kiểm tra kết nối internet\n` +
              `• Thử lại sau vài phút`;
            break;
            
          case 'api_error':
            errorMessage = `🔧 Lỗi từ server!\n\n` +
              `💡 Giải pháp:\n` +
              `• Thử lại sau vài phút\n` +
              `• Liên hệ quản trị viên nếu lỗi tiếp tục`;
            break;
            
          default:
            // Fallback cho các lỗi chưa được xử lý
            const rawException = error.details?.rawException || '';
            if (rawException.includes('Invalid date')) {
              errorMessage = `📅 Ngày tháng không hợp lệ!\n\n` +
                `💡 Giải pháp:\n` +
                `• Ngày bắt đầu phải trước ngày kết thúc\n` +
                `• Không được chọn ngày trong quá khứ\n` +
                `• Định dạng ngày phải đúng (YYYY-MM-DD)`;
            } else if (rawException.includes('unauthorized') || rawException.includes('permission')) {
              errorMessage = `🔒 Không có quyền thực hiện!\n\n` +
                `💡 Bạn không có quyền tạo đơn nghỉ phép.\n` +
                `Vui lòng liên hệ quản trị viên.`;
            }
            break;
        }
      }
      // Fallback cho error cũ (backward compatibility)
      else if (error?.exception || error?.message) {
        const errorText = error.exception || error.message || '';
        
        if (errorText.includes('OverlapError') || errorText.includes('has already applied for')) {
          const employeeMatch = errorText.match(/Employee\s+([^\s]+)/);
          const leaveTypeMatch = errorText.match(/for\s+([^b]+)\s+between/);
          const dateMatch = errorText.match(/between\s+([^:]+)/);
          const docIdMatch = errorText.match(/HR-LAP-\d+-\d+/);
          
          const leaveType = leaveTypeMatch ? leaveTypeMatch[1].trim() : formData.leaveType;
          const dateRange = dateMatch ? dateMatch[1].trim() : `${formData.dateFrom} - ${formData.dateTo}`;
          const docId = docIdMatch ? docIdMatch[0] : '';
          const vietnameseLeaveType = leaveTypeMapping[leaveType] || leaveType;
          
          errorMessage = `⚠️ Đơn nghỉ phép bị trùng lặp!\n\n` +
            `📅 Bạn đã đăng ký nghỉ phép "${vietnameseLeaveType}" trong khoảng thời gian ${dateRange}\n\n` +
            `📝 Mã đơn đã tồn tại: ${docId}\n\n` +
            `💡 Giải pháp:\n` +
            `• Kiểm tra lại ngày nghỉ\n` +
            `• Chọn thời gian khác\n` +
            `• Hoặc hủy đơn cũ trước khi tạo đơn mới`;
        }
      }
      
      showNotification(errorMessage, 'error');
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