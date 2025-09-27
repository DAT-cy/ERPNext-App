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
import { ss, fs } from '../utils/responsive';
import { useScreenTabBar } from "../hooks";
import { BottomTabBar, NavigationSidebarMenu, TopTabBar } from '../components';
import { MENU_DEFINITIONS, SubMenuItemDef } from '../utils/menuPermissions';

interface LeaveFeature extends SubMenuItemDef {
  description: string;
  backgroundColor: string;
}

interface RouteParams {
  selectedDate?: string;
  initialTab?: 'pending' | 'approved' | 'rejected';
}

const LeaveManagementScreen = ({ route }: { route?: { params?: RouteParams } }) => {
  const [notification, setNotification] = useState<string | null>(null);
  const tabBar = useScreenTabBar('leave_hr');

  // Lấy tham số từ navigation
  const { params } = route || {};
  const selectedDate = params?.selectedDate;
  const initialTab = params?.initialTab || 'pending';
  

  // Log tham số nhận được (chỉ để debug)
  React.useEffect(() => {
    console.log('LeaveManagement Screen Params:', { selectedDate, initialTab });
  }, [selectedDate, initialTab]);


  // Get leave management features from menuPermissions - từ submenu của leaves-hr
  const hrMenu = MENU_DEFINITIONS.find(menu => menu.id === 'hr');
  const leavesHrSubmenu = hrMenu?.subItems?.find(subItem => subItem.id === 'leaves-hr');
  const features: LeaveFeature[] = (leavesHrSubmenu?.subItems || []).map(item => ({
    ...item,
    description: item.description || '',
    backgroundColor: item.backgroundColor || '#6b7280'
  }));

  // Debug log để kiểm tra dữ liệu được load
  React.useEffect(() => {
    console.log('🍃 Leave Features loaded:', features.length);
    features.forEach(feature => {
      console.log(`  - ${feature.title} (${feature.backgroundColor})`);
    });
  }, []);

  // Xử lý hiển thị thông báo
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
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
    <TopTabBar
            {...tabBar.topTabBarProps}
          />

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: ss(80) }}
      >
         {/* Feature Cards */}
        {features.map(feature => renderFeatureCard(feature))}
      </ScrollView>

    {/* Bottom Tabs */}
          <BottomTabBar
            {...tabBar.bottomTabBarProps}
          />

          <NavigationSidebarMenu
                  {...tabBar.sidebarProps}
                />
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