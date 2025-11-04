// Enum quản lý thời gian thông báo chấm công
export enum NotificationTime {
  // Thời gian check-in (vào ca)
  CHECKIN_HOUR = 7,
  CHECKIN_MINUTE = 55,
  CHECKIN_SECOND = 0,
  
  // Thời gian check-out (ra ca) 
  CHECKOUT_HOUR = 17,
  CHECKOUT_MINUTE = 30,
  CHECKOUT_SECOND = 0,
}

// Helper functions để dễ sử dụng
export const NotificationTimeHelper = {
  // Lấy thời gian check-in
  getCheckinTime: () => ({
    hour: NotificationTime.CHECKIN_HOUR,
    minute: NotificationTime.CHECKIN_MINUTE,
    second: NotificationTime.CHECKIN_SECOND,
    label: `${NotificationTime.CHECKIN_HOUR.toString().padStart(2, '0')}:${NotificationTime.CHECKIN_MINUTE.toString().padStart(2, '0')}:${NotificationTime.CHECKIN_SECOND.toString().padStart(2, '0')}`
  }),
  
  // Lấy thời gian check-out
  getCheckoutTime: () => ({
    hour: NotificationTime.CHECKOUT_HOUR,
    minute: NotificationTime.CHECKOUT_MINUTE,
    second: NotificationTime.CHECKOUT_SECOND,
    label: `${NotificationTime.CHECKOUT_HOUR.toString().padStart(2, '0')}:${NotificationTime.CHECKOUT_MINUTE.toString().padStart(2, '0')}:${NotificationTime.CHECKOUT_SECOND.toString().padStart(2, '0')}`
  }),
  
  // Kiểm tra có phải thời gian check-in không
  isCheckinTime: (currentHour: number, currentMinute: number, currentSecond?: number) => {
    const hourMatch = currentHour === NotificationTime.CHECKIN_HOUR;
    const minuteMatch = currentMinute === NotificationTime.CHECKIN_MINUTE;
    const secondMatch = currentSecond === undefined || currentSecond === NotificationTime.CHECKIN_SECOND;
    
    // Chỉ log khi gần đến giờ check-in
    if (currentHour === 8 && currentMinute >= 0 && currentMinute <= 2) {
      console.log('🔍 Check-in time check:', {
        currentHour,
        currentMinute,
        currentSecond,
        targetHour: NotificationTime.CHECKIN_HOUR,
        targetMinute: NotificationTime.CHECKIN_MINUTE,
        targetSecond: NotificationTime.CHECKIN_SECOND,
        hourMatch,
        minuteMatch,
        secondMatch,
        result: hourMatch && minuteMatch && secondMatch
      });
    }
    
    return hourMatch && minuteMatch && secondMatch;
  },
  
  // Kiểm tra có phải thời gian check-out không
  isCheckoutTime: (currentHour: number, currentMinute: number, currentSecond?: number) => {
    const hourMatch = currentHour === NotificationTime.CHECKOUT_HOUR;
    const minuteMatch = currentMinute === NotificationTime.CHECKOUT_MINUTE;
    const secondMatch = currentSecond === undefined || currentSecond === NotificationTime.CHECKOUT_SECOND;
    
    // Chỉ log khi gần đến giờ check-out (trong vòng 5 phút trước giờ checkout)
    const targetMinute = NotificationTime.CHECKOUT_MINUTE;
    if (currentHour === NotificationTime.CHECKOUT_HOUR && currentMinute >= targetMinute - 2 && currentMinute <= targetMinute + 2) {
      console.log('🔍 Check-out time check:', {
        currentHour,
        currentMinute,
        currentSecond,
        targetHour: NotificationTime.CHECKOUT_HOUR,
        targetMinute: NotificationTime.CHECKOUT_MINUTE,
        targetSecond: NotificationTime.CHECKOUT_SECOND,
        hourMatch,
        minuteMatch,
        secondMatch,
        result: hourMatch && minuteMatch && secondMatch
      });
    }
    
    return hourMatch && minuteMatch && secondMatch;
  },
}
