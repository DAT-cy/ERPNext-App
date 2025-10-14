# ERPNext React Native App - Build & Deploy Guide

## Tổng quan
Hướng dẫn build và deploy ứng dụng React Native lên iOS thông qua EAS Build và TestFlight.

## Yêu cầu hệ thống
- Node.js (v16+)
- EAS CLI
- Apple Developer Account
- Xcode (nếu build local)

## Cài đặt EAS CLI
```bash
npm install -g @expo/eas-cli
```

## Cấu hình dự án

### 1. Cấu hình app.json
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/your-icon.jpg",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "owner": "your-expo-username",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "buildNumber": "1",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "package": "com.yourcompany.yourapp",
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 2. Cấu hình eas.json
```json
{
  "cli": {
    "version": ">= 16.20.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true,
        "distribution": "internal"
      }
    },
    "ios-device": {
      "ios": {
        "simulator": false,
        "distribution": "internal"
      }
    },
    "ios-testflight": {
      "ios": {
        "simulator": false,
        "distribution": "store"
      }
    },
    "production": {
      "ios": {
        "distribution": "store"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Quy trình Build & Deploy

### Bước 1: Đăng nhập EAS
```bash
eas login
```

### Bước 2: Build cho iOS Simulator (Test nhanh)
```bash
eas build --platform ios --profile preview
```

### Bước 3: Build cho thiết bị thật (Internal Distribution)
```bash
eas build --platform ios --profile ios-device
```

### Bước 4: Build cho TestFlight (Store Distribution)
```bash
eas build --platform ios --profile production
```

### Bước 5: Submit lên TestFlight
```bash
eas submit --platform ios
```

## Thiết lập TestFlight

### 1. Truy cập App Store Connect
- Link: https://appstoreconnect.apple.com
- Đăng nhập bằng Apple Developer Account

### 2. Thiết lập thông tin Company
- Vào "Agreements, Tax, and Banking"
- Cập nhật "Legal Entity Name" (Company Name)
- Hoặc tạo app mới với thông tin đầy đủ

### 3. Thêm Internal Testers
- Vào tab "TestFlight"
- Click "Internal Testing"
- Click "+" để thêm tester
- Nhập email Apple ID
- Click "Start Testing"

### 4. Nhận email invite
- Apple gửi email đến địa chỉ đã thêm
- **Mở email trên iPhone** (không phải máy tính)
- Click link → tự động mở TestFlight
- Accept invitation → Install app

## Các lệnh hữu ích

### Kiểm tra trạng thái build
```bash
eas build:list
```

### Xem chi tiết build
```bash
eas build:view [BUILD_ID]
```

### Kiểm tra trạng thái submit
```bash
eas submit:list
```

### Cập nhật version
```bash
# Tăng version trong app.json
"version": "1.0.1"
"buildNumber": "2"
```

## Xử lý lỗi thường gặp

### 1. Lỗi "companyName missing"
- Cập nhật thông tin Company trong App Store Connect
- Hoặc tạo app mới với thông tin đầy đủ

### 2. Lỗi "Input is required, but stdin is not readable"
- Mở Command Prompt/PowerShell mới
- Chạy lệnh trong terminal mới

### 3. Lỗi "Credentials are not set up"
- Chạy lệnh trong interactive mode
- Chọn "Yes" khi được hỏi về Apple account
- Chọn "Website - generates a registration URL" cho UDID

### 4. Không nhận được email invite
- Kiểm tra Spam/Junk folder
- Đảm bảo email đúng Apple ID
- Mở email trên iPhone (không phải máy tính)

## Timeline thực tế
- **Build**: 10-15 phút
- **Apple xử lý**: 5-10 phút
- **TestFlight setup**: 2-3 phút
- **Nhận email**: 1-2 phút
- **Tổng thời gian**: ~20-30 phút

## Lưu ý quan trọng
- ✅ Luôn mở email invite trên iPhone
- ✅ Cài TestFlight app trước từ App Store
- ✅ Sử dụng Apple ID đã đăng ký
- ❌ Không mở email trên máy tính
- ❌ Không sử dụng package `testflight` (không chính thức)

## Liên kết hữu ích
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Expo Documentation](https://docs.expo.dev/)

## Cấu trúc thư mục