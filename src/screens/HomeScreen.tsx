// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { 
  SafeAreaView, StatusBar, View, Text, Image,
  ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Alert, Animated
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabBar, TopTabBar, SidebarMenu, BottomTabItem, TopTabItem } from "../components";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from "../hooks";
import { useCheckin } from "../hooks/useCheckin";
import { fetchCheckinRecords } from "../services/checkinService";
import { CheckinRecord, Checkin } from "../types/checkin.types";
import { homeScreenStyles } from '../styles/HomeScreen.styles';
import SimpleSuccessAnimation from '../components/SuccessAnimation/SimpleSuccessAnimation';

// Helper functions for formatting date and time
const formatTime = (dateTimeStr: string): string => {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

const formatDate = (dateTimeStr: string): string => {
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Lấy ngày hiện tại dạng chuỗi
const getTodayDateString = (): string => {
  return formatDate(new Date().toISOString());
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, isLoggedIn, roles } = useAuth();
  const { handleSubmitCheckin, loadCheckinData: reloadCheckinData, loading: checkinLoading } = useCheckin();
  const hasLoggedRef = useRef(false);

  // State
  const [activeBottomTab, setActiveBottomTab] = useState("checkin");
  const [activeTopTab, setActiveTopTab] = useState("today");
  const [activeContentTab, setActiveContentTab] = useState("today"); // Tab cho nội dung: "today" hoặc "week"
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [displayRecords, setDisplayRecords] = useState<CheckinRecord[]>([]);
  const [checkinStatus, setCheckinStatus] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: 10.7769, // Default: TP.HCM
    longitude: 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  });
  const [checkinType, setCheckinType] = useState<'IN' | 'OUT'>('IN');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  
  // Success Animation State
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Location State
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasValidLocation, setHasValidLocation] = useState(false);
  const [locationRetryCount, setLocationRetryCount] = useState(0);

  // Tabs
  const bottomTabs: BottomTabItem[] = [
    { 
      key: "checkin",
      title: "Trang chủ", 
      icon: require('../assets/home.png')
    },
    {
      key: "profile",
      title: "Hồ sơ",
      icon: require('../assets/profile.png')
    },
  ];

  const topTabs: TopTabItem[] = [];

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [isLoggedIn, navigation]);

  // Load dữ liệu checkin - sử dụng useCallback với dependencies rỗng
  const loadCheckinData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCheckinRecords();
      
      // Chỉ log dữ liệu lần đầu tiên tải
      if (!hasLoggedRef.current) {
        console.log("Checkin data:", data);
        hasLoggedRef.current = true;
      }
      
      setRecords(data);
      setError(null);
      
      // Kiểm tra trạng thái check-in
      if (data.length > 0) {
        const isCheckedIn = data[0].log_type === 'IN';
        setCheckinStatus(isCheckedIn);
        // Cập nhật checkinType dựa vào trạng thái hiện tại
        setCheckinType(isCheckedIn ? 'OUT' : 'IN');
      }
    } catch (err) {
      setError("Không thể tải dữ liệu chấm công");
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra GPS service có bật không
  const checkLocationServices = useCallback(async () => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        setLocationError("GPS chưa được bật. Vui lòng bật GPS trong cài đặt.");
        setHasValidLocation(false);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Không thể kiểm tra location services:', error);
      return true; // Assume enabled if can't check
    }
  }, []);

  // Tối ưu hóa lấy vị trí với timeout
  const getCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    
    try {
      console.log('📍 Lấy vị trí hiện tại...');
      
      // Kiểm tra GPS service trước
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        setLocationLoading(false);
        return;
      }
      
      // Yêu cầu quyền truy cập vị trí
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Quyền vị trí bị từ chối');
        const errorMsg = "Cần cấp quyền truy cập vị trí để chấm công";
        setLocationError(errorMsg);
        setHasValidLocation(false);
        setLocationLoading(false);
        return;
      }
      
      // Thử nhiều accuracy level với timeout khác nhau
      let location: Location.LocationObject | null = null;
      
      // Strategy 1: High accuracy với timeout 8s
      try {
        console.log('📍 Thử High accuracy...');
        location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('High accuracy timeout')), 8000)
          )
        ]);
      } catch (highAccuracyError) {
        console.log('⚠️ High accuracy failed, trying Balanced...');
        
        // Strategy 2: Balanced accuracy với timeout 6s
        try {
          location = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Balanced accuracy timeout')), 6000)
            )
          ]);
        } catch (balancedError) {
          console.log('⚠️ Balanced accuracy failed, trying Low...');
          
          // Strategy 3: Low accuracy với timeout 4s (last resort)
          location = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Low,
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Low accuracy timeout')), 4000)
            )
          ]);
        }
      }
      
      // Kiểm tra location có valid không
      if (!location || !location.coords) {
        throw new Error('Không thể lấy được tọa độ GPS');
      }
      
      // Cập nhật vị trí người dùng
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      });
      
      setHasValidLocation(true);
      setLocationError(null);
      console.log('✅ Đã lấy được vị trí:', {
        lat: location.coords.latitude.toFixed(6),
        lng: location.coords.longitude.toFixed(6),
        accuracy: location.coords.accuracy
      });
      
    } catch (error: any) {
      console.error('❌ Lỗi lấy vị trí:', error.message);
      
      let errorMsg = "Không thể lấy vị trí";
      
      if (error.message.includes('timeout')) {
        errorMsg = "GPS timeout - Hãy ra ngoài trời hoặc gần cửa sổ";
      } else if (error.message.includes('permission')) {
        errorMsg = "Cần cấp quyền truy cập vị trí";
      } else if (error.message.includes('disabled')) {
        errorMsg = "Vui lòng bật GPS trong cài đặt";
      } else if (error.message.includes('network')) {
        errorMsg = "Lỗi mạng - Kiểm tra kết nối internet";
      } else {
        errorMsg = `GPS error: ${error.message}`;
      }
      
      setLocationError(errorMsg);
      setHasValidLocation(false);
    } finally {
      setLocationLoading(false);
    }
  }, [checkLocationServices]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Tối ưu hóa initial loading
  useEffect(() => {
    if (!hasLoggedRef.current) {
      // Load dữ liệu và vị trí song song
      Promise.all([
        loadCheckinData(),
        getCurrentLocation()
      ]).catch(error => {
        console.error('Lỗi khi khởi tạo:', error);
      });
    }
  }, [loadCheckinData, getCurrentLocation]); 

  // Auto refresh vị trí mỗi 30 giây
  useEffect(() => {
    const locationInterval = setInterval(() => {
      if (!hasValidLocation) {
        console.log('🔄 Auto refreshing location...');
        getCurrentLocation();
      }
    }, 30000); // 30 giây

    return () => clearInterval(locationInterval);
  }, [hasValidLocation, getCurrentLocation]);

  // Tối ưu hóa việc lọc records theo content tab
  const filteredRecords = useMemo(() => {
    if (activeContentTab === "today") {
      const today = new Date().toISOString().split('T')[0];
      return records.filter(record => record.time.startsWith(today));
    } else {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      
      return records.filter(record => {
        const recordDate = new Date(record.time);
        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      });
    }
  }, [activeContentTab, records]);
  
  // Cập nhật displayRecords khi filteredRecords thay đổi
  useEffect(() => {
    setDisplayRecords(filteredRecords);
  }, [filteredRecords]);
  
  // Các hàm xử lý events (memoized để tối ưu)
  const handleMenuPress = useCallback(() => {
    setIsSidebarVisible(true);
  }, []);
  
  const handleMenuClose = useCallback(() => {
    setIsSidebarVisible(false);
  }, []);
  
  const handleMenuItemPress = useCallback((id: string) => {
    // Xử lý menu item press (không log)
    setIsSidebarVisible(false);
  }, []);
  
  const handleSubItemPress = useCallback((id: string, subId: string) => {
    // Xử lý sub item press (không log)
    setIsSidebarVisible(false);
  }, []);
  
  const handleLogout = useCallback(async () => {
    await logout();
    // useEffect sẽ tự động điều hướng khi isLoggedIn = false
  }, [logout]);
  
  const handleTabChange = useCallback((tabKey: string) => {
    setActiveTopTab(tabKey);
  }, []);

  // 🚀 Tối ưu hóa hàm chấm công với auto-reload hoàn chỉnh
  const handleCheckin = useCallback(async (type: 'IN' | 'OUT') => {
    // Kiểm tra vị trí trước khi chấm công
    if (!hasValidLocation) {
      const buttons = [
        { text: "Thử lại GPS", onPress: () => {
          setLocationRetryCount(prev => prev + 1);
          getCurrentLocation();
        }},
        { text: "Hủy", style: "cancel" as const }
      ];

      // Nếu đã thử nhiều lần, cho phép dùng vị trí mặc định
      if (locationRetryCount >= 2) {
        buttons.unshift({
          text: "Dùng vị trí mặc định",
          onPress: () => {
            Alert.alert(
              "Xác nhận",
              "Bạn có chắc muốn chấm công với vị trí mặc định (TP.HCM)?",
              [
                { text: "Có", onPress: () => proceedWithCheckin(type, true) },
                { text: "Không", style: "cancel" }
              ]
            );
          }
        });
      }

      Alert.alert(
        "⚠️ Không thể lấy vị trí GPS",
        locationError || "Đang lấy vị trí hiện tại. Vui lòng thử lại sau.",
        buttons
      );
      return;
    }

    // Chấm công bình thường với GPS
    proceedWithCheckin(type, false);
  }, [hasValidLocation, locationError, locationRetryCount, getCurrentLocation]);

  // Function thực hiện chấm công
  const proceedWithCheckin = useCallback(async (type: 'IN' | 'OUT', useDefaultLocation: boolean = false) => {
  
    // BƯớc 1: Cập nhật UI ngay lập tức
    setCheckinType(type === 'IN' ? 'OUT' : 'IN');
    
    // BƯớc 2: Tạo optimistic record
    const now = new Date().toISOString();
    const tempRecord: CheckinRecord = {
      name: `temp-${Date.now()}`,
      employee: user || 'temp',
      employee_name: user || 'Đang xử lý',
      log_type: type,
      time: now,
      custom_status: 'Đang xử lý...'
    };
    
    // Thêm vào cả records và displayRecords
    setRecords(prev => [tempRecord, ...prev]);
    setDisplayRecords(prev => [tempRecord, ...prev]);
    
    try {
      // BƯớc 3: Chuẩn bị dữ liệu API
      const locationToUse = useDefaultLocation 
        ? { latitude: 10.7769, longitude: 106.7009 } // TP.HCM default
        : { latitude: userLocation.latitude, longitude: userLocation.longitude };

      const checkinData: Checkin = {
        log_type: type,
        custom_checkin: now,
        latitude: locationToUse.latitude,
        longitude: locationToUse.longitude,
        custom_auto_load_location: useDefaultLocation ? 0 : 1,
        doctype: "Employee Checkin",
        web_form_name: "checkin"
      };

      if (useDefaultLocation) {
        console.log('⚠️ Sử dụng vị trí mặc định để chấm công');
      }
      
      await handleSubmitCheckin(checkinData);
    
      // Xóa temp record trước khi reload
      setRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setDisplayRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      
      await loadCheckinData();
      
      // BƯớc 6: Hiển thị animation thành công
      console.log('🎯 Triggering success animation...');
      setShowSuccessAnimation(true);
      
      console.log(`✅ Chấm công ${type} hoàn tất!`);
      
    } catch (error: any) {
      setRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setDisplayRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setCheckinType(type); // Trả lại trạng thái ban đầu
      
      // Hiển thị lỗi chi tiết
      const errorMsg = error?.message || error?.response?.data?.message || 'Lỗi không xác định';
      Alert.alert(
        "❌ Lỗi chấm công",
        `Không thể ${type === 'IN' ? 'vào ca' : 'ra ca'}.\nLỗi: ${errorMsg}`,
        [{ text: "OK" }]
      );
    }
  }, [userLocation, loadCheckinData, handleSubmitCheckin, user, hasValidLocation, locationError, getCurrentLocation]);
  
  // Render checkin item
  const renderCheckinItem = useCallback(({ item }: { item: CheckinRecord }) => (
    <View style={homeScreenStyles.checkinItem}>
      <View style={homeScreenStyles.logTypeIndicator}>
        <Text style={[
          homeScreenStyles.logTypeText,
          { color: item.log_type === 'IN' ? '#4CAF50' : '#F44336' }
        ]}>
          {item.log_type}
        </Text>
      </View>
      <View style={homeScreenStyles.checkinInfo}>
        <Text style={homeScreenStyles.checkinTime}>{formatTime(item.time)}</Text>
        <Text style={homeScreenStyles.checkinDate}>{formatDate(item.time)}</Text>
        <Text style={homeScreenStyles.checkinStatus}>{item.custom_status}</Text>
      </View>
    </View>
  ), []);


  return (
    <SafeAreaView style={homeScreenStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Tabs + nút menu */}
      <TopTabBar
        tabs={topTabs}
        activeTab={activeTopTab}
        onTabPress={handleTabChange}
        onMenuPress={handleMenuPress}
      />

      {/* Content với tabs "Hôm nay" và "Tuần này" */}
      <View style={homeScreenStyles.flexContent}>
        {loading ? (
          <View style={homeScreenStyles.centerContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={homeScreenStyles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={homeScreenStyles.centerContainer}>
            <Text style={homeScreenStyles.errorText}>{error}</Text>
            <TouchableOpacity style={homeScreenStyles.retryButton} onPress={loadCheckinData}>
              <Text style={homeScreenStyles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={homeScreenStyles.contentContainer}>
            {/* Content Tabs */}
            <View style={homeScreenStyles.contentTabsContainer}>
              <TouchableOpacity 
                style={[homeScreenStyles.contentTab, activeContentTab === "today" && homeScreenStyles.contentTabActive]}
                onPress={() => setActiveContentTab("today")}
              >
                <Text style={[homeScreenStyles.contentTabText, activeContentTab === "today" && homeScreenStyles.contentTabTextActive]}>Hôm nay</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[homeScreenStyles.contentTab, activeContentTab === "week" && homeScreenStyles.contentTabActive]}
                onPress={() => setActiveContentTab("week")}
              >
                <Text style={[homeScreenStyles.contentTabText, activeContentTab === "week" && homeScreenStyles.contentTabTextActive]}>Tuần này</Text>
              </TouchableOpacity>
            </View>

            {/* Content dựa trên tab đã chọn */}
            {activeContentTab === "today" ? (
          <ScrollView contentContainerStyle={homeScreenStyles.scrollContentContainer}>
            {/* Card Chấm công */}
            <View style={homeScreenStyles.attendanceCard}>
              {/* Hiển thị giờ hiện tại */}
              <View style={homeScreenStyles.currentTimeContainer}>
                <Text style={homeScreenStyles.currentTimeText}>{currentTime}</Text>
              </View>

              {/* Thông tin người dùng và ngày tháng */}
              <View style={homeScreenStyles.userInfoContainer}>
                <Text style={homeScreenStyles.usernameText}>
                  Xin chào, {user || 'Người dùng'}
                </Text>
                <Text style={homeScreenStyles.todayDateText}>
                  {getTodayDateString()}
                </Text>
              </View>
              
              <View style={homeScreenStyles.attendanceContent}>
                {displayRecords.length === 0 ? (
                  <Text style={homeScreenStyles.noDataText}>Chưa có dữ liệu chấm công hôm nay</Text>
                ) : (
                  <View style={homeScreenStyles.timeInfoContainer}>
                    {/* Thông tin giờ vào ca */}
                    <View style={homeScreenStyles.timeColumn}>
                      <Text style={homeScreenStyles.timeLabel}>Vào ca</Text>
                      <Text style={homeScreenStyles.timeValue}>{
                        displayRecords.find(r => r.log_type === 'IN') 
                          ? formatTime(displayRecords.find(r => r.log_type === 'IN')!.time) 
                          : "--:--"
                      }</Text>
                    </View>
                    <View style={homeScreenStyles.timeSeparator} />
                    {/* Thông tin giờ ra ca */}
                    <View style={homeScreenStyles.timeColumn}>
                      <Text style={homeScreenStyles.timeLabel}>Ra ca</Text>
                      <Text style={homeScreenStyles.timeValue}>{
                        displayRecords.find(r => r.log_type === 'OUT') 
                          ? formatTime(displayRecords.find(r => r.log_type === 'OUT')!.time) 
                          : "--:--"
                      }</Text>
                    </View>
                  </View>
                )}
                {/* Recent check-in entries */}
              </View>
            </View>
            
            {/* Nút chấm công ở giữa */}
            <TouchableOpacity 
              style={[
                homeScreenStyles.checkinButton, 
                (!hasValidLocation || locationLoading) && homeScreenStyles.checkinButtonDisabled
              ]}
              onPress={() => handleCheckin(checkinType)}
              disabled={!hasValidLocation || locationLoading}
            >
              <Text style={[
                homeScreenStyles.checkinButtonText,
                (!hasValidLocation || locationLoading) && homeScreenStyles.checkinButtonTextDisabled
              ]}>
                {locationLoading ? '📍 Đang lấy vị trí...' : 
                 !hasValidLocation ? '❌ Không có vị trí' :
                 checkinType === 'IN' ? 'Vào ca' : 'Ra ca'}
              </Text>
            </TouchableOpacity>
            
            {/* Location Status */}
            {locationError && (
              <View style={homeScreenStyles.locationErrorContainer}>
                <Text style={homeScreenStyles.locationErrorText}>⚠️ {locationError}</Text>
                <TouchableOpacity 
                  style={homeScreenStyles.retryLocationButton}
                  onPress={getCurrentLocation}
                >
                  <Text style={homeScreenStyles.retryLocationText}>🔄 Thử lại</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Google Maps - Vị trí đã khóa */}
            <View style={homeScreenStyles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={homeScreenStyles.map}
                region={userLocation}
                initialRegion={userLocation}
                showsUserLocation={true}
                showsCompass={false}
                showsMyLocationButton={false}
                zoomEnabled={false}
                scrollEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
              >
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude
                  }}
                  title="Vị trí đã xác định"
                  description="Vị trí chấm công của bạn"
                  pinColor="#0068FF"
                />
              </MapView>
              {/* Nút làm mới vị trí */}
              <TouchableOpacity 
                style={homeScreenStyles.refreshLocationButton} 
                onPress={getCurrentLocation}
              >
                <Text style={homeScreenStyles.refreshLocationText}>Cập nhật vị trí</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
            ) : (
              <FlatList
                data={displayRecords}
                keyExtractor={(item) => item.name}
                renderItem={renderCheckinItem}
                contentContainerStyle={homeScreenStyles.scrollContentContainer}
                refreshing={loading}
                onRefresh={loadCheckinData}
                ListHeaderComponent={
                  <View style={homeScreenStyles.headerContainer}>
                    <Text style={homeScreenStyles.headerTitle}>
                      {activeContentTab === "today" ? "Chấm công hôm nay" : "Chấm công tuần này"}
                    </Text>
                    <View style={homeScreenStyles.checkinStatusBadge}>
                      <Text style={[
                        homeScreenStyles.checkinStatusText,
                        { color: checkinStatus ? '#4CAF50' : '#F44336' }
                      ]}>
                        {checkinStatus ? "Đã check-in" : "Chưa check-in"}
                      </Text>
                    </View>
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>

      {/* Bottom Tabs */}
      <BottomTabBar
        tabs={bottomTabs}
        activeTab={activeBottomTab}
        onTabPress={setActiveBottomTab}
      />

      {/* Sidebar overlay */}
      <SidebarMenu
        isVisible={isSidebarVisible}
        onClose={handleMenuClose}
        onMenuItemPress={handleMenuItemPress}
        onSubItemPress={handleSubItemPress}
        onLogout={handleLogout}
      />

      {/* Success Animation */}
      {showSuccessAnimation && (
        <SimpleSuccessAnimation
          isVisible={showSuccessAnimation}
          message={`Đã ${checkinType === 'OUT' ? 'vào ca' : 'ra ca'} thành công!`}
          onAnimationComplete={() => setShowSuccessAnimation(false)}
        />
      )}
    </SafeAreaView>
  );
}
// Styles moved to HomeScreen.styles.ts
