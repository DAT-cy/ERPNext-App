# Hướng dẫn khai báo Data Safety trên Google Play Console

## Vấn đề
Google Play đã phát hiện app thu thập **Device IDs** nhưng chưa được khai báo trong Data Safety form.

## Nguyên nhân
App sử dụng các SDK sau thu thập Device IDs:
- **expo-notifications**: Thu thập Expo Push Token (dựa trên Device ID) để gửi push notifications
- **expo-updates**: Có thể thu thập device information cho OTA updates

## Cách khắc phục - Cập nhật Data Safety Form

### Bước 1: Truy cập Data Safety form
1. Đăng nhập vào [Google Play Console](https://play.google.com/console)
2. Chọn app **Remak (com.remak.app)**
3. Đi tới: **Policy > App content > Data safety**

### Bước 2: Khai báo Device IDs collection

#### 2.1. Trả lời câu hỏi về Data Collection
- **Question**: "Does your app collect or share any of the required user data types?"
- **Answer**: Chọn **YES**

#### 2.2. Trong phần "Data types", tìm và chọn:
- **Category**: Device or Other IDs
- **Data type**: Device or Other IDs (bao gồm Android ID, Advertising ID, IMEI, v.v.)

#### 2.3. Khai báo cách thu thập và sử dụng:

**"How is this data used?"**
- ✅ Chọn: **App functionality** (vì push notifications là chức năng của app)

**"Is this data collected?"**
- ✅ Chọn: **YES**

**"Is this data shared?"**
- ✅ Chọn: **NO** (hoặc khai báo nếu bạn chia sẻ với third-party)

**"Why is this data collected?"**
- ✅ Chọn: **To send notifications or alerts** (hoặc tương tự)

**"Is collection of this data required, or can users choose to skip it?"**
- ⚠️ Chọn: **Required** (vì push notifications cần Device ID) 
  - HOẶC **Optional** nếu bạn cho phép user từ chối notifications

**"How is this data handled?"**
- ✅ Chọn: **Data is encrypted in transit** (Expo sử dụng HTTPS)

**"Data retention"**
- ✅ Chọn: **As long as the app is installed** (hoặc theo chính sách của bạn)

### Bước 3: Khai báo cho Expo SDKs (nếu cần)

Nếu Google Play yêu cầu khai báo SDK cụ thể, bạn có thể thêm:

**SDK Provider**: Expo (hoặc EAS)
- SDK name: expo-notifications, expo-updates
- Purpose: App functionality (push notifications, OTA updates)

### Bước 4: Kiểm tra các Data Types khác

Đảm bảo bạn cũng khai báo các loại data khác nếu app thu thập:
- ✅ **Location data** (vì app sử dụng `expo-location` cho check-in)
- ✅ **Photos or videos** (nếu app chụp ảnh cho inventory)
- ✅ **Personal info** (nếu app thu thập thông tin người dùng)

### Bước 5: Submit để Google review
1. Sau khi hoàn tất khai báo, click **Save**
2. Quay lại **Dashboard > Publishing overview**
3. Click **Send for review** để Google xem xét lại

---

## Thông tin chi tiết về SDKs thu thập Device IDs

### expo-notifications
- **Thu thập**: Expo Push Token (được tạo từ Device ID)
- **Mục đích**: Gửi push notifications cho reminders chấm công
- **File liên quan**: `src/services/notificationService.tsx`

### expo-updates  
- **Thu thập**: Device information (có thể)
- **Mục đích**: Kiểm tra và cài đặt OTA updates
- **File liên quan**: `src/components/ForceUpdateGate/ForceUpdateGate.tsx`

---

## Lưu ý quan trọng

1. **Privacy Policy**: Đảm bảo Privacy Policy của bạn cũng đề cập đến việc thu thập Device IDs
2. **User consent**: Nếu cần, thêm consent dialog cho notifications
3. **Minimize data**: Chỉ thu thập data cần thiết

## Tài liệu tham khảo

- [Google Play Data Safety Policy](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)

---

## Nếu vẫn bị reject

Nếu sau khi khai báo mà vẫn bị reject, kiểm tra:
1. Có SDK nào khác đang thu thập Device IDs không?
2. Privacy Policy có cập nhật đúng không?
3. Kiểm tra Google Play SDK Index để xem các SDK bạn dùng có guidance về Data Safety không

