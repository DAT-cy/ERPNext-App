# ERPNext-App - Cấu trúc sau Refactor

## Tổng quan
Dự án đã được cải tiến với việc phân tách các components trong màn hình ApplicationLeave thành các thành phần nhỏ hơn, có khả năng tái sử dụng cao hơn. Cấu trúc mới giúp cho việc maintain và mở rộng dễ dàng hơn.

## Lưu ý quan trọng
File `ApplicationLeave-Refactored.tsx` đã được đặt làm component chính thay thế cho `ApplicationLeave.tsx` thông qua cập nhật trong file `src/screens/index.ts`. Mọi thay đổi trong tương lai nên được thực hiện trên file `ApplicationLeave-Refactored.tsx` và các component con của nó.

## Các thành phần đã tách

### Components cơ bản
1. **DatePicker**: Component hiển thị bộ chọn ngày ở giữa màn hình
   - `src/components/DatePicker/DatePicker.tsx`
   
2. **DateInput**: Component input cho việc chọn ngày
   - `src/components/DateInput/DateInput.tsx`

3. **SelectInput**: Component cho dropdown menu
   - `src/components/SelectInput/SelectInput.tsx`

4. **FormField**: Component bao bọc cho các trường input
   - `src/components/FormField/FormField.tsx`

5. **FormSection**: Component cho các section của form
   - `src/components/FormSection/FormSection.tsx`

### Các thành phần của màn hình ApplicationLeave
1. **Header**: Phần header của màn hình
   - `src/screens/ApplicationLeave/Header.tsx`

2. **PersonalInfoSection**: Phần thông tin cá nhân
   - `src/screens/ApplicationLeave/PersonalInfoSection.tsx`

3. **LeaveDetailsSection**: Phần chi tiết nghỉ phép
   - `src/screens/ApplicationLeave/LeaveDetailsSection.tsx`

4. **ApprovalSection**: Phần phê duyệt
   - `src/screens/ApplicationLeave/ApprovalSection.tsx`

5. **FormActions**: Các nút tương tác ở cuối form
   - `src/screens/ApplicationLeave/FormActions.tsx`

### Utility Functions
- **Date Formatters**: Các hàm xử lý và định dạng ngày tháng
  - `src/utils/date/formatters.ts`

## Cách sử dụng
Sử dụng file `ApplicationLeave-Refactored.tsx` làm file chính thay thế cho `ApplicationLeave.tsx` hiện tại. File mới này import và tổ hợp tất cả các components đã được tách ra.

## Lợi ích của cấu trúc mới
1. **Dễ bảo trì**: Mỗi component đều có nhiệm vụ riêng biệt
2. **Tái sử dụng**: Các components như DatePicker, FormField, SelectInput có thể được tái sử dụng ở nhiều nơi
3. **Dễ test**: Có thể viết test cho từng component nhỏ
4. **Dễ mở rộng**: Thêm tính năng mới không ảnh hưởng đến toàn bộ hệ thống

## Hướng phát triển tiếp theo
1. Tích hợp hệ thống validation tốt hơn
2. Cải thiện UX của DatePicker
3. Thêm các animations mượt mà cho các modal
4. Tích hợp i18n cho đa ngôn ngữ