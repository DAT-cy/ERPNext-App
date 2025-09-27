# 🗺️ SƠ ĐỒ LUỒNG ĐIỀU HƯỚNG - BOTTOM TAB "TRANG CHỦ"

## 📋 **Tổng quan luồng:**
```
User nhấn "Trang chủ" → HomeScreen hiển thị
```

---

## 🔄 **Luồng chi tiết từng bước:**

### **1. 👆 USER ACTION**
```
📱 User nhấn vào bottom tab "Trang chủ"
```

### **2. 🎯 UI COMPONENT** 
```
📁 /src/components/TabBar/BottomTabBar.tsx
│
├── TouchableOpacity được nhấn
├── onPress={() => onTabPress(tab.key)} 
└── Gọi onTabPress('home')
```

### **3. 🪝 HOOK LAYER**
```
📁 /src/hooks/useBottomTabBar.tsx
│
├── handleBottomTabPress('home') được gọi
├── console.log('🔥 Bottom tab pressed: home')
├── originalHandleBottomTabPress('home') - cập nhật state
├── menuRouterController.handleBottomTabNavigation('home')
└── onTabChange?('home') - callback nếu có
```

### **4. 🎮 CONTROLLER LAYER**
```
📁 /src/router/MenuRouterController.ts
│
├── handleBottomTabNavigation('home') được gọi
├── menuRouter.navigateByBottomTab('home')
└── return boolean (success/failure)
```

### **5. 🛤️ ROUTER LAYER**
```
📁 /src/router/MenuRouter.ts
│
├── navigateByBottomTab('home') được gọi
├── routeKey = 'bottom:home'
├── routeInfo = MENU_ROUTE_MAP['bottom:home']
├── routeInfo = { routeName: 'Home' }
├── this.navigate('Home', params)
└── console.log('🚀 Điều hướng bottom tab: home -> Home')
```

### **6. 🧭 NAVIGATION SYSTEM**
```
📁 /src/router/MenuRouter.ts (navigate method)
│
├── navigationRef.current.navigate()
├── name: 'Home'
├── params: undefined
└── React Navigation thực hiện điều hướng
```

### **7. 📱 NAVIGATION CONTAINER**
```
📁 /src/App.tsx
│
├── NavigationContainer với ref={navigationRef}
├── Nhận lệnh navigate từ navigationRef
└── Chuyển sang stack route 'Home'
```

### **8. 🏗️ APP NAVIGATOR**
```
📁 /src/navigation/AppNavigator.tsx
│
├── Stack.Navigator nhận route 'Home'
├── <Stack.Screen name="Home" component={HomeScreen} />
└── Render HomeScreen component
```

### **9. 🏠 TARGET SCREEN**
```
📁 /src/screens/HomeScreen.tsx
│
├── HomeScreen component được mount
├── useAuth, useScreenTabBar, useCheckin hooks chạy
├── Load checkin data, location, render UI
└── ✅ Màn hình HomeScreen hiển thị
```

---

## 📊 **Sơ đồ trực quan:**

```
[User] 👆 Click "Trang chủ"
   ↓
[BottomTabBar.tsx] 🎯 onTabPress('home')
   ↓  
[useBottomTabBar.tsx] 🪝 handleBottomTabPress('home')
   ↓
[MenuRouterController.ts] 🎮 handleBottomTabNavigation('home')
   ↓
[MenuRouter.ts] 🛤️ navigateByBottomTab('home')
   ↓
[MenuRouter.ts] 🧭 navigate('Home')
   ↓
[App.tsx] 📱 NavigationContainer
   ↓
[AppNavigator.tsx] 🏗️ Stack.Navigator
   ↓
[HomeScreen.tsx] 🏠 Component rendered
   ↓
[User] 👀 Thấy HomeScreen
```

---

## 🔗 **Các file liên quan:**

### **Core Navigation Files:**
1. `/src/components/TabBar/BottomTabBar.tsx` - UI Component
2. `/src/hooks/useBottomTabBar.tsx` - Business Logic Hook  
3. `/src/router/MenuRouterController.ts` - Navigation Controller
4. `/src/router/MenuRouter.ts` - Router với MENU_ROUTE_MAP
5. `/src/App.tsx` - Navigation Container Setup
6. `/src/navigation/AppNavigator.tsx` - Stack Navigator Definition
7. `/src/screens/HomeScreen.tsx` - Target Screen

### **Supporting Files:**
- `/src/hooks/useTabBarHandlers.tsx` - Tab state management
- `/src/config/defaultTabs.ts` - Tab configurations
- `/src/router/ScreenNavigator.tsx` - Screen navigator utilities

---

## ⚡ **Debug Console Log Flow:**
```
🔥 Bottom tab pressed: home
🚀 Điều hướng bottom tab: home -> Home  
✅ Navigation successful for tab: home
```

---

## 🎯 **Key Points:**
- **Single Responsibility**: Mỗi file có nhiệm vụ riêng biệt
- **Loose Coupling**: Các layer giao tiếp qua interfaces
- **Centralized Routing**: MENU_ROUTE_MAP quản lý tất cả routes
- **Type Safety**: TypeScript đảm bảo type safety
- **Debugging**: Console logs để track navigation flow