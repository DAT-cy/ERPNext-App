# ERPNext Mobile App

Ứng dụng mobile ERPNext được phát triển bằng React Native và Expo, cung cấp giao diện thân thiện để truy cập và quản lý hệ thống ERPNext từ thiết bị di động.

## 📋 Yêu cầu hệ thống

- **Node.js**: Version 18.x hoặc cao hơn
- **npm**: Version 8.x hoặc cao hơn
- **Expo CLI**: Version 6.x hoặc cao hơn
- **Git**: Để clone repository
- **Android Studio**: (Optional) Để chạy trên Android emulator
- **Xcode**: (Optional, chỉ MacOS) Để chạy trên iOS simulator

## 🚀 Hướng dẫn cài đặt

### Bước 1: Cài đặt Node.js

1. Truy cập [nodejs.org](https://nodejs.org/)
2. Tải phiên bản LTS (khuyến nghị)
3. Cài đặt theo hướng dẫn
4. Kiểm tra cài đặt:
   ```cmd
   node --version
   npm --version
   ```

### Bước 2: Clone repository

```bash
git clone https://github.com/DAT-cy/ERPNext-App.git
cd ERPNext-App
```

### Bước 3: Cài đặt dependencies

```bash
npm install
```

### Bước 4: Cấu hình môi trường

1. Tạo file `.env` trong thư mục gốc:
   ```env
   API_URL=https://your-erpnext-server.com
   ```

2. Thay thế `https://your-erpnext-server.com` bằng URL của ERPNext server của bạn.

### Bước 5: Khởi chạy ứng dụng

#### Cách 1: Sử dụng npm script
```bash
npm start
```

#### Cách 2: Sử dụng Expo CLI
```bash
npx expo start -c
```

#### Cách 3: Sử dụng batch file (Windows)
```cmd
.\run-expo.bat
```

## 📱 Chạy ứng dụng trên thiết bị

### Trên điện thoại Android/iOS:
1. Cài đặt **Expo Go** từ Play Store/App Store
2. Scan QR code hiển thị trong terminal
3. Ứng dụng sẽ tự động tải và chạy

### Trên web browser:
1. Nhấn `w` trong terminal Expo
2. Ứng dụng sẽ mở trong browser

### Trên Android Emulator:
1. Cài đặt Android Studio
2. Tạo và khởi chạy emulator
3. Nhấn `a` trong terminal Expo

### Trên iOS Simulator (chỉ MacOS):
1. Cài đặt Xcode
2. Nhấn `i` trong terminal Expo

## 🛠️ Scripts có sẵn

```json
{
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios", 
  "web": "expo start --web",
  "build": "expo build",
  "env:dev": "node scripts/set-env.js development",
  "env:prod": "node scripts/set-env.js production"
}
```

## 🔧 Xử lý sự cố

### Lỗi "node is not recognized"
**Windows:**
1. Mở PowerShell với quyền Administrator
2. Chạy: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Hoặc sử dụng file `run-expo.bat` đã cung cấp

**MacOS/Linux:**
```bash
export PATH=$PATH:/usr/local/bin
```

### Lỗi "execution policy"
**Windows PowerShell:**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Cache issues
```bash
npx expo start -c
# hoặc
npm start -- --clear
```

### Metro bundler issues
```bash
npx expo r -c
# hoặc nhấn 'r' trong terminal rồi 'c'
```

## 📁 Cấu trúc dự án

```
ERPNext-App/
├── src/
│   ├── components/          # Các component tái sử dụng
│   ├── screens/            # Các màn hình chính
│   ├── navigation/         # Cấu hình navigation
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles
├── assets/                # Hình ảnh, fonts, icons
├── .env                   # Environment variables
├── app.json              # Expo configuration
├── package.json          # Dependencies và scripts
└── README.md            # Tài liệu này
```

## 🔑 Biến môi trường

Tạo file `.env` với các biến sau:

```env
# API Configuration
API_URL=https://your-erpnext-server.com

# Environment
NODE_ENV=development

# App Configuration  
APP_NAME=ERPNext Mobile App
APP_VERSION=1.0.0

# Development Settings (optional)
DEBUG=true
LOG_LEVEL=debug
```

## 📚 Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [ERPNext API Documentation](https://frappeframework.com/docs/user/en/api)

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy tạo issue trên GitHub hoặc liên hệ:
- Email: support@yourcompany.com
- GitHub Issues: [ERPNext-App Issues](https://github.com/DAT-cy/ERPNext-App/issues)

---

**Phát triển bởi**: DAT-cy Team  
**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: September 2025
