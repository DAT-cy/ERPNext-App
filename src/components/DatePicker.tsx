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

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  error,
  required = false,
}) => {
  const [show, setShow] = useState(false);

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    
    try {
      // Try parsing YYYY-MM-DD format
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        if (year && month && day) {
          return new Date(year, month - 1, day);
        }
      }
      return new Date();
    } catch {
      return new Date();
    }
  };

  const formatDate = (date: Date): string => {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShow(false);
    
    if (event.type === 'set' && selectedDate) {
      const formattedDate = formatDate(selectedDate);
      onChange(formattedDate);
    }
  };

  const showDatePicker = () => {
    try {
      setShow(true);
    } catch (error) {
      console.log('Error showing date picker:', error);
    }
  };

  const handleTextInput = (text: string) => {
    onChange(text);
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
          value={value}
          onChangeText={handleTextInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="default"
        />
        <TouchableOpacity style={styles.iconButton} onPress={showDatePicker}>
          <Text style={styles.icon}>📅</Text>
        </TouchableOpacity>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {show && (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display="default"
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

export default DatePicker;