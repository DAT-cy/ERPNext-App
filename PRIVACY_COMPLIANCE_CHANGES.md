# Thay đổi Code để Tuân thủ Google Play Data Safety

## ✅ Đã thực hiện

### 1. Tắt OTA Updates (expo-updates)
**File**: `src/components/ForceUpdateGate/ForceUpdateGate.tsx`
- ✅ Disabled hoàn toàn chức năng OTA updates để giảm thu thập Device IDs
- ✅ Thêm comments giải thích về privacy compliance
- ✅ Code vẫn được giữ lại (commented) để dễ enable lại sau nếu cần

**File**: `android/app/src/main/AndroidManifest.xml`
- ✅ Đặt `expo.modules.updates.ENABLED` = `false`
- ✅ Đặt `EXPO_UPDATES_CHECK_ON_LAUNCH` = `NEVER`
- ✅ Thêm comments giải thích

### 2. Thêm Privacy Documentation
**File**: `src/services/notificationService.tsx`
- ✅ Thêm JSDoc comments giải thích về Device ID collection
- ✅ Document rõ mục đích thu thập (App functionality)
- ✅ Document về data sharing và retention

### 3. Tối ưu Notification Service
- ✅ Thêm comments giải thích khi nào Device ID được thu thập
- ✅ Clarify rằng Device ID chỉ thu thập khi permission được granted

---

## ⚠️ Vẫn còn thu thập Device IDs

### expo-notifications (KHÔNG THỂ TẮT)
**Lý do**: Chức năng push notifications CẦN Device ID (Expo Push Token)

**File liên quan**: 
- `src/services/notificationService.tsx`
- `package.json` - `expo-notifications` dependency

**Giải pháp**: Phải khai báo trên Google Play Console (xem `DATA_SAFETY_GUIDE.md`)

---

## 📋 Bước tiếp theo - BẮT BUỘC

### Bạn VẪN PHẢI khai báo trên Google Play Console

1. **Vào Google Play Console** → Remak app → **Policy** → **App content** → **Data safety**

2. **Khai báo Device IDs collection**:
   - Data type: **Device or Other IDs**
   - Purpose: **App functionality** (push notifications)
   - Is collected: **YES**
   - Is shared: **NO** (trừ khi bạn chia sẻ với bên thứ 3)
   - Why collected: **To send notifications or alerts**

3. **Submit để Google review lại**

📖 Xem hướng dẫn chi tiết trong file `DATA_SAFETY_GUIDE.md`

---

## 🔄 Nếu bạn cần bật lại OTA Updates

Nếu sau này bạn muốn bật lại OTA updates:

1. **File**: `android/app/src/main/AndroidManifest.xml`
   - Đổi `expo.modules.updates.ENABLED` = `"true"`
   - Đổi `EXPO_UPDATES_CHECK_ON_LAUNCH` = `"ALWAYS"`

2. **File**: `src/components/ForceUpdateGate/ForceUpdateGate.tsx`
   - Uncomment code trong useEffect

3. **QUAN TRỌNG**: Phải khai báo Device ID collection cho expo-updates trên Google Play Console

---

## 📊 Tổng kết

| SDK | Device ID Collection | Status | Action Required |
|-----|---------------------|--------|----------------|
| expo-notifications | ✅ Có (Push Token) | Required | Khai báo trên Google Play |
| expo-updates | ❌ Đã tắt | Disabled | Không cần khai báo |

---

## ✅ Lợi ích

1. **Giảm thiểu thu thập**: Tắt expo-updates giảm một nguồn thu thập Device IDs
2. **Code documentation**: Thêm comments rõ ràng về privacy compliance
3. **Dễ maintain**: Code được comment để dễ enable lại sau
4. **Compliance ready**: Code đã sẵn sàng sau khi khai báo trên Google Play

---

## ⚠️ Lưu ý quan trọng

**KHÔNG THỂ loại bỏ hoàn toàn Device ID collection** vì:
- Push notifications CẦN Device ID để hoạt động
- Đây là chức năng cốt lõi của app

**Giải pháp duy nhất** là khai báo đúng trên Google Play Console theo hướng dẫn trong `DATA_SAFETY_GUIDE.md`.

