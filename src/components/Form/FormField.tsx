import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  required = false, 
  children 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      {children}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  required: {
    color: '#EF4444',
    marginLeft: 4,
    fontSize: 16,
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
});

export default FormField;