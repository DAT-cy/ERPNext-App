import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  Alert
} from 'react-native';

interface SimpleDatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  error,
  required = false,
}) => {
  const showDateAlert = () => {
    Alert.alert(
      'Chọn ngày',
      'Vui lòng nhập ngày theo định dạng DD/MM/YYYY',
      [
        {
          text: 'Hôm nay',
          onPress: () => {
            const today = new Date();
            const formatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
            onChange(formatToYYYYMMDD(formatted));
          }
        },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const formatToYYYYMMDD = (dateStr: string): string => {
    try {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatFromYYYYMMDD = (dateStr: string): string => {
    try {
      if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleTextInput = (text: string) => {
    const formatted = formatToYYYYMMDD(text);
    onChange(formatted);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.asterisk}>*</Text>}
      </View>
      
      <View style={[styles.inputRow, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={formatFromYYYYMMDD(value)}
          onChangeText={handleTextInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.iconButton} onPress={showDateAlert}>
          <Text style={styles.icon}>📅</Text>
        </TouchableOpacity>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
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

export default SimpleDatePicker;