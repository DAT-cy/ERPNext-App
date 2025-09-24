import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  Platform,
  InteractionManager,
} from 'react-native';

import { logout } from '../../../features/auth/services/authService';

const { width } = Dimensions.get('window');

export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  hasSubItems?: boolean;
  subItems?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  title: string;
  icon: string;
}

export interface SidebarMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onMenuItemPress: (itemId: string) => void;
  onSubItemPress: (itemId: string, subItemId: string) => void;
  onLogout: () => void;
}

export async function handleLogout() {
  await logout();
}

export default function SidebarMenu({
  isVisible,
  onClose,
  onMenuItemPress,
  onSubItemPress,
  onLogout,
}: SidebarMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const slideAnim = useRef(new Animated.Value(-width * 0.85)).current; // bắt đầu từ bên trái
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const subItemAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Khởi tạo animations cho tất cả items
  useEffect(() => {
    const menuItems: MenuItem[] = [
      {
        id: 'hr',
        title: 'Nhân sự',
        icon: '💼',
        hasSubItems: true,
        subItems: [
          { id: 'overview', title: 'Tổng quan', icon: '📊' },
          { id: 'recruitment', title: 'Tuyển dụng', icon: '👥' },
          { id: 'work-history', title: 'Lý lịch công tác', icon: '👤' },
          { id: 'performance', title: 'Hiệu suất', icon: '⭐' },
          { id: 'attendance', title: 'Điểm danh & ca làm việc', icon: '📋' },
        ],
      },
    ];
    
    menuItems.forEach(item => {
      if (item.hasSubItems && !subItemAnimations[item.id]) {
        subItemAnimations[item.id] = new Animated.Value(0);
      }
    });

    // Cleanup function
    return () => {
      // Stop tất cả animations khi component unmount
      slideAnim.stopAnimation();
      backdropOpacity.stopAnimation();
      scaleAnim.stopAnimation();
      Object.values(subItemAnimations).forEach(anim => anim.stopAnimation());
    };
  }, [slideAnim, backdropOpacity, scaleAnim, subItemAnimations]);

  // Reset sub-items khi sidebar đóng
  useEffect(() => {
    if (!isVisible) {
      // Đóng tất cả sub-items khi sidebar đóng
      setExpandedItems(new Set());
      // Reset tất cả sub-item animations
      Object.values(subItemAnimations).forEach(anim => {
        anim.setValue(0);
      });
    }
  }, [isVisible, subItemAnimations]);

  useEffect(() => {
    if (isVisible) {
      // Reset values trước khi bắt đầu animation
      slideAnim.setValue(-width * 0.85);
      backdropOpacity.setValue(0);
      scaleAnim.setValue(0.8);

      // Dùng InteractionManager để đảm bảo animation mượt mà
      InteractionManager.runAfterInteractions(() => {
        // Show animations
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 9,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 9,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Hide animations với callback để reset về giá trị ban đầu
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -width * 0.85,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start((finished) => {
        // Chỉ reset nếu animation hoàn thành và sidebar vẫn đóng
        if (finished && !isVisible) {
          InteractionManager.runAfterInteractions(() => {
            slideAnim.setValue(-width * 0.85);
            backdropOpacity.setValue(0);
            scaleAnim.setValue(0.8);
          });
        }
      });
    }
  }, [isVisible, slideAnim, backdropOpacity, scaleAnim]);

  const menuItems: MenuItem[] = [
    {
      id: 'hr',
      title: 'Nhân sự',
      icon: '💼',
      hasSubItems: true,
      subItems: [
        { id: 'overview', title: 'Tổng quan', icon: '📊' },
        { id: 'recruitment', title: 'Tuyển dụng', icon: '👥' },
        { id: 'work-history', title: 'Lý lịch công tác', icon: '👤' },
        { id: 'performance', title: 'Hiệu suất', icon: '⭐' },
        { id: 'attendance', title: 'Điểm danh & ca làm việc', icon: '📋' },
      ],
    },
  ];

  const toggleExpanded = (itemId: string) => {
    if (!subItemAnimations[itemId]) {
      subItemAnimations[itemId] = new Animated.Value(0);
    }

    const newExpanded = new Set(expandedItems);
    const isExpanding = !newExpanded.has(itemId);
    
    if (isExpanding) {
      newExpanded.add(itemId);
      setExpandedItems(newExpanded);
      
      // Reset value trước khi animate
      subItemAnimations[itemId].setValue(0);
      
      Animated.spring(subItemAnimations[itemId], {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(subItemAnimations[itemId], {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => {
        newExpanded.delete(itemId);
        setExpandedItems(newExpanded);
        // Reset về 0 sau khi đóng
        subItemAnimations[itemId].setValue(0);
      });
    }
  };

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.hasSubItems) {
      toggleExpanded(item.id);
    } else {
      onMenuItemPress(item.id);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* Sidebar có hiệu ứng trượt và scale */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >

      {/* Content của sidebar */}
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeIconContainer}>
                <Text style={styles.closeIcon}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/60x60/007AFF/FFFFFF?text=SR' }}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sophia Rose</Text>
            <Text style={styles.profileTitle}>UX/UI Designer</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <View key={item.id}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  expandedItems.has(item.id) && styles.menuItemExpanded,
                ]}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                {item.hasSubItems && (
                  <Text style={styles.expandIcon}>
                    {expandedItems.has(item.id) ? '▲' : '▼'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Sub Items với animation */}
              {item.hasSubItems && (
                <Animated.View
                  style={[
                    styles.subItemsContainer,
                    {
                      maxHeight: subItemAnimations[item.id]
                        ? subItemAnimations[item.id].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, item.subItems!.length * 50],
                          })
                        : 0,
                      opacity: subItemAnimations[item.id] || 0,
                    },
                  ]}
                >
                  {expandedItems.has(item.id) && item.subItems?.map((subItem, index) => (
                    <Animated.View
                      key={subItem.id}
                      style={{
                        transform: [
                          {
                            translateX: subItemAnimations[item.id]
                              ? subItemAnimations[item.id].interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-20, 0],
                                })
                              : -20,
                          },
                        ],
                        opacity: subItemAnimations[item.id] || 0,
                      }}
                    >
                      <TouchableOpacity
                        style={styles.subMenuItem}
                        onPress={() => onSubItemPress(item.id, subItem.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.subMenuItemContent}>
                          <Text style={styles.subMenuItemIcon}>{subItem.icon}</Text>
                          <Text style={styles.subMenuItemText}>{subItem.title}</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </Animated.View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.separator} />

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.bottomMenuItem}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomMenuItemIcon}>⚙️</Text>
            <Text style={styles.bottomMenuItemText}>Cài đặt</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.bottomMenuItem, styles.logoutButton]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomMenuItemIcon}>🚪</Text>
            <Text style={[styles.bottomMenuItemText, styles.logoutText]}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Animated backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sidebar: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 0,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  closeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 10,
    borderRadius: 15,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 14,
    color: '#666666',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemExpanded: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 22,
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  expandIcon: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  subItemsContainer: {
    marginLeft: 20,
    marginBottom: 10,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderLeftColor: '#E3F2FD',
    overflow: 'hidden',
  },
  subMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  subMenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subMenuItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  subMenuItemText: {
    fontSize: 15,
    color: '#555555',
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingHorizontal: 20,
  },
  bottomMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  bottomMenuItemIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  bottomMenuItemText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  logoutText: {
    color: '#F44336',
    fontWeight: '600',
  },
});
