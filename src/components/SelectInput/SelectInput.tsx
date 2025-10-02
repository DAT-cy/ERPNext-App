import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Modal, 
  View, 
  ScrollView 
} from 'react-native';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  title?: string;
  disabled?: boolean;
  loadingText?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  hasError = false,
  title = 'Chọn một tùy chọn',
  disabled = false,
  loadingText = 'Đang tải...',
}) => {
  const [showModal, setShowModal] = useState(false);

  const getSelectedLabel = () => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : '';
  };

  const handleSelect = (value: string) => {
    onChange(value);
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selectInput, 
          hasError && styles.errorBorder,
          disabled && styles.disabledInput
        ]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.selectText,
          !value && styles.placeholderText,
          disabled && styles.disabledText
        ]}>
          {disabled 
            ? loadingText 
            : options.length > 0
              ? getSelectedLabel() || placeholder
              : 'Không có tùy chọn nào'
          }
        </Text>
        <Text style={styles.selectArrow}>▼</Text>
      </TouchableOpacity>
      
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options && options.length > 0 ? (
                options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      value === option.value && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        value === option.value && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.modalOption}>
                  <Text style={styles.modalOptionText}>Không có tùy chọn nào</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  disabledText: {
    color: '#94a3b8',
  },
  selectText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  selectArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseBtnText: {
    fontSize: 18,
    color: '#6b7280',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default SelectInput;