// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { 
  SafeAreaView, StatusBar, View, Text, Image,
  ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Alert, Animated
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import TopTabBar from "../components/TabBar/TopTabBar";
import BottomTabBar from "../components/TabBar/BottomTabBar";
import { NavigationSidebarMenu } from "../components/SidebarMenu";
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useAuth, useScreenTabBar } from "../hooks";
import { useCheckin } from "../hooks/useCheckin";
import { fetchCheckinRecords } from "../services/checkinService";
import { CheckinRecord, Checkin } from "../types/checkin.types";
import { homeScreenStyles } from '../styles/HomeScreen.styles';
import SimpleSuccessAnimation from '../components/SuccessAnimation/SimpleSuccessAnimation';
import { CommonException, ErrorCode, homeScreenErrorHandler, HomeScreenErrorCode } from '../utils/error';
import { getLeaveApproversName } from "../services/applicationLeave";

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

// Translate custom_status to Vietnamese
const translateStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'Draft': 'Nháp',
    'Submitted': 'Đã gửi',
    'Approved': 'Đã duyệt',
    'Rejected': 'Đã từ chối',
    'Cancelled': 'Đã hủy',
    'Pending': 'Đang chờ',
    'In Progress': 'Đang xử lý',
    'Completed': 'Hoàn thành',
    'Failed': 'Thất bại',
    'Success': 'Thành công'
  };
  
  return statusMap[status] || status;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, isLoggedIn } = useAuth();
  const { handleSubmitCheckin, loadCheckinData: reloadCheckinData, loading: checkinLoading } = useCheckin();
  const hasLoggedRef = useRef(false);

  // Content tab state - độc lập với TopTabBar (vì TopTab giờ trống)
  const [activeContentTab, setActiveContentTab] = useState('today'); // Default tab "Hôm nay"
  const tabBar = useScreenTabBar('checkin');

  // App state
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
  
  // User Display Name State
  const [displayName, setDisplayName] = useState<string>('Người dùng');
  const [nameLoading, setNameLoading] = useState(false);

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
  
  // Fetch display name khi user thay đổi
  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user) {
        setDisplayName('Người dùng');
        return;
      }
      
      setNameLoading(true);
      try {
        const name = await getLeaveApproversName(user);
        
        if (name && name.trim()) {
          setDisplayName(name);
        } else {
          setDisplayName(user);
        }
      } catch (error) {
        setDisplayName(user);
      } finally {
        setNameLoading(false);
      }
    };
    
    fetchDisplayName();
  }, [user]);

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

  // Tạo cặp check-in/check-out mới nhất cho tab "Hôm nay"
  const latestCheckinPair = useMemo(() => {
    if (activeContentTab !== "today") return null;
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(record => record.time.startsWith(today));
    
    if (todayRecords.length === 0) return null;
    
    // Sắp xếp theo thời gian tăng dần (cũ nhất trước)
    const sortedRecords = todayRecords.sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    
    // Tạo tất cả các cặp từ records
    const pairs: Array<{ inRecord?: CheckinRecord; outRecord?: CheckinRecord }> = [];
    let currentPair: { inRecord?: CheckinRecord; outRecord?: CheckinRecord } = {};
    
    sortedRecords.forEach(record => {
      if (record.log_type === 'IN') {
        // Nếu đã có IN record trong pair hiện tại, lưu pair cũ và bắt đầu pair mới
        if (currentPair.inRecord) {
          pairs.push(currentPair);
          currentPair = { inRecord: record };
        } else {
          currentPair.inRecord = record;
        }
      } else if (record.log_type === 'OUT') {
        // Hoàn thành pair hiện tại
        currentPair.outRecord = record;
        pairs.push(currentPair);
        currentPair = {}; // Reset cho pair tiếp theo
      }
    });
    
    // Thêm pair cuối cùng nếu chưa hoàn thành
    if (currentPair.inRecord || currentPair.outRecord) {
      pairs.push(currentPair);
    }
    
    // Trả về cặp mới nhất (cuối cùng trong mảng)
    return pairs.length > 0 ? pairs[pairs.length - 1] : null;
  }, [activeContentTab, records]);
  
  // Cập nhật displayRecords khi filteredRecords thay đổi
  useEffect(() => {
    setDisplayRecords(filteredRecords);
  }, [filteredRecords]);
  
  // Các hàm xử lý events từ hooks

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
  
  // Group records by date and create pairs for weekly view
  const groupedRecords = useMemo(() => {
    if (activeContentTab !== 'week') return [];
    
    const grouped: { [key: string]: CheckinRecord[] } = {};
    
    // Group records by date
    displayRecords.forEach(record => {
      const dateKey = record.time.split(' ')[0]; // YYYY-MM-DD format
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(record);
    });
    
    // Create pairs for each date
    const result: Array<{ 
      date: string; 
      pairs: Array<{ inRecord?: CheckinRecord; outRecord?: CheckinRecord }> 
    }> = [];
    
    Object.keys(grouped).forEach(dateKey => {
      const dayRecords = grouped[dateKey].sort((a, b) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );
      
      const pairs: Array<{ inRecord?: CheckinRecord; outRecord?: CheckinRecord }> = [];
      let currentPair: { inRecord?: CheckinRecord; outRecord?: CheckinRecord } = {};
      
      dayRecords.forEach(record => {
        if (record.log_type === 'IN') {
          // Start new pair or continue if no OUT yet
          if (currentPair.inRecord && !currentPair.outRecord) {
            // Previous IN without OUT, start new pair
            pairs.push(currentPair);
            currentPair = { inRecord: record };
          } else {
            currentPair.inRecord = record;
          }
        } else if (record.log_type === 'OUT') {
          // Complete current pair
          currentPair.outRecord = record;
          pairs.push(currentPair);
          currentPair = {};
        }
      });
      
      // Add incomplete pair if exists
      if (currentPair.inRecord || currentPair.outRecord) {
        pairs.push(currentPair);
      }
      
      // If no pairs but has records, create pairs from records
      if (pairs.length === 0 && dayRecords.length > 0) {
        dayRecords.forEach(record => {
          if (record.log_type === 'IN') {
            pairs.push({ inRecord: record });
          } else {
            pairs.push({ outRecord: record });
          }
        });
      }
      
      // Reverse pairs to show newest first
      pairs.reverse();
      
      result.push({
        date: dateKey,
        pairs: pairs
      });
    });
    
    // Sort by date (newest first)
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [displayRecords, activeContentTab]);

  // Render checkin item for today view
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
        <Text style={homeScreenStyles.checkinStatus}>{translateStatus(item.custom_status)}</Text>
      </View>
    </View>
  ), []);

  // Render single pair
  const renderSinglePair = useCallback((pair: { inRecord?: CheckinRecord, outRecord?: CheckinRecord }, index: number, totalPairs?: number) => {
    const inTime = pair.inRecord ? formatTime(pair.inRecord.time) : '--:--';
    const outTime = pair.outRecord ? formatTime(pair.outRecord.time) : '--:--';
    const inStatus = pair.inRecord ? translateStatus(pair.inRecord.custom_status) : 'Chưa có';
    const outStatus = pair.outRecord ? translateStatus(pair.outRecord.custom_status) : 'Chưa có';
    
    // Calculate work duration if both times exist
    let workDuration = '';
    if (pair.inRecord && pair.outRecord) {
      const inDateTime = new Date(pair.inRecord.time);
      const outDateTime = new Date(pair.outRecord.time);
      const diff = outDateTime.getTime() - inDateTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      workDuration = `${hours}h ${minutes}m`;
    }
    
    return (
      <View key={index} style={homeScreenStyles.pairContainer}>
        {/* Pair number if multiple pairs */}
        {totalPairs && totalPairs > 1 && (
          <Text style={homeScreenStyles.pairNumber}>
            {index === 0 ? 'Cặp mới nhất' : `Cặp ${totalPairs - index}`}
          </Text>
        )}
        
        {/* Labels Row */}
        <View style={homeScreenStyles.labelsRow}>
          <Text style={homeScreenStyles.inLabel}>[IN] Vào ca</Text>
          <Text style={homeScreenStyles.arrowSymbol}>→</Text>
          <Text style={homeScreenStyles.outLabel}>[OUT] Ra ca</Text>
        </View>
        
        {/* Times Row */}
        <View style={homeScreenStyles.timesRowDisplay}>
          <Text style={[homeScreenStyles.timeDisplay, inTime === '--:--' && homeScreenStyles.missingTimeDisplay]}>
            {inTime}
          </Text>
          <View style={homeScreenStyles.timesSpacer} />
          <Text style={[homeScreenStyles.timeDisplay, outTime === '--:--' && homeScreenStyles.missingTimeDisplay]}>
            {outTime}
          </Text>
        </View>
        
        {/* Status Row */}
        <View style={homeScreenStyles.statusRow}>
          <Text style={[homeScreenStyles.statusDisplay, inTime === '--:--' && homeScreenStyles.missingStatusDisplay]}>
            {inStatus}
          </Text>
          <View style={homeScreenStyles.statusSpacer} />
          <Text style={[homeScreenStyles.statusDisplay, outTime === '--:--' && homeScreenStyles.missingStatusDisplay]}>
            {outStatus}
          </Text>
        </View>
        
        {/* Work Duration */}
        {workDuration && (
          <View style={homeScreenStyles.durationContainer}>
            <Text style={homeScreenStyles.durationText}>Thời gian: </Text>
            <Text style={homeScreenStyles.durationValue}>{workDuration}</Text>
          </View>
        )}
      </View>
    );
  }, []);

  const renderWeeklyCheckinDay = useCallback(({ item }: { item: { date: string, pairs: Array<{ inRecord?: CheckinRecord, outRecord?: CheckinRecord }> } }) => {
  // Parse date properly - item.date is in YYYY-MM-DD format
  const date = new Date(item.date + 'T12:00:00'); // Use noon to avoid timezone issues
  const dayName = date.toLocaleDateString('vi-VN', { weekday: 'long' }); // "long" để lấy tên ngày đầy đủ (ví dụ: Thứ Hai)
  const dayNumber = date.getDate();
  const month = date.getMonth() + 1; // Lấy tháng (lưu ý tháng bắt đầu từ 0)
  const year = date.getFullYear();
  
  const formattedDate = `${dayName} - ${dayNumber}/${month}/${year}`;
  const isToday = item.date === new Date().toISOString().split('T')[0];
  
  // Calculate total work duration for the day
  let totalMinutes = 0;
  item.pairs.forEach(pair => {
    if (pair.inRecord && pair.outRecord) {
      const inDateTime = new Date(pair.inRecord.time);
      const outDateTime = new Date(pair.outRecord.time);
      const diff = outDateTime.getTime() - inDateTime.getTime();
      totalMinutes += diff / (1000 * 60);
    }
  });
  
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = Math.floor(totalMinutes % 60);
  const totalDuration = totalMinutes > 0 ? `${totalHours}h ${remainingMinutes}m` : '';
    
    return (
      <View style={[homeScreenStyles.weeklyCard, isToday && homeScreenStyles.todayCard]}>
        {/* Header with date */}
        <View style={homeScreenStyles.weeklyHeader}>
        <Text style={homeScreenStyles.weeklyHeaderText}>
          {formattedDate} {isToday && ' - Hôm Nay'}
        </Text>
      </View>
        
        {/* All pairs for this day */}
        <View style={homeScreenStyles.inOutRow}>
          {item.pairs.map((pair, index) => renderSinglePair(pair, index, item.pairs.length))}
        </View>
        
        {/* Total work duration for the day */}
        {totalDuration && item.pairs.length > 1 && (
          <View style={[homeScreenStyles.durationContainer, homeScreenStyles.totalDurationContainer]}>
            <Text style={homeScreenStyles.durationText}>Tổng thời gian ngày: </Text>
            <Text style={[homeScreenStyles.durationValue, homeScreenStyles.totalDurationValue]}>{totalDuration}</Text>
          </View>
        )}
      </View>
    );
  }, [renderSinglePair]);


  return (
    <SafeAreaView style={homeScreenStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Tabs + nút menu */}
      <TopTabBar
        {...tabBar.topTabBarProps}
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
                  Xin chào, {nameLoading ? 'Đang tải...' : displayName}
                </Text>
                <Text style={homeScreenStyles.todayDateText}>
                  {getTodayDateString()}
                </Text>
              </View>
              
              <View style={homeScreenStyles.attendanceContent}>
                {!latestCheckinPair ? (
                  <Text style={homeScreenStyles.noDataText}>Chưa có dữ liệu chấm công hôm nay</Text>
                ) : (
                  <View style={homeScreenStyles.pairContainer}>
                    <Text style={homeScreenStyles.pairNumber}>Dữ liệu chấm công mới nhất</Text>
                    {renderSinglePair(latestCheckinPair, 0, 1)}
                  </View>
                )}
              </View>
            </View>
            
            {/* Nút chấm công hoặc trạng thái GPS ở giữa */}
            {locationLoading ? (
              // Hiển thị trạng thái đang tải GPS
              <View style={[homeScreenStyles.checkinButton, homeScreenStyles.checkinButtonDisabled]}>
                <Text style={[homeScreenStyles.checkinButtonText, homeScreenStyles.checkinButtonTextDisabled]}>
                  Đang lấy vị trí...
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
            
            {/* OpenStreetMap - Vị trí đã khóa */}
            <View style={homeScreenStyles.mapContainer}>
              {userLocation ? (
                <WebView
                  style={homeScreenStyles.map}
                  source={{
                    html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                            crossorigin=""/>
                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                            crossorigin=""></script>
                        <style>
                            body { margin: 0; padding: 0; }
                            #map { height: 100vh; width: 100%; }
                            .custom-marker {
                                background-color: #0068FF;
                                width: 30px;
                                height: 30px;
                                border-radius: 50%;
                                border: 3px solid white;
                                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                            }
                        </style>
                    </head>
                    <body>
                        <div id="map"></div>
                        <script>
                            var map = L.map('map', {
                                zoomControl: false,
                                dragging: false,
                                touchZoom: false,
                                doubleClickZoom: false,
                                scrollWheelZoom: false,
                                boxZoom: false,
                                keyboard: false
                            }).setView([${userLocation.latitude}, ${userLocation.longitude}], 16);
                            
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '© OpenStreetMap contributors'
                            }).addTo(map);
                            
                            var customIcon = L.divIcon({
                                className: 'custom-marker',
                                iconSize: [30, 30],
                                iconAnchor: [15, 15]
                            });
                            
                            L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: customIcon})
                                .addTo(map)
                                .bindPopup('<b>Vị trí chấm công</b><br>Vị trí đã xác định của bạn');
                        </script>
                    </body>
                    </html>
                    `
                  }}
                  onLoad={() => {
                    console.log('✅ OpenStreetMap loaded successfully');
                  }}
                  scrollEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={[homeScreenStyles.map, homeScreenStyles.mapLoadingContainer]}>
                  <Text style={homeScreenStyles.mapLoadingText}>
                    📍 Đang lấy vị trí GPS...
                  </Text>
                  <Text style={homeScreenStyles.mapLoadingSubtext}>
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
            ) : activeContentTab === "week" ? (
              <FlatList
                data={groupedRecords}
                keyExtractor={(item) => item.date}
                renderItem={renderWeeklyCheckinDay}
                contentContainerStyle={homeScreenStyles.scrollContentContainer}
                refreshing={loading}
                onRefresh={loadCheckinData}
                ListHeaderComponent={
                  <View style={homeScreenStyles.headerContainer}>
                    <Text style={homeScreenStyles.headerTitle}>Chấm công tuần này</Text>
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
                ListEmptyComponent={
                  <View style={homeScreenStyles.centerContainer}>
                    <Text style={homeScreenStyles.noDataText}>Chưa có dữ liệu chấm công tuần này</Text>
                  </View>
                }
              />
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
                    <Text style={homeScreenStyles.headerTitle}>Chấm công hôm nay</Text>
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
                ListEmptyComponent={
                  <View style={homeScreenStyles.centerContainer}>
                    <Text style={homeScreenStyles.noDataText}>Chưa có dữ liệu chấm công hôm nay</Text>
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>

      {/* Bottom Tabs */}
      <BottomTabBar
        {...tabBar.bottomTabBarProps}
      />

      {/* Sidebar overlay */}
      <NavigationSidebarMenu
        {...tabBar.sidebarProps}
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
