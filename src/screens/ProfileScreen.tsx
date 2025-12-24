// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync, MediaTypeOptions } from 'expo-image-picker';
import { useAuth } from '../hooks';
import { getLeaveApproversName } from '../services/applicationLeave';
import { getEmployeeProfile, uploadEmployeeAvatar, getBaseURL } from '../services/employeeService';
import { EmployeeProfile } from '../types/employee.types';
import TopTabBar from '../components/TabBar/TopTabBar';
import BottomTabBar from '../components/TabBar/BottomTabBar';
import { NavigationSidebarMenu } from '../components/SidebarMenu';
import { useScreenTabBar } from '../hooks';
import { homeScreenStyles } from '../styles/HomeScreen.styles';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const mapGenderToVN = (gender?: string) => {
  if (!gender) return 'Chưa cập nhật';

  switch (gender.toLowerCase()) {
    case 'male':
      return 'Nam';
    case 'female':
      return 'Nữ';
    case 'other':
      return 'Khác';
    default:
      return gender;
  }
};


export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, isLoggedIn } = useAuth();
  const tabBar = useScreenTabBar('profile');

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>('Người dùng');
  const [nameLoading, setNameLoading] = useState(false);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [isLoggedIn, navigation]);

  // Fetch display name
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

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Fetch employee profile
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!isLoggedIn) return;

      setProfileLoading(true);
      try {
        const profile = await getEmployeeProfile();
        if (profile) {
          setEmployeeProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching employee profile:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin nhân viên');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, [isLoggedIn]);

  // Handle avatar picker
  const pickImage = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh đại diện');
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      if (employeeProfile) {
        try {
          const uploadedUrl = await uploadEmployeeAvatar(employeeProfile.employee, imageUri);
          if (uploadedUrl) {
            const fullImageUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${getBaseURL()}${uploadedUrl}`;
            setEmployeeProfile(prev => prev ? { ...prev, image: fullImageUrl } : null);
            Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật');
          }
        } catch (error) {
          Alert.alert('Lỗi', 'Không thể upload ảnh đại diện');
        }
      }
    }
  };



  if (loading) {
    return (
      <SafeAreaView style={homeScreenStyles.container}>
        <View style={homeScreenStyles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={homeScreenStyles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={homeScreenStyles.container}>
      {/* Top Tabs */}
      <TopTabBar {...tabBar.topTabBarProps} />

      {/* Content */}
      <View style={homeScreenStyles.flexContent}>
        <ScrollView contentContainerStyle={homeScreenStyles.scrollContentContainer}>
          <View style={homeScreenStyles.attendanceCard}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={[homeScreenStyles.usernameText, { textAlign: 'center', fontWeight: '900', fontSize: 24 }]}>
                Hồ sơ nhân viên
              </Text>
            </View>

            <View style={{ padding: 20 }}>
              {/* Avatar Section */}
              <View style={{ alignItems: 'center', marginBottom: 30 }}>
                <TouchableOpacity onPress={pickImage}>
                  <Image
                    source={
                      employeeProfile?.image
                        ? { uri: employeeProfile.image.startsWith('http') ? employeeProfile.image : `${getBaseURL()}${employeeProfile.image}` }
                        : require('../assets/profile.png')
                    }
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderWidth: 3,
                      borderColor: '#8DB200'
                    }}
                  />
                </TouchableOpacity>
                <Text
                style={{
                  marginTop: 12,
                  fontSize: 24,
                  fontWeight: '900',
                  color: '#222',
                  textAlign: 'center'
                }}
                >
                  {employeeProfile?.employee_name || displayName || 'Người dùng'}
                </Text>

                <Text style={{ marginTop: 6, color: '#888', fontSize: 14 }}>
                  Nhấn vào ảnh để thay đổi
                </Text>
              </View>

              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
                Thông tin cá nhân
              </Text>

              <View style={{ alignItems: 'center', paddingLeft: Dimensions.get('window').width * 0.1, paddingRight: Dimensions.get('window').width * 0.05 }}>
                {/* Employee Name */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Tên nhân viên:
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', flex: 1, textAlign: 'right' }}>
                      {employeeProfile?.employee_name || 'Chưa cập nhật'}
                    </Text>
                  </View>
                </View>

                {/* Employee Code */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Mã nhân viên:
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', flex: 1, textAlign: 'right' }}>
                      {employeeProfile?.employee || 'Chưa cập nhật'}
                    </Text>
                  </View>
                </View>

                {/* Date of Birth */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Ngày sinh:
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', flex: 1, textAlign: 'right' }}>
                      {employeeProfile?.date_of_birth ? new Date(employeeProfile.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </Text>
                  </View>
                </View>

                {/* Date of Joining */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Ngày vào làm:
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', flex: 1, textAlign: 'right' }}>
                      {employeeProfile?.date_of_joining ? new Date(employeeProfile.date_of_joining).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </Text>
                  </View>
                </View>

                {/* Gender */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Giới tính:
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', flex: 1, textAlign: 'right' }}>
                      {mapGenderToVN(employeeProfile?.gender)}
                    </Text>
                  </View>
                </View>

                {/* Department */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Phòng ban:
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', flex: 1, textAlign: 'right' }}>
                      {(() => {
                        const dept = employeeProfile?.department;
                        console.log('Department raw:', dept);
                        return dept?.replace(/\s*-\s*COM$/, '') || 'Chưa cập nhật';
                      })()}
                    </Text>
                  </View>
                </View>

                {/* Designation */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Chức vụ:
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', flex: 1, textAlign: 'right' }}>
                      {employeeProfile?.designation || 'Chưa cập nhật'}
                    </Text>
                  </View>
                </View>

                {/* Branch */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Chi nhánh:
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', flex: 1, textAlign: 'right' }}>
                      {employeeProfile?.branch || 'Chưa cập nhật'}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                <View style={{ marginBottom: 15, width: '100%', maxWidth: 300 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                      Trạng thái:
                    </Text>
                    <Text style={{ fontSize: 16, color: employeeProfile?.status === 'Active' ? '#4CAF50' : '#F44336', flex: 1, textAlign: 'right' }}>
                      {employeeProfile?.status === 'Active' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Tabs */}
      <BottomTabBar {...tabBar.bottomTabBarProps} />

      {/* Sidebar overlay */}
      <NavigationSidebarMenu {...tabBar.sidebarProps} />
    </SafeAreaView>
  );
}