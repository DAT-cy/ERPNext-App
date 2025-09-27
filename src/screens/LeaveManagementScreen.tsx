import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ss, fs } from '../utils/responsive';

interface LeaveFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  backgroundColor: string;
}

interface RouteParams {
  selectedDate?: string;
  initialTab?: 'pending' | 'approved' | 'rejected';
}

const LeaveManagementScreen = ({ route }: { route?: { params?: RouteParams } }) => {
  const navigation = useNavigation();
  const [notification, setNotification] = useState<string | null>(null);
  
  // Lấy tham số từ navigation
  const { params } = route || {};
  const selectedDate = params?.selectedDate;
  const initialTab = params?.initialTab || 'pending';
  
  // Sử dụng tham số để thiết lập trạng thái ban đầu
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Log tham số nhận được (chỉ để debug)
  React.useEffect(() => {
    console.log('LeaveManagement Screen Params:', { selectedDate, initialTab });
  }, [selectedDate, initialTab]);

  // Mock data cho thống kê nhanh
  const quickStats = [
    { number: 12, label: 'Ngày còn lại' },
    { number: 3, label: 'Đơn chờ duyệt' }
  ];

  // Danh sách các tính năng nghỉ phép
  const features: LeaveFeature[] = [
    {
      id: 'apply',
      title: 'Đơn Xin Nghỉ Phép',
      description: 'Tạo đơn xin nghỉ phép mới và theo dõi trạng thái',
      icon: '📝',
      backgroundColor: '#10b981'
    },
    {
      id: 'compensatory',
      title: 'Yêu Cầu Nghỉ Phép Bù',
      description: 'Đăng ký nghỉ bù cho những ngày làm thêm',
      icon: '⏱',
      backgroundColor: '#f59e0b'
    },
    {
      id: 'allocation',
      title: 'Nghỉ Phép Hưởng Lương',
      description: 'Xem chi tiết ngày phép được hưởng lương',
      icon: '💼',
      backgroundColor: '#3b82f6'
    },
    {
      id: 'settings',
      title: 'Loại Nghỉ Phép',
      description: 'Cấu hình và quản lý các loại nghỉ phép',
      icon: '⚙️',
      backgroundColor: '#8b5cf6'
    },
    {
      id: 'balance',
      title: 'Số Dư Ngày Phép',
      description: 'Báo cáo chi tiết số dư ngày phép cá nhân',
      icon: '📊',
      backgroundColor: '#ef4444'
    },
    {
      id: 'summary',
      title: 'Tóm Tắt Số Dư Nhân Viên',
      description: 'Báo cáo tổng hợp cho quản lý nhân sự',
      icon: '📈',
      backgroundColor: '#06b6d4'
    }
  ];

  // Xử lý hiển thị thông báo
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Xử lý điều hướng quay lại
  const handleGoBack = () => {
    showNotification('Quay lại menu chính');
    navigation.goBack();
  };

  // Xử lý tạo đơn nghỉ phép mới
  const handleCreateNewLeave = () => {
    showNotification('Mở form tạo đơn nghỉ phép mới');
    // TODO: Thêm logic điều hướng đến màn hình tạo đơn nghỉ phép
  };

  // Xử lý điều hướng đến tính năng
  const handleNavigateToFeature = (feature: LeaveFeature) => {
    showNotification(`Đang mở ${feature.title}...`);
    // TODO: Thêm logic điều hướng đến màn hình tương ứng
  };

  // Render card tính năng
  const renderFeatureCard = (feature: LeaveFeature) => (
    <TouchableOpacity 
      key={feature.id}
      style={styles.featureCard}
      onPress={() => handleNavigateToFeature(feature)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={[styles.cardIcon, { backgroundColor: feature.backgroundColor }]}>
          <Text style={styles.iconText}>{feature.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{feature.title}</Text>
          <Text style={styles.cardDescription}>{feature.description}</Text>
        </View>
        <Text style={styles.cardArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={handleCreateNewLeave}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleIcon}>🌴</Text>
          <Text style={styles.headerTitleText}>Nghỉ Phép</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: ss(80) }}
      >
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Text style={styles.statsTitle}>Tổng quan nhanh</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Feature Cards */}
        {features.map(feature => renderFeatureCard(feature))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.floatingAction}
        onPress={handleCreateNewLeave}
        activeOpacity={0.9}
      >
        <View style={styles.fabGradient}>
          <Text style={styles.fabText}>+</Text>
        </View>
      </TouchableOpacity>

      {/* Notification */}
      {notification && (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? ss(10) : ss(50),
    paddingBottom: ss(20),
    paddingHorizontal: ss(20),
    backgroundColor: '#4f46e5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ss(10),
  },
  backBtn: {
    width: ss(44),
    height: ss(44),
    borderRadius: ss(22),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: ss(44),
    height: ss(44),
    borderRadius: ss(22),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: fs(20),
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ss(10),
  },
  headerTitleIcon: {
    fontSize: fs(24),
  },
  headerTitleText: {
    fontSize: fs(24),
    fontWeight: '700',
    color: 'white',
  },
  mainContent: {
    flex: 1,
    padding: ss(20),
  },
  quickStats: {
    backgroundColor: 'white',
    borderRadius: ss(16),
    padding: ss(20),
    marginBottom: ss(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: ss(2),
    },
    shadowOpacity: 0.08,
    shadowRadius: ss(12),
    elevation: 2,
  },
  statsTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: ss(16),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: ss(12),
    backgroundColor: '#f8fafc',
    borderRadius: ss(12),
    marginHorizontal: ss(8),
  },
  statNumber: {
    fontSize: fs(24),
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: ss(4),
  },
  statLabel: {
    fontSize: fs(12),
    color: '#6b7280',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: ss(16),
    padding: ss(20),
    marginBottom: ss(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: ss(2),
    },
    shadowOpacity: 0.08,
    shadowRadius: ss(12),
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: ss(48),
    height: ss(48),
    borderRadius: ss(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: fs(24),
    color: 'white',
  },
  cardInfo: {
    flex: 1,
    marginLeft: ss(16),
  },
  cardTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: ss(4),
  },
  cardDescription: {
    fontSize: fs(13),
    color: '#6b7280',
    lineHeight: ss(18),
  },
  cardArrow: {
    color: '#9ca3af',
    fontSize: fs(18),
    marginLeft: ss(8),
  },
  floatingAction: {
    position: 'absolute',
    bottom: ss(30),
    right: ss(30),
    width: ss(56),
    height: ss(56),
    borderRadius: ss(28),
    shadowColor: '#4f46e5',
    shadowOffset: {
      width: 0,
      height: ss(8),
    },
    shadowOpacity: 0.3,
    shadowRadius: ss(25),
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: ss(28),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },
  fabText: {
    color: 'white',
    fontSize: fs(24),
  },
  notification: {
    position: 'absolute',
    top: ss(Platform.OS === 'ios' ? 50 : 20),
    alignSelf: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: ss(24),
    paddingVertical: ss(12),
    borderRadius: ss(25),
    shadowColor: 'rgba(16, 185, 129, 0.3)',
    shadowOffset: {
      width: 0,
      height: ss(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: ss(12),
    elevation: 6,
  },
  notificationText: {
    color: 'white',
    fontSize: fs(14),
    fontWeight: '500',
  },
});

export default LeaveManagementScreen;