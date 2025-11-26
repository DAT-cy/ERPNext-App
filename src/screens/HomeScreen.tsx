// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { 
  SafeAreaView, StatusBar, View, Text,
  ScrollView, ActivityIndicator, FlatList, TouchableOpacity, AppState
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import TopTabBar from "../components/TabBar/TopTabBar";
import BottomTabBar from "../components/TabBar/BottomTabBar";
import { NavigationSidebarMenu } from "../components/SidebarMenu";
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { getLocationFromCache, saveLocationToCache } from '../utils/locationCache';
import { useAuth, useScreenTabBar } from "../hooks";
import { useCheckin } from "../hooks/useCheckin";
import { fetchCheckinRecords } from "../services/checkinService";
import { CheckinRecord, Checkin } from "../types/checkin.types";
import { homeScreenStyles } from '../styles/HomeScreen.styles';
import SimpleSuccessAnimation from '../components/SuccessAnimation/SimpleSuccessAnimation';
import AttendanceStatistics from "./AttendanceStatistics";
import { showErrorAlert } from '../utils/error/ErrorHandler';
import { getLeaveApproversName } from "../services/applicationLeave";
import { notificationService } from "../services";

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

type MapLocation = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
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
  const { handleSubmitCheckin } = useCheckin();

  // Content tab state - độc lập với TopTabBar (vì TopTab giờ trống)
  const [activeContentTab, setActiveContentTab] = useState('today'); // Default tab "Hôm nay"
  const tabBar = useScreenTabBar('checkin');

  // App state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [displayRecords, setDisplayRecords] = useState<CheckinRecord[]>([]);
  const [checkinStatus, setCheckinStatus] = useState(false);
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
  const [checkinType, setCheckinType] = useState<'IN' | 'OUT'>('IN');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  
  // Success Animation State
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Location State
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasValidLocation, setHasValidLocation] = useState(false);
  const [mapReloadKey, setMapReloadKey] = useState(0); // Key để kiểm soát việc reload map
  const mapLoadResolvers = useRef<Array<() => void>>([]);
  const userLocationRef = useRef<MapLocation | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const hasLoadedInitialData = useRef(false); // Track xem đã load dữ liệu ban đầu chưa
  const hasRequestedPermission = useRef(false); // Track xem đã request permission chưa
  
  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  // User Display Name State
  const [displayName, setDisplayName] = useState<string>('Người dùng');
  const [nameLoading, setNameLoading] = useState(false);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false); 
      hasLoadedInitialData.current = false; 
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [isLoggedIn, navigation]);

  const loadCheckinData = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchCheckinRecords(500); // Tăng limit lên 500 để lấy nhiều dữ liệu hơn
      
      setRecords(data);
      setError(null);
      
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
      } else if (data.length > 0) {
        const latestRecord = data[0];
        const hasUnpairedCheckin = latestRecord.log_type === 'IN';
        setCheckinStatus(hasUnpairedCheckin);
        setCheckinType(hasUnpairedCheckin ? 'OUT' : 'IN');
      } else {
        // Nếu chưa có bản ghi nào cho ngày hôm nay, luôn bắt đầu với IN
        setCheckinStatus(false);
        setCheckinType('IN');
      }
    } catch (err) {
      setError('Lỗi tải dữ liệu chấm công');
      showErrorAlert(err, 'Lỗi tải dữ liệu chấm công');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  // Kiểm tra GPS service có bật không
  const checkLocationServices = useCallback(async () => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        setLocationError('GPS không được bật. Vui lòng bật GPS để sử dụng tính năng chấm công.');
        setHasValidLocation(false);
        return false;
      }
      return true;
    } catch (error) {
      showErrorAlert(error, 'Lỗi kiểm tra dịch vụ vị trí');
      return true; // Assume enabled if can't check
    }
  }, []);

  const reloadMap = useCallback((awaitLoad: boolean = false) => {
    setMapReloadKey(prev => prev + 1);
    if (awaitLoad && userLocationRef.current) {
      return new Promise<void>((resolve) => {
        mapLoadResolvers.current.push(resolve);
      });
    }
    return Promise.resolve();
  }, []);

  const handleMapLoaded = useCallback(() => {
    while (mapLoadResolvers.current.length) {
      const resolve = mapLoadResolvers.current.shift();
      resolve && resolve();
    }
  }, []);

  // Tối ưu hóa lấy vị trí: trả về last known ngay, đồng thời lấy chính xác với timeout
  const getCurrentLocation = useCallback(async (): Promise<MapLocation | null> => {
    setLocationLoading(true);
    setLocationError(null);

    let latestLocation: MapLocation | null = null;

    const updateLocationState = (latitude: number, longitude: number) => {
      const formattedLocation: MapLocation = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      };
      setUserLocation(formattedLocation);
      setHasValidLocation(true);
      setLocationError(null);
      latestLocation = formattedLocation;
    };
    
    try {
      
      // Kiểm tra GPS service trước
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        setLocationLoading(false);
        return null;
      }
      
      // Kiểm tra quyền truy cập vị trí - chỉ request nếu chưa có
      let { status } = await Location.getForegroundPermissionsAsync();
      
      // Chỉ request permission nếu chưa được cấp và chưa request lần nào
      if (status !== 'granted' && !hasRequestedPermission.current) {
        hasRequestedPermission.current = true;
        const permissionResult = await Location.requestForegroundPermissionsAsync();
        status = permissionResult.status;
        // Reset flag nếu user từ chối để có thể request lại sau
        if (status !== 'granted') {
          hasRequestedPermission.current = false;
        }
      }

      if (status !== 'granted') {
        console.warn('Quyền vị trí bị từ chối');
        setLocationError('Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền để sử dụng tính năng chấm công.');
        setHasValidLocation(false);
        setLocationLoading(false);
        return null;
      }
      // 1) Trả về cache ngay nếu còn hạn (<= 10s) để cập nhật thường xuyên hơn
      const cached = await getLocationFromCache(10_000);
      if (cached) {
        updateLocationState(cached.latitude, cached.longitude);
      } else {
        // fallback last known nếu không có cache
        try {
          const last = await Location.getLastKnownPositionAsync();
          if (last && last.coords) {
            updateLocationState(last.coords.latitude, last.coords.longitude);
          }
        } catch {}
      }

      // 2) Đồng thời cố lấy vị trí chính xác với timeout ngắn
      const preciseWithTimeout = async (ms: number) => {
        return await Promise.race<Promise<Location.LocationObject>>([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), ms)) as Promise<Location.LocationObject>
        ]);
      };

      try {
        const precise = await preciseWithTimeout(1000);
        if (precise && precise.coords) {
          updateLocationState(precise.coords.latitude, precise.coords.longitude);
          saveLocationToCache({
            latitude: precise.coords.latitude,
            longitude: precise.coords.longitude,
            accuracy: precise.coords.accuracy ?? null,
          });
        }
      } catch (err) {
        if ((err as Error).message !== 'LOCATION_TIMEOUT') {
          showErrorAlert(err, 'Lỗi lấy vị trí');
        }
      }
      
    } catch (error: any) {
      if (!latestLocation) {
        setLocationError('Lỗi lấy vị trí. Vui lòng thử lại.');
        setHasValidLocation(false);
      } else {
        console.warn('⚠️ Lỗi cập nhật vị trí, giữ nguyên vị trí cũ:', error);
        setLocationError(null);
        setHasValidLocation(true);
      }
      showErrorAlert(error, 'Lỗi lấy vị trí');
    } finally {
      setLocationLoading(false);
    }

    return latestLocation;
  }, [checkLocationServices]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load map ngay khi mở app - dùng cache tạm thời, sau đó load vị trí mới
  useEffect(() => {
    const loadMapOnStart = async () => {
      // Thử lấy từ cache trước để hiển thị map ngay (dùng cache cũ hơn để đảm bảo có map)
      const cached = await getLocationFromCache(86400000); // 24 giờ
      if (cached) {
        setUserLocation({
          latitude: cached.latitude,
          longitude: cached.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        });
        setHasValidLocation(true);
      } else {
        // Nếu không có cache, thử lấy last known position
        try {
          const last = await Location.getLastKnownPositionAsync();
          if (last && last.coords) {
            setUserLocation({
              latitude: last.coords.latitude,
              longitude: last.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            });
            setHasValidLocation(true);
          }
        } catch (err) {
        }
      }
      
      // Sau đó luôn load vị trí GPS mới để chấm công chính xác
      getCurrentLocation();
    };
    
    loadMapOnStart();
  }, [getCurrentLocation]);

  // Load dữ liệu checkin khi đã đăng nhập và có user - chỉ load một lần khi mount
  useEffect(() => {
    // Chỉ load khi đã đăng nhập, có user, và chưa load lần nào
    if (isLoggedIn && user && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      loadCheckinData();
    } else if (!isLoggedIn || !user) {
      // Nếu chưa đăng nhập hoặc chưa có user, set loading = false để hiển thị UI
      setLoading(false);
      hasLoadedInitialData.current = false; // Reset để có thể load lại khi login
    }
  }, [isLoggedIn, user, loadCheckinData]);

  const reloadMapThenGetLocation = useCallback(async (): Promise<MapLocation | null> => {
    await reloadMap(true);
    return await getCurrentLocation();
  }, [reloadMap, getCurrentLocation]);

  useEffect(() => {
    void reloadMap();
  }, [reloadMap]);

  // Load lại map và location khi app được focus (quay lại từ background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasBackground = appStateRef.current?.match(/inactive|background/);
      if (nextAppState === 'active' && wasBackground) {
        getCurrentLocation();
        loadCheckinData();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [getCurrentLocation, loadCheckinData]);

  // Khởi tạo notification service và lên lịch nhắc nhở
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        await notificationService.scheduleCheckinReminder();
        
      } catch (error) {
        console.error('❌ Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, []); 

  // Kiểm tra và gửi notification nhắc nhở chấm công dựa trên enum
  useEffect(() => {
    const checkinReminderInterval = setInterval(async () => {
      try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();
        
        // Lấy records của ngày hôm nay
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = records.filter(record => record.time.startsWith(today));
        
        // Gọi hàm kiểm tra mới - ĐƠN GIẢN HƠN NHIỀU!
        await notificationService.checkAndSendNotification(
          currentHour,
          currentMinute,
          currentSecond,
          todayRecords
        );
        
      } catch (error) {
        console.error('❌ Error checking notification:', error);
      }
    }, 1000); // Kiểm tra mỗi 1 giây để đảm bảo chính xác

    return () => clearInterval(checkinReminderInterval);
  }, [records]);

  
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
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      // Sửa cách tính ngày cuối tháng
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      // Lọc records trong tháng này - sử dụng cách tiếp cận đơn giản hơn
      const monthRecords = records.filter(record => {
        // Lấy ngày từ record.time (format: YYYY-MM-DD HH:mm:ss)
        const recordDateStr = record.time.split(' ')[0]; // Lấy phần YYYY-MM-DD
        const recordYear = parseInt(recordDateStr.split('-')[0]);
        const recordMonth = parseInt(recordDateStr.split('-')[1]);
        
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // getMonth() trả về 0-11
        
        const isInCurrentMonth = recordYear === currentYear && recordMonth === currentMonth;
        
        // Debug từng record để xem tại sao không match
        return isInCurrentMonth;
      });
      return monthRecords;
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
    const latestLocation = await reloadMapThenGetLocation();
    if (!latestLocation) {
      showErrorAlert(new Error('Không thể lấy vị trí'), 'Vui lòng bật GPS để chấm công');
      return;
    }

    if (type === 'IN') {
      const latestRecord = records.find(record => !record.name?.startsWith('temp-'));
      if (latestRecord?.log_type === 'IN') {
        showErrorAlert(new Error('Chưa ra ca'), 'Bạn cần chấm công ra ca trước khi vào ca mới.');
        setCheckinType('OUT');
        return;
      }
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
      const checkinData: Checkin = {
        log_type: type,
        custom_checkin: now,
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        custom_auto_load_location: 1,
        doctype: "Employee Checkin",
        web_form_name: "checkin"
      };

      await handleSubmitCheckin(checkinData);
    
      setRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setDisplayRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      
      await loadCheckinData();
      setShowSuccessAnimation(true);
      
      // Gửi thông báo ngay lập tức khi chấm công ra ca
      if (type === 'OUT') {
        await notificationService.sendImmediateNotification({
          title: '✅ Đã chấm công ra ca',
          body: 'Bạn đã chấm công ra ca thành công! Chúc bạn buổi tối vui vẻ!',
          data: { type: 'checkout_success' }
        });
      }
            
    } catch (error: any) {
      setRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setDisplayRecords(prev => prev.filter(r => r.name !== tempRecord.name));
      setCheckinType(type); // Trả lại trạng thái ban đầu
      
      showErrorAlert(error, 'Lỗi chấm công. Vui lòng thử lại.');
    }
  }, [reloadMapThenGetLocation, loadCheckinData, handleSubmitCheckin, user, locationError, records]);
  
  // Group records by date and create pairs for monthly view
  const groupedRecords = useMemo(() => {
    if (activeContentTab !== 'month') {
      return [];
    }
    
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
    const finalResult = result.sort((a, b) => b.date.localeCompare(a.date));
    return finalResult;
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
                style={[homeScreenStyles.contentTab, activeContentTab === "month" && homeScreenStyles.contentTabActive]}
                onPress={() => setActiveContentTab("month")}
              >
                <Text style={[homeScreenStyles.contentTabText, activeContentTab === "month" && homeScreenStyles.contentTabTextActive]}>Tháng này</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[homeScreenStyles.contentTab, activeContentTab === "statistics" && homeScreenStyles.contentTabActive]}
                onPress={() => setActiveContentTab("statistics")}
              >
                <Text style={[homeScreenStyles.contentTabText, activeContentTab === "statistics" && homeScreenStyles.contentTabTextActive]}>Thống kê</Text>
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
                onPress={reloadMapThenGetLocation}
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
                  onPress={reloadMapThenGetLocation}
                >
                  <Text style={homeScreenStyles.retryLocationText}>🔄 Thử lại</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* OpenStreetMap - Vị trí đã khóa */}
            <View style={homeScreenStyles.mapContainer}>
              {userLocation ? (
                <WebView
                  key={mapReloadKey} // Force re-render khi cần load lại
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
                  onLoad={handleMapLoaded}
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
                onPress={reloadMapThenGetLocation}
              >
                <Text style={homeScreenStyles.refreshLocationText}>Cập nhật vị trí</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
            ) : activeContentTab === "month" ? (
              <FlatList
                data={groupedRecords}
                keyExtractor={(item) => item.date}
                renderItem={renderWeeklyCheckinDay}
                contentContainerStyle={homeScreenStyles.scrollContentContainer}
                refreshing={loading}
                onRefresh={loadCheckinData}
                ListHeaderComponent={
                  <View style={homeScreenStyles.headerContainer}>
                    <Text style={homeScreenStyles.headerTitle}>Chấm công tháng này</Text>
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
                    <Text style={homeScreenStyles.noDataText}>Chưa có dữ liệu chấm công tháng này</Text>
                  </View>
                }
              />
            ) : activeContentTab === "statistics" ? (
              <AttendanceStatistics records={filteredRecords} />
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