import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput, StyleSheet, PanResponder, Text, TouchableOpacity } from 'react-native';
import { FormSection, FormField, SelectInput, SelectOption, SimpleDateSelector } from '../../components';


interface LeaveDetailsProps {
  formData: {
    leaveType: string;
    dateFrom: string;
    dateTo: string;
    reason: string;
    leaveDuration: string; // '0' = cả ngày, '1' = nửa ngày
    halfDayType?: string; // 'morning' | 'afternoon' | 'custom'
    halfDayDate?: string; // Ngày cụ thể cho nửa ngày
    timeFrom?: string;
    timeTo?: string;
  };
  errors: {
    leaveType?: string;
    dateFrom?: string;
    dateTo?: string;
    reason?: string;
    leaveDuration?: string;
    halfDayType?: string;
    halfDayDate?: string;
    timeFrom?: string;
    timeTo?: string;
    [key: string]: string | undefined;
  };
  leaveTypeOptions: SelectOption[];
  loading: boolean;
  onChangeFormData: (field: string, value: string) => void;
  validateField: (field: string, value: any) => boolean;
}

/**
 * Professional LeaveDetailsSection Component
 * Enterprise-level implementation with clean architecture
 */
const LeaveDetailsSection: React.FC<LeaveDetailsProps> = ({
  formData,
  errors,
  leaveTypeOptions,
  loading,
  onChangeFormData,
  validateField,
}) => {
  // Professional state management
  const [textAreaHeight, setTextAreaHeight] = useState(120);



  const handleLeaveTypeChange = useCallback((value: string) => {
    onChangeFormData('leaveType', value);
    validateField('leaveType', value);
  }, [onChangeFormData, validateField]);

  const handleDateChange = useCallback((field: string, date: string) => {
    onChangeFormData(field, date);
    validateField(field, date);
  }, [onChangeFormData, validateField]);

  const handleReasonChange = useCallback((text: string) => {
    onChangeFormData('reason', text);
    validateField('reason', text);
  }, [onChangeFormData, validateField]);

  const handleDurationChange = useCallback((value: string) => {
    onChangeFormData('leaveDuration', value);
    validateField('leaveDuration', value);
    // Reset half day fields when switching to full day
    if (value === '0') {
      onChangeFormData('halfDayType', '');
      onChangeFormData('halfDayDate', '');
      onChangeFormData('timeFrom', '');
      onChangeFormData('timeTo', '');
    } else if (value === '1') {
      // When switching to half day, auto-set halfDayDate if date range is single day
      if (formData.dateFrom && formData.dateTo && formData.dateFrom === formData.dateTo) {
        onChangeFormData('halfDayDate', formData.dateFrom);
      } else if (formData.dateFrom && !formData.dateTo) {
        // If only dateFrom is set, use it as default halfDayDate
        onChangeFormData('halfDayDate', formData.dateFrom);
      }
    }
  }, [onChangeFormData, validateField, formData.dateFrom, formData.dateTo]);

  // Function to check if half day date is valid
  const isValidHalfDayDate = useCallback((date: string): boolean => {
    if (!formData.dateFrom || !formData.dateTo || !date) return true;
    
    const halfDayDate = new Date(date);
    const fromDate = new Date(formData.dateFrom);
    const toDate = new Date(formData.dateTo);
    
    return halfDayDate >= fromDate && halfDayDate <= toDate;
  }, [formData.dateFrom, formData.dateTo]);

  // Professional PanResponder for textarea resizing
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newHeight = Math.max(120, Math.min(300, textAreaHeight + gestureState.dy / 10));
      setTextAreaHeight(newHeight);
    },
    onPanResponderRelease: () => {},
  }), [textAreaHeight]);

  // Memoized styles for performance
  const textAreaStyles = useMemo(() => [
    styles.textArea,
    { height: textAreaHeight },
  ], [textAreaHeight]);

  const textAreaWrapperStyles = useMemo(() => [
    styles.textAreaWrapper,
    errors.reason && styles.errorBorder,
  ], [errors.reason]);

  return (
    <>
    <FormSection title="Chi tiết nghỉ phép">
      {/* Leave Type - Professional Select */}
      <FormField 
        label="Loại nghỉ phép" 
        required 
        error={errors.leaveType}
      >
        <SelectInput
          options={leaveTypeOptions}
          value={formData.leaveType}
          onChange={handleLeaveTypeChange}
          placeholder="Chọn loại nghỉ phép"
          hasError={!!errors.leaveType}
          title="Chọn loại nghỉ phép"
          disabled={loading}
          loadingText="Đang tải loại nghỉ phép..."
        />
      </FormField>

      {/* From Date */}
      <SimpleDateSelector
        label="Từ ngày"
        value={formData.dateFrom}
        onChange={(date: string) => handleDateChange('dateFrom', date)}
        placeholder="YYYY-MM-DD"
        error={errors.dateFrom}
        required
      />

      {/* To Date */}
      <SimpleDateSelector
        label="Đến ngày"
        value={formData.dateTo}
        onChange={(date: string) => handleDateChange('dateTo', date)}
        placeholder="YYYY-MM-DD"
        error={errors.dateTo}
        required
      />

      {/* Leave Duration */}
      <FormField 
        label="Thời lượng nghỉ" 
        required 
        error={errors.leaveDuration}
      >
        <View style={styles.durationContainer}>
          <TouchableOpacity
            style={[
              styles.durationOption,
              formData.leaveDuration === '0' && styles.durationOptionSelected
            ]}
            onPress={() => handleDurationChange('0')}
          >
            <Text style={[
              styles.durationText,
              formData.leaveDuration === '0' && styles.durationTextSelected
            ]}>
              Cả ngày
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.durationOption,
              formData.leaveDuration === '1' && styles.durationOptionSelected
            ]}
            onPress={() => handleDurationChange('1')}
          >
            <Text style={[
              styles.durationText,
              formData.leaveDuration === '1' && styles.durationTextSelected
            ]}>
              Nửa ngày
            </Text>
          </TouchableOpacity>
        </View>
      </FormField>

      {/* Half Day Options */}
      {formData.leaveDuration === '1' && (
        <>
          {/* Half Day Date Selection */}
          <View>
            <SimpleDateSelector
              label="Chọn ngày nghỉ nửa ngày"
              value={formData.halfDayDate || ''}
              onChange={(date: string) => {
                onChangeFormData('halfDayDate', date);
                validateField('halfDayDate', date);
              }}
              placeholder="YYYY-MM-DD"
              error={errors.halfDayDate}
              required
              minDate={formData.dateFrom}
              maxDate={formData.dateTo}
            />
            <Text style={styles.helpText}>
              {formData.dateFrom && formData.dateTo 
                ? `💡 Chọn ngày cụ thể trong khoảng từ ngày bắt đầu đến ngày kết thúc để nghỉ nửa ngày`
                : formData.dateFrom 
                ? `💡 Vui lòng nhập "Đến ngày" trước để xác định khoảng thời gian`
                : `💡 Vui lòng nhập "Từ ngày" và "Đến ngày" trước để chọn ngày nghỉ nửa ngày`
              }
            </Text>
          </View>
        </>
      )}

      {/* Custom Time Range */}
      {formData.leaveDuration === '1' && formData.halfDayType === 'custom' && (
        <View style={styles.timeRangeContainer}>
          <View style={styles.timeInputContainer}>
            <Text style={styles.timeLabel}>Từ:</Text>
            <TextInput
              style={[
                styles.timeInput,
                errors.timeFrom && styles.timeInputError
              ]}
              value={formData.timeFrom || ''}
              onChangeText={(text) => {
                onChangeFormData('timeFrom', text);
                validateField('timeFrom', text);
              }}
              placeholder="HH:MM"
              maxLength={5}
            />
          </View>
          
          <View style={styles.timeInputContainer}>
            <Text style={styles.timeLabel}>Đến:</Text>
            <TextInput
              style={[
                styles.timeInput,
                errors.timeTo && styles.timeInputError
              ]}
              value={formData.timeTo || ''}
              onChangeText={(text) => {
                onChangeFormData('timeTo', text);
                validateField('timeTo', text);
              }}
              placeholder="HH:MM"
              maxLength={5}
            />
          </View>
        </View>
      )}

      {/* Reason - Professional Resizable TextArea */}
      <FormField 
        label="Lý do nghỉ phép" 
        required 
        error={errors.reason}
      >
        <View style={textAreaWrapperStyles}>
          <TextInput
            style={textAreaStyles}
            multiline
            numberOfLines={6}
            placeholder="Nhập lý do nghỉ phép..."
            value={formData.reason}
            onChangeText={handleReasonChange}
            textAlignVertical="top"
            scrollEnabled
            blurOnSubmit={false}
            testID="reason-textarea"
            accessibilityLabel="Reason for leave"
            accessibilityHint="Enter your reason for taking leave"
          />
          
          <View 
            style={styles.resizeHandle}
            {...panResponder.panHandlers}
          >
            <View style={styles.resizeIndicator} />
          </View>
        </View>
      </FormField>
    </FormSection>

  </>
  );
};

// Professional styling with theme consistency
const styles = StyleSheet.create({
  textAreaWrapper: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  textArea: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1E293B',
    textAlignVertical: 'top',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 40, // Space for resize handle
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  resizeIndicator: {
    width: 32,
    height: 4,
    backgroundColor: '#94A3B8',
    borderRadius: 2,
  },
  errorBorder: {
    borderColor: '#EF4444',
  },
  // Duration selection styles
  durationContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  durationOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  durationOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  durationTextSelected: {
    color: '#FFFFFF',
  },
  // Time range styles
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  timeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    width: 40,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
  },
  timeInputError: {
    borderColor: '#EF4444',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
    paddingHorizontal: 4,
  },
});

export default LeaveDetailsSection;