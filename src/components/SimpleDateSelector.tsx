import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SimpleDateSelectorProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const SimpleDateSelector: React.FC<SimpleDateSelectorProps> = ({
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
    setShowPicker(false);

    if (event.type === 'set' && selectedDate) {
      const formattedDate = formatDate(selectedDate);
      onChange(formattedDate);
    }
  };

  const showDatePicker = () => {
    console.log('Show date picker clicked');
    setShowPicker(true);
  };

  const handleTextInput = (text: string) => {
    console.log('Input text:', text);
    
    // Auto format khi người dùng nhập
    if (text.length === 8 && !text.includes('-') && !text.includes('/')) {
      // Format YYYYMMDD -> YYYY-MM-DD
      const year = text.substring(0, 4);
      const month = text.substring(4, 6);
      const day = text.substring(6, 8);
      const formatted = `${year}-${month}-${day}`;
      console.log('Formatted YYYYMMDD:', formatted);
      onChange(formatted);
    } else if (text.includes('/')) {
      // Convert DD/MM/YYYY -> YYYY-MM-DD
      const parts = text.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (day && month && year && year.length === 4) {
          const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          console.log('Formatted DD/MM/YYYY:', formatted);
          onChange(formatted);
          return;
        }
      }
      // Nếu chưa đầy đủ thông tin, giữ nguyên text
      onChange(text);
    } else {
      // Cho phép nhập trực tiếp YYYY-MM-DD hoặc text bất kỳ
      onChange(text);
    }
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
            value={value}
            onChangeText={handleTextInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={showDatePicker}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>📅</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* DateTimePicker - chỉ hiện khi cần */}
      {showPicker && (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'default' : 'calendar'}
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