import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, onSubmit, onSaveDraft }) => {
  return (
    <View style={styles.formActions}>
      <TouchableOpacity style={styles.btnSecondary} onPress={onCancel}>
        <Text style={styles.btnSecondaryText}>❌ Hủy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnPrimary} onPress={onSubmit}>
        <Text style={styles.btnPrimaryText}>📤 Gửi đơn</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  btnSecondary: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  btnPrimary: {
    flex: 1,
    padding: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default FormActions;