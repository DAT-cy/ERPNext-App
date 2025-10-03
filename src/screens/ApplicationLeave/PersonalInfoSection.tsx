import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormSection } from '../../components';
import { InformationUser } from '../../types';

interface PersonalInfoSectionProps {
  userInfo?: InformationUser;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userInfo }) => {
  return (
    <FormSection title="👤 Thông tin cơ bản">
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã số:</Text>
          <Text style={styles.infoValue}>HR-LAP-.YYYY.</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nhân viên:</Text>
          {/* Dưới đây là phần thay đổi */}
          <View style={styles.infoValueContainer}>
            <Text style={styles.infoValue}>{userInfo?.employee_name || 'N/A'}</Text>
            <Text style={styles.infoValue}>{userInfo?.name || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Công ty:</Text>
          <Text style={styles.infoValue}>{userInfo?.company || 'N/A'}</Text>
        </View>
      </View>
    </FormSection>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  infoValueContainer: {
    flexDirection: 'column',  
    alignItems: 'flex-end',   
  },
});

export default PersonalInfoSection;
