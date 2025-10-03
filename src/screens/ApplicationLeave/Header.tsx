import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

interface HeaderProps {
  onBack: () => void;
  onSaveDraft: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack, onSaveDraft }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerNav}>
        <TouchableOpacity style={styles.navBtn} onPress={onBack}>
          <Text style={styles.navBtnText}>← Quay lại</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerTitle}>
        <Text style={styles.headerTitleText}>📝 Đơn Xin Nghỉ Phép</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
});

export default Header;