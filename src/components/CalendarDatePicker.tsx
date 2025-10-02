import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  Platform,
  Modal,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CalendarDatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  error,
  required = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    
    try {
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date();
    } catch {
      return new Date();
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      const formattedDate = formatDate(selectedDate);
      onChange(formattedDate);
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  const showCalendar = () => {
    if (Platform.OS === 'android') {
      setShowPicker(true);
    } else {
      // iOS: Sử dụng Alert với input đơn giản hơn để tránh crash
      Alert.prompt(
        'Chọn ngày',
        'Nhập ngày theo định dạng DD/MM/YYYY',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'OK', 
            onPress: (inputValue?: string) => {
              if (inputValue && inputValue.includes('/')) {
                const parts = inputValue.split('/');
                if (parts.length === 3) {
                  const [day, month, year] = parts;
                  if (day && month && year && year.length === 4) {
                    const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    onChange(formatted);
                  }
                }
              }
            }
          }
        ],
        'plain-text',
        formatDisplayDate(value)
      );
    }
  };

  const handleTextInput = (text: string) => {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    if (text.includes('/')) {
      const parts = text.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (day && month && year && year.length === 4) {
          const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          onChange(formatted);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.asterisk}>*</Text>}
      </View>
      
      <TouchableOpacity 
        style={[styles.inputRow, error && styles.inputError]} 
        onPress={showCalendar}
        activeOpacity={0.7}
      >
        <TextInput
          style={styles.input}
          value={formatDisplayDate(value)}
          onChangeText={handleTextInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={false}
          pointerEvents="none"
        />
        <View style={styles.iconButton}>
          <Text style={styles.icon}>📅</Text>
        </View>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Calendar Picker - Chỉ cho Android */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display="calendar"
          onChange={onDateChange}
        />
      )}
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
  input: {
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

export default CalendarDatePicker;