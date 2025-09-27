// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { 
  SafeAreaView, StatusBar, View, Text, Image,
  ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Alert, Animated
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabBar, TopTabBar, NavigationSidebarMenu, BottomTabItem, TopTabItem } from "../components";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from "../hooks";
import { useCheckin } from "../hooks/useCheckin";
import { fetchCheckinRecords } from "../services/checkinService";
import { CheckinRecord, Checkin } from "../types/checkin.types";
import { homeScreenStyles } from '../styles/HomeScreen.styles';
import SimpleSuccessAnimation from '../components/SuccessAnimation/SimpleSuccessAnimation';
import { homeScreenErrorHandler, HomeScreenErrorCode } from '../utils/error/homeScreen';
import { menuRouterController } from '../router';
import { useScreenNavigator } from '../router/ScreenNavigator';

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
  const screenNavigator = useScreenNavigator();

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
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [checkinType, setCheckinType] = useState<'IN' | 'OUT'>('IN');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  
  // Success Animation State
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Location State
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasValidLocation, setHasValidLocation] = useState(false);

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
      
      // Lấy ngày hiện tại
      const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
      
      // Lọc records của ngày hôm nay
      const todayRecords = data.filter(record => record.time.startsWith(today));
      
      if (todayRecords.length > 0) {
        // Kiểm tra bản ghi chấm công mới nhất của ngày hôm nay
        // (đã được sắp xếp theo thời gian giảm dần từ API)
        const latestRecord = todayRecords[0];
        const isCheckedIn = latestRecord.log_type === 'IN';
        setCheckinStatus(isCheckedIn);
        // Cập nhật checkinType dựa vào trạng thái hiện tại
        setCheckinType(isCheckedIn ? 'OUT' : 'IN');
        console.log(`📍 Ngày hôm nay đã có ${todayRecords.length} bản ghi, trạng thái hiện tại: ${isCheckedIn ? 'Đã checkin (IN)' : 'Đã checkout (OUT)'}`);
      } else {
        // Nếu chưa có bản ghi nào cho ngày hôm nay, luôn bắt đầu với IN
        setCheckinStatus(false);
        setCheckinType('IN');
        console.log('📍 Ngày mới, bắt đầu với checkin (IN)');
      }
    } catch (err) {
      const error = homeScreenErrorHandler.analyzeError(err, 'loadCheckinData');
      const errorDef = homeScreenErrorHandler.getErrorDefinition(error.code);
      setError(errorDef.userMessage);
      homeScreenErrorHandler.handleError(error, loadCheckinData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra GPS service có bật không
  const checkLocationServices = useCallback(async () => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        const error = homeScreenErrorHandler.createError(HomeScreenErrorCode.GPS_SERVICE_DISABLED);
        const errorDef = homeScreenErrorHandler.getErrorDefinition(error.code);
        setLocationError(errorDef.userMessage);
        setHasValidLocation(false);
        return false;
      }
      return true;
    } catch (error) {
      const serviceError = homeScreenErrorHandler.analyzeError(error, 'locationService');
      homeScreenErrorHandler.handleLocationError(serviceError);
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
        const error = homeScreenErrorHandler.createError(HomeScreenErrorCode.LOCATION_PERMISSION_DENIED);
        const errorDef = homeScreenErrorHandler.getErrorDefinition(error.code);
        setLocationError(errorDef.userMessage);
        setHasValidLocation(false);
        setLocationLoading(false);
        return;
      }
      

      let location: Location.LocationObject | null = null;
      
      try {
        console.log('📍 Đang lấy vị trí...');
        
        // Thử lấy vị trí với độ chính xác cao
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        console.log('✅ Đã lấy được vị trí với độ chính xác cao');
      } catch (locationError) {
        console.log('⚠️ Lỗi khi lấy vị trí với độ chính xác cao, thử với độ chính xác thấp');
        
        try {
          // Thử lại với độ chính xác thấp hơn
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low
          });
          console.log('✅ Đã lấy được vị trí với độ chính xác thấp');
        } catch (lowAccuracyError) {
          console.log('⚠️ Không thể lấy vị trí');
          const errorObj = homeScreenErrorHandler.analyzeError(lowAccuracyError, 'location');
          homeScreenErrorHandler.handleLocationError(errorObj);
          throw errorObj;
        }
      }
      
      // Kiểm tra location có valid không
      if (!location || !location.coords) {
        const error = homeScreenErrorHandler.createError(HomeScreenErrorCode.LOCATION_COORDS_INVALID);
        throw error;
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
      const locationError = error.code ? error : homeScreenErrorHandler.analyzeError(error, 'location');
      const errorDef = homeScreenErrorHandler.getErrorDefinition(locationError.code);
      
      setLocationError(errorDef.userMessage);
      setHasValidLocation(false);
      
      // Xử lý với specialized location error handler
      homeScreenErrorHandler.handleLocationError(locationError, getCurrentLocation);
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
        const initError = homeScreenErrorHandler.analyzeError(error, 'initialization');
        homeScreenErrorHandler.handleError(initError);
      });
    }
  }, [loadCheckinData, getCurrentLocation]); 

  // Auto refresh vị trí mỗi 60 giây (chỉ khi không có location)
  useEffect(() => {
    const locationInterval = setInterval(() => {
      if (!hasValidLocation && !locationLoading) {
        console.log('🔄 Auto refreshing location...');
        getCurrentLocation();
      }
    }, 60000); // 60 giây

    return () => clearInterval(locationInterval);
  }, [hasValidLocation, locationLoading, getCurrentLocation]);

  // Tối ưu hóa việc lọc records theo content tab và phân nhóm theo ngày
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
      
      // Lọc records trong tuần này
      const weekRecords = records.filter(record => {
        const recordDate = new Date(record.time);
        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      });
      
      return weekRecords;
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
  
  // Không cần các handlers cho menu navigation và logout nữa
  // vì đã được xử lý trong NavigationSidebarMenu
  
  const handleTabChange = useCallback((tabKey: string) => {
    setActiveTopTab(tabKey);
  }, []);

  // 🚀 Hàm chấm công - chỉ hoạt động khi có GPS
  const handleCheckin = useCallback(async (type: 'IN' | 'OUT') => {
    // Chỉ cho phép chấm công khi có GPS hợp lệ
    if (!hasValidLocation) {
      const error = homeScreenErrorHandler.createCheckinNoGpsError(locationError || undefined);
      homeScreenErrorHandler.handleCheckinError(error, getCurrentLocation, type);
      return;
    }
  
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
      // BƯớc 3: Chuẩn bị dữ liệu API với GPS thực
      if (!userLocation) {
        const locationError = homeScreenErrorHandler.createCheckinNoLocationError();
        throw locationError;
      }

      const checkinData: Checkin = {
        log_type: type,
        custom_checkin: now,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        custom_auto_load_location: 1,
        doctype: "Employee Checkin",
        web_form_name: "checkin"
      };

      await handleSubmitCheckin(checkinData);
    
      setRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setDisplayRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      
      await loadCheckinData();
            setShowSuccessAnimation(true);
            
    } catch (error: any) {
      setRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setDisplayRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setCheckinType(type); // Trả lại trạng thái ban đầu
      
      // Xử lý error với specialized checkin error handler
      const checkinError = error.code ? error : homeScreenErrorHandler.analyzeError(error, 'checkin');
      homeScreenErrorHandler.handleCheckinError(checkinError, getCurrentLocation, type);
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
            
            {/* Nút chấm công hoặc trạng thái GPS ở giữa */}
            {locationLoading ? (
              // Hiển thị trạng thái đang tải GPS
              <View style={[homeScreenStyles.checkinButton, homeScreenStyles.checkinButtonDisabled]}>
                <Text style={[homeScreenStyles.checkinButtonText, homeScreenStyles.checkinButtonTextDisabled]}>
                  📍 Đang lấy vị trí...
                </Text>
              </View>
            ) : !hasValidLocation ? (
              // Hiển thị trạng thái khi không có GPS
              <TouchableOpacity 
                style={[homeScreenStyles.checkinButton, homeScreenStyles.checkinButtonDisabled]}
                onPress={getCurrentLocation}
              >
                <Text style={[homeScreenStyles.checkinButtonText, homeScreenStyles.checkinButtonTextDisabled]}>
                  🚫 Nhấn để lấy vị trí GPS
                </Text>
              </TouchableOpacity>
            ) : (
              // Hiển thị nút chấm công khi có GPS
              <TouchableOpacity 
                style={homeScreenStyles.checkinButton}
                onPress={() => handleCheckin(checkinType)}
              >
                <Text style={homeScreenStyles.checkinButtonText}>
                  {checkinType === 'IN' ? 'Vào ca' : 'Ra ca'}
                </Text>
              </TouchableOpacity>
            )}
            
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
              {userLocation ? (
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
              ) : (
                <View style={[homeScreenStyles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
                  <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                    📍 Đang lấy vị trí GPS...
                  </Text>
                  <Text style={{ color: '#999', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                    Map sẽ hiển thị khi có vị trí
                  </Text>
                </View>
              )}
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
      <NavigationSidebarMenu
        isVisible={isSidebarVisible}
        onClose={handleMenuClose}
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
