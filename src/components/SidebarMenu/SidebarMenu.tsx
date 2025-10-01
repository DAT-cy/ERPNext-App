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
  ScrollView,
  PanResponder,
} from 'react-native';

import { logoutERP as logout } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { getAccessibleMenus } from '../../utils/menuPermissions';
import { getInformationEmployee } from '../../services/checkinService';
import { InformationUser } from '../../types'; 

const { width } = Dimensions.get('window');

export interface MenuItem {
  id: string;
  title: string;
  icon: string | any; // Can be string (emoji) or require() result (local image)
  hasSubItems?: boolean;
  subItems?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  title: string;
  icon: string | any; // Can be string (emoji) or require() result (local image)
}

export interface SidebarMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onMenuItemPress: (itemId: string) => void;
  onSubItemPress: (itemId: string, subItemId: string) => void;
  onLogout: () => void;
}

// Helper function to render icon (either Image or Text) with better UI/UX
const renderIcon = (icon: string | any, style: any, isSubItem: boolean = false) => {
  if (typeof icon === 'string') {
    // It's an emoji or text
    return <Text style={style}>{icon}</Text>;
  } else {
    // It's a local image (require() result)
    const imageSize = isSubItem ? 20 : 24;
    return (
      <View style={[
        style, 
        { 
          width: imageSize, 
          height: imageSize,
          justifyContent: 'center',
          alignItems: 'center',
        }
      ]}>
        <Image 
          source={icon} 
          style={{ 
            width: imageSize, 
            height: imageSize,
            tintColor: isSubItem ? '#666666' : '#333333', // Consistent color theming
          }} 
          resizeMode="contain" 
        />
      </View>
    );
  }
};

export default function SidebarMenu({
  isVisible,
  onClose,
  onMenuItemPress,
  onSubItemPress,
  onLogout,
}: SidebarMenuProps) {
  const { roles } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const slideAnim = useRef(new Animated.Value(-width * 0.85)).current; // bắt đầu từ bên trái
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const subItemAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  const [userInfo, setUserInfo] = useState<InformationUser | null>(null);


  // PanResponder for swipe to close (từ phải sang trái)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Respond to horizontal swipes từ phải sang trái (dx < 0)
        // Giảm threshold để sensitive hơn
        return Math.abs(gestureState.dx) > 10 && gestureState.dx < 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Chỉ cho phép kéo sang trái (dx < 0)
        if (gestureState.dx < 0) {
          // Kéo sidebar theo gesture sang trái để đóng
          const newValue = Math.max(gestureState.dx, -width * 0.85);
          slideAnim.setValue(newValue);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        
        // Giảm threshold xuống 80px để dễ trigger hơn
        if (gestureState.dx < -80 || gestureState.vx < -0.3) {
          // Đóng sidebar
          onClose();
        } else {
          // Snap back về vị trí ban đầu
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 9,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Khởi tạo animations cho tất cả items
  useEffect(() => {
    const menuItems: MenuItem[] = [];
    
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

  // Lấy menu items dựa trên roles của user
  const menuItems: MenuItem[] = getAccessibleMenus(roles).map(menuDef => ({
    id: menuDef.id,
    title: menuDef.title,
    icon: menuDef.icon,
    hasSubItems: menuDef.hasSubItems,
    subItems: menuDef.subItems?.map(subItem => ({
      id: subItem.id,
      title: subItem.title,
      icon: subItem.icon
    }))
  }));

  // Debug: Log accessible menus chỉ khi roles thay đổi
  useEffect(() => {
    // Chỉ log một lần khi component mount hoặc khi roles thay đổi
    console.log(`🔐 User Roles: [${roles.join(', ')}]`);
    console.log(`📋 Accessible Menus: [${menuItems.map(m => m.title).join(', ')}]`);
  }, [roles.join(',')]); // Chỉ re-run khi roles thay đổi

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

  // Fetch employee information
  useEffect(() => {
    const fetchInfo = async () => {
      const info = await getInformationEmployee();
      console.log('👤 Fetched User Info:', info); // Debug log
      setUserInfo(info);
    };
    fetchInfo();
  }, []);

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
        {...panResponder.panHandlers}
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
            <Text style={styles.profileName}>{userInfo?.employee_name}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Menu Items */}
        <ScrollView 
          style={styles.menuSection}
          contentContainerStyle={styles.menuContentContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={false}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
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
                  {renderIcon(item.icon, styles.menuItemIcon, false)}
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                {item.hasSubItems && (
                  <Animated.View 
                    style={[
                      styles.expandIconContainer,
                      {
                        transform: [{ 
                          rotate: expandedItems.has(item.id) ? '180deg' : '0deg' 
                        }]
                      }
                    ]}
                  >
                    <Image 
                      source={require('../../assets/dropdown.png')} 
                      style={styles.expandIconImage}
                    />
                  </Animated.View>
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
                          {renderIcon(subItem.icon, styles.subMenuItemIcon, true)}
                          <Text style={styles.subMenuItemText}>{subItem.title}</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </Animated.View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.separator} />

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.bottomMenuItem}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomMenuItemIcon}>
              <Image source={require('../../assets/settings.png')} />
            </Text>
            <Text style={styles.bottomMenuItemText}>Cài đặt</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.bottomMenuItem, styles.logoutButton]} 
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomMenuItemIcon}>
              <Image source={require('../../assets/logout.png')} />
            </Text>
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
    marginBottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 0,
    borderRadius: 0,
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
    marginVertical: 0,
    marginHorizontal: 0,
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: 0,
  },
  menuContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0,
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemExpanded: {
    backgroundColor: '#F8F9FA',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 2, // Add some vertical padding for better touch area
  },
  menuItemIcon: {
    fontSize: 22,
    marginRight: 15,
    minWidth: 24, // Ensure consistent width
    textAlign: 'center', // Center text/emoji icons
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
  expandIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },
  expandIconImage: {
    width: 23,
    height:23 ,
    tintColor: '#000000',
  },
  subItemsContainer: {
    marginLeft: 0,
    marginBottom: 0,
    paddingLeft: 0,
    borderLeftWidth: 0,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  subMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 0,
    borderRadius: 0,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  subMenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2, // Add some vertical padding for better touch area
  },
  subMenuItemIcon: {
    fontSize: 18,
    marginRight: 12,
    minWidth: 20, // Ensure consistent width
    textAlign: 'center', // Center text/emoji icons
  },
  subMenuItemText: {
    fontSize: 15,
    color: '#555555',
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingHorizontal: 0,
    paddingBottom: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0,
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#333333',
    fontWeight: '500',
  },
});
