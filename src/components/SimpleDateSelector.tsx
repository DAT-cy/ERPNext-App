import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
} from 'react-native';
import Calendar from './Calendar';

interface SimpleDateSelectorProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  minDate?: string; // Ngày tối thiểu có thể chọn
  maxDate?: string; // Ngày tối đa có thể chọn
}

const SimpleDateSelector: React.FC<SimpleDateSelectorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  error,
  required = false,
  minDate,
  maxDate,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const showDatePicker = () => {
    console.log('🗓️ Opening beautiful calendar');
    setShowCalendar(true);
  };

  const onDateSelect = (date: string) => {
    console.log('✅ Date selected from calendar:', date);
    onChange(date);
    setShowCalendar(false);
  };

  const onCalendarClose = () => {
    console.log('� Calendar closed');
    setShowCalendar(false);
  };

  const handleTextInput = (text: string) => {
    console.log('Input text:', text);
    
    const formattedDate = formatDateInput(text);
    onChange(formattedDate);
  };
  /**
   * Tự động format ngày thành yyyy-mm-dd cho lưu trữ dữ liệu
   * Hỗ trợ các định dạng: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy, ddmmyyyy
   * Trả về yyyy-mm-dd khi đầy đủ thông tin, ngược lại trả về dạng hiển thị
   */
  const formatDateInput = (input: string): string => {
    // Nếu đã đúng format yyyy-mm-dd thì giữ nguyên
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }
    
    // Xóa tất cả ký tự không phải số
    const numbersOnly = input.replace(/\D/g, '');
    
    // Nếu không có số nào thì trả về rỗng
    if (!numbersOnly) return '';
    
    const length = numbersOnly.length;
    
    if (length <= 2) {
      // Chỉ có ngày: 01, 15 -> hiển thị 01, 15
      return numbersOnly;
    } else if (length <= 4) {
      // Ngày + tháng: 0115, 1503 -> hiển thị 01/15, 15/03
      const day = numbersOnly.slice(0, 2);
      const month = numbersOnly.slice(2, 4);
      return `${day}/${month}`;
    } else if (length <= 6) {
      // Ngày + tháng + một phần năm: 011524 -> hiển thị 01/15/24
      const day = numbersOnly.slice(0, 2);
      const month = numbersOnly.slice(2, 4);
      const year = numbersOnly.slice(4, 6);
      return `${day}/${month}/${year}`;
    } else if (length === 7) {
      // 7 số - có thể là ddmmyyy -> hiển thị dd/mm/yyy
      const day = numbersOnly.slice(0, 2);
      const month = numbersOnly.slice(2, 4);
      const year = numbersOnly.slice(4, 7);
      return `${day}/${month}/${year}`;
    } else if (length >= 8) {
      // Đầy đủ 8 số trở lên: ddmmyyyy
      const day = numbersOnly.slice(0, 2);
      const month = numbersOnly.slice(2, 4);
      const year = numbersOnly.slice(4, 8);
      
      // Validate ngày
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Validate date ranges
      if (dayNum >= 1 && dayNum <= 31 && 
          monthNum >= 1 && monthNum <= 12 && 
          yearNum >= 1900 && yearNum <= 2100) {
        // QUAN TRỌNG: Trả về yyyy-mm-dd cho lưu trữ dữ liệu
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Nếu không hợp lệ, hiển thị dạng dd/mm/yyyy
      return `${day}/${month}/${year}`;
    }
    
    return input;
  };

  /**
   * Chuyển đổi từ yyyy-mm-dd sang dd/MM/yyyy để hiển thị
   */
  const getDisplayValue = (): string => {
    if (!value) return '';
    
    // Nếu đã ở dạng yyyy-mm-dd, convert sang dd/MM/yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Nếu không phải yyyy-mm-dd, có thể đang trong quá trình nhập
    return value;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.asterisk}>*</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <View style={[styles.inputRow, error && styles.inputError]}>
          <TextInput
            style={styles.inputText}
            value={getDisplayValue()}
            onChangeText={handleTextInput}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={showDatePicker}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="calendarButton"
          >
            <Text style={styles.icon}>📅</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Beautiful Calendar Modal */}
      <Calendar
        visible={showCalendar}
        onClose={onCalendarClose}
        onDateSelect={onDateSelect}
        selectedDate={value}
        minDate={minDate}
        maxDate={maxDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  asterisk: {
    color: '#EF4444',
    marginLeft: 4,
  },
  inputContainer: {
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 50,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputText: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#374151',
    height: '100%',
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  icon: {
    fontSize: 20,
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: '#EF4444',
  },
});

export default SimpleDateSelector;