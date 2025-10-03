import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  loading?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, onSubmit, loading = false }) => {
  return (
    <View style={styles.formActions}>
      <TouchableOpacity 
        style={[styles.btnSecondary, loading && styles.btnDisabled]} 
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={[styles.btnSecondaryText, loading && styles.btnDisabledText]}>
          ❌ Hủy
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.btnPrimary, loading && styles.btnDisabled]} 
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={[styles.btnPrimaryText, loading && styles.btnDisabledText]}>
          {loading ? '⏳ Đang gửi...' : '📤 Gửi đơn'}
        </Text>
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
  btnDisabled: {
    backgroundColor: '#e5e7eb',
    opacity: 0.6,
  },
  btnDisabledText: {
    color: '#9ca3af',
  },
});

export default FormActions;