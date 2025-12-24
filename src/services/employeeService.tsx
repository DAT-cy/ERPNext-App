// src/services/employeeService.tsx
import { api } from "../config/api";
import { getLoggedUser, getEmployeeCodeByEmail } from "./authService";
import { EmployeeProfile } from "../types/employee.types";
import { handleServiceError, handleServiceThrow } from "../utils/error/ErrorHandler";
import * as SecureStore from "expo-secure-store";

// Helper function to get base URL
export function getBaseURL(): string {
  const API_URL = process.env.API_URL || 'https://we.remak.vn';
  return API_URL.replace(/\/$/, '');
}

// Helper function to get CSRF token
async function getCSRFToken(): Promise<string | null> {
  try {
    const sid = await SecureStore.getItemAsync('erpnext_sid');
    if (!sid) return null;

    const response = await fetch(`${getBaseURL()}/api/method/frappe.client.get_csrf_token`, {
      headers: { Cookie: `sid=${sid}`, 'Expect': '' },
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      return data.message || null;
    }
    return null;
  } catch (error) {
    console.warn('Failed to get CSRF token:', error);
    return null;
  }
}

// Hàm lấy thông tin profile của nhân viên hiện tại
export async function getEmployeeProfile(): Promise<EmployeeProfile | null> {
  try {
    console.log('🔍 [getEmployeeProfile] Starting function...');

    // Bước 1: Lấy employee code của user hiện tại
    const employeeCode = await getEmployeeCodeByEmail();
    console.log('✅ [getEmployeeProfile] Got employee code:', employeeCode);

    if (!employeeCode) {
      console.warn('⚠️ [getEmployeeProfile] No employee code found for current user');
      return null;
    }

    // Bước 2: Lấy thông tin chi tiết của employee
    console.log('🔍 [getEmployeeProfile] Fetching full profile for employee:', employeeCode);
    const res = await api.get(`/api/resource/Employee/${employeeCode}`);

    console.log('🔍 [getEmployeeProfile] Full profile response:', res.data);

    if (res.data && res.data.data) {
      const employee = res.data.data;
      console.log('✅ [getEmployeeProfile] Found employee profile:', employee);
      return employee as EmployeeProfile;
    } else {
      console.warn('⚠️ [getEmployeeProfile] No profile data found');
      return null;
    }
  } catch (error: any) {
    console.error('❌ [getEmployeeProfile] Error:', error);
    handleServiceError(error, 'Lỗi khi lấy thông tin nhân viên');
    return null;
  }
}

// Hàm cập nhật thông tin profile nhân viên
export async function updateEmployeeProfile(employeeName: string, updates: Partial<EmployeeProfile>): Promise<boolean> {
  try {
    console.log('🔄 [updateEmployeeProfile] Starting update for employee:', employeeName, updates);

    // Lấy SID từ SecureStore
    const sid = await SecureStore.getItemAsync('erpnext_sid');
    if (!sid) {
      throw new Error('No session found');
    }

    // Sử dụng XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${getBaseURL()}/api/resource/Employee/${employeeName}`);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Cookie', `sid=${sid}`);

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('✅ [updateEmployeeProfile] Profile updated successfully');
            resolve(true);
          } else {
            console.warn('⚠️ [updateEmployeeProfile] Update failed with status:', xhr.status, xhr.responseText);
            resolve(false);
          }
        } catch (error) {
          console.error('❌ [updateEmployeeProfile] Error parsing response:', error);
          resolve(false);
        }
      };

      xhr.onerror = () => {
        console.error('❌ [updateEmployeeProfile] Network error');
        resolve(false);
      };

      xhr.timeout = 30000;
      xhr.ontimeout = () => {
        console.error('❌ [updateEmployeeProfile] Timeout');
        resolve(false);
      };

      xhr.send(JSON.stringify(updates));
    });

  } catch (error: any) {
    console.error('❌ [updateEmployeeProfile] Error:', error);
    handleServiceError(error, 'Lỗi khi cập nhật thông tin nhân viên');
    return false;
  }
}

// Hàm upload ảnh đại diện
export async function uploadEmployeeAvatar(employeeName: string, imageUri: string): Promise<string | null> {
  try {
    console.log('📤 [uploadEmployeeAvatar] Starting upload for employee:', employeeName);

    // Lấy SID từ SecureStore
    const sid = await SecureStore.getItemAsync('erpnext_sid');
    if (!sid) {
      throw new Error('No session found');
    }

    // Tạo FormData
    const formData = new FormData();

    // Tạo file object với tên và type
    const fileName = `avatar_${Date.now()}.jpg`;
    const file = {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
    };

    formData.append('file', file as any);
    formData.append('is_private', '0');
    formData.append('folder', 'Home/Attachments');

    console.log('📤 [uploadEmployeeAvatar] Uploading file:', fileName);

    // Sử dụng XMLHttpRequest thay vì axios cho upload file
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', `${getBaseURL()}/api/method/upload_file`);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Cookie', `sid=${sid}`);

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('📤 [uploadEmployeeAvatar] Upload response:', response);

          if (response.message && response.message.file_url) {
            const fileUrl = response.message.file_url;
            console.log('✅ [uploadEmployeeAvatar] Avatar uploaded successfully:', fileUrl);

            // Cập nhật field image của employee
            updateEmployeeProfile(employeeName, { image: fileUrl })
              .then((updateSuccess) => {
                if (updateSuccess) {
                  resolve(fileUrl);
                } else {
                  console.warn('⚠️ [uploadEmployeeAvatar] Failed to update employee profile with image');
                  resolve(null);
                }
              })
              .catch((error) => {
                console.error('❌ [uploadEmployeeAvatar] Error updating profile:', error);
                resolve(null);
              });
          } else {
            console.warn('⚠️ [uploadEmployeeAvatar] Upload response not as expected:', response);
            resolve(null);
          }
        } catch (error) {
          console.error('❌ [uploadEmployeeAvatar] Error parsing response:', error);
          resolve(null);
        }
      };

      xhr.onerror = () => {
        console.error('❌ [uploadEmployeeAvatar] Network error');
        resolve(null);
      };

      xhr.timeout = 60000; // 60 seconds
      xhr.ontimeout = () => {
        console.error('❌ [uploadEmployeeAvatar] Timeout');
        resolve(null);
      };

      xhr.send(formData);
    });

  } catch (error: any) {
    console.error('❌ [uploadEmployeeAvatar] Error:', error);
    handleServiceError(error, 'Lỗi khi upload ảnh đại diện');
    return null;
  }
}