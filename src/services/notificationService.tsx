import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationTimeHelper } from '../enum';

// Cấu hình notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private lastCheckinNotificationMinute: number = -1; // Lưu phút cuối cùng đã gửi
  private lastCheckoutNotificationMinute: number = -1; // Lưu phút cuối cùng đã gửi

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Yêu cầu quyền notification
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Notification permission not granted');
        return;
      }

      // Cấu hình cho Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('checkin-reminder', {
          name: 'Check-in Reminder',
          description: 'Nhắc nhở chấm công hàng ngày',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  async scheduleCheckinReminder(): Promise<void> {
    try {
      await this.initialize();
      
      // Lấy thời gian từ enum
      const checkinTime = NotificationTimeHelper.getCheckinTime();
      const checkoutTime = NotificationTimeHelper.getCheckoutTime();
      
      // Xóa notification cũ
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Lên lịch notification cho mỗi giờ cụ thể (repeats: true để gửi mỗi ngày)
      const checkinTrigger = {
        hour: checkinTime.hour,
        minute: checkinTime.minute,
        second: checkinTime.second,
        repeats: true, // Lặp lại mỗi ngày
      };
      
      const checkoutTrigger = {
        hour: checkoutTime.hour,
        minute: checkoutTime.minute,
        second: checkoutTime.second,
        repeats: true, // Lặp lại mỗi ngày
      };
      
      // Lên lịch check-in notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Nhắc nhở chấm công',
          body: 'Đã đến giờ chấm công vào ca. Hãy kiểm tra và chấm công nếu cần!',
          data: { type: 'checkin_reminder' },
          sound: true,
          priority: 'high',
        },
        trigger: checkinTrigger,
      });
      
      // Lên lịch check-out notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Nhắc nhở ra ca',
          body: 'Đã đến giờ chấm công ra ca. Hãy kiểm tra và chấm công nếu cần!',
          data: { type: 'checkout_reminder' },
          sound: true,
          priority: 'high',
        },
        trigger: checkoutTrigger,
      });
      
      console.log('✅ Đã lên lịch thông báo cho background:', {
        checkin: `${checkinTime.hour}:${checkinTime.minute}:${checkinTime.second}`,
        checkout: `${checkoutTime.hour}:${checkoutTime.minute}:${checkoutTime.second}`,
      });
      
    } catch (error) {
      console.error('❌ Failed to schedule notifications:', error);
    }
  }

  async cancelCheckinReminder(): Promise<void> {
    try {
      console.log('✅ Check-in reminder service stopped');
    } catch (error) {
      console.error('❌ Failed to stop check-in reminder:', error);
    }
  }

  async sendImmediateNotification(data: NotificationData): Promise<void> {
    try {
      await this.initialize();

      console.log('📱 [SENDING] Attempting to send notification:', data.title);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data,
          sound: true,
          priority: 'high',
        },
        trigger: null, // Hiển thị ngay lập tức
      });

      console.log('✅ [SENT] Notification sent with ID:', notificationId);
      console.log('📋 [NOTIFICATION DATA]', data);
    } catch (error) {
      console.error('❌ [FAILED] Failed to send notification:', error);
      throw error;
    }
  }

  // Hàm kiểm tra và gửi notification - VIẾT LẠI HOÀN TOÀN
  async checkAndSendNotification(
    currentHour: number,
    currentMinute: number,
    currentSecond: number,
    todayRecords: any[]
  ): Promise<void> {
    try {
      // Kiểm tra IN/OUT trong ngày
      const hasCheckin = todayRecords.some(record => record.log_type === 'IN');
      const hasCheckout = todayRecords.some(record => record.log_type === 'OUT');

      // Lấy thời gian target từ enum
      const checkinTime = NotificationTimeHelper.getCheckinTime();
      const checkoutTime = NotificationTimeHelper.getCheckoutTime();
      // Chỉ log khi gần đến giờ (trong vòng 2 phút)
      const nearCheckin = currentHour === checkinTime.hour && 
                          currentMinute >= checkinTime.minute - 2 && 
                          currentMinute <= checkinTime.minute + 2;
      const nearCheckout = currentHour === checkoutTime.hour && 
                          currentMinute >= checkoutTime.minute - 2 && 
                          currentMinute <= checkoutTime.minute + 2;



      // ===== CHECK-IN TIME =====
      // Gửi thông báo khi đúng giờ:phút:giây trong enum - CHỈ GỬI 1 LẦN
      if (
        currentHour === checkinTime.hour &&
        currentMinute === checkinTime.minute &&
        currentSecond >= checkinTime.second &&
        currentSecond <= checkinTime.second + 1
      ) {
        // Chỉ gửi 1 lần trong phút này (không gửi lại trong vòng 1 giây)
        if (this.lastCheckinNotificationMinute !== currentMinute) {
          this.lastCheckinNotificationMinute = currentMinute;
          
          if (!hasCheckin) {
            console.log('⏰ [CHECK-IN TIME] ĐÚNG THỜI ĐIỂM! Gửi thông báo...', {
              current: `${currentHour}:${currentMinute}:${currentSecond}`,
              target: checkinTime.label,
              hasCheckin,
            });
            
            await this.sendImmediateNotification({
              title: '⏰ Nhắc nhở chấm công',
              body: `Đã ${checkinTime.label}! Bạn chưa chấm công vào ca. Hãy chấm công ngay!`,
              data: { type: 'checkin_reminder' },
            });
            console.log('✅ [CHECK-IN] THÔNG BÁO ĐÃ GỬI');
          }
        }
      }

      // ===== CHECK-OUT TIME =====
      // Gửi thông báo khi đúng giờ:phút:giây trong enum - CHỈ GỬI 1 LẦN
      if (
        currentHour === checkoutTime.hour &&
        currentMinute === checkoutTime.minute &&
        currentSecond >= checkoutTime.second &&
        currentSecond <= checkoutTime.second + 1
      ) {
        // Chỉ gửi 1 lần trong phút này (không gửi lại trong vòng 1 giây)
        if (this.lastCheckoutNotificationMinute !== currentMinute) {
          this.lastCheckoutNotificationMinute = currentMinute;
          
          if (hasCheckin && !hasCheckout) {
            console.log('⏰ [CHECK-OUT TIME] ĐÚNG THỜI ĐIỂM! Gửi thông báo...', {
              current: `${currentHour}:${currentMinute}:${currentSecond}`,
              target: checkoutTime.label,
              hasCheckin,
              hasCheckout,
            });
            
            await this.sendImmediateNotification({
              title: '⏰ Nhắc nhở ra ca',
              body: `Đã ${checkoutTime.label}! Bạn đã chấm công vào nhưng chưa chấm công ra. Hãy chấm công ngay!`,
              data: { type: 'checkout_reminder' },
            });
            console.log('✅ [CHECK-OUT] THÔNG BÁO ĐÃ GỬI');
          }
        }
      }

    } catch (error) {
      console.error('❌ [NOTIFICATION CHECK] Error:', error);
    }
  }


  // Hàm để test gửi notification ngay lập tức
  async testSendNotification(): Promise<void> {
    try {
      console.log('🧪 [TEST] Sending test notification...');
      await this.sendImmediateNotification({
        title: '🧪 TEST Notification',
        body: 'Đây là thông báo test. Nếu bạn thấy nó, notification hoạt động!',
        data: { type: 'test' },
      });
      console.log('✅ [TEST] Notification sent');
    } catch (error) {
      console.error('❌ [TEST] Failed to send notification:', error);
    }
  }
}

export default NotificationService.getInstance();
