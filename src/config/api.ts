// src/api/api.ts
import axios, { AxiosInstance, AxiosHeaders } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@env";

export const SID_KEY = "erpnext_sid";

// Robust API_URL handling with multiple fallbacks
let BASE_URL: string;
try {
  BASE_URL = API_URL || "https://we.remak.vn";
  if (typeof BASE_URL !== 'string' || BASE_URL.trim() === '') {
    BASE_URL = "https://we.remak.vn";
  }
} catch (error) {
  console.warn('Error loading API_URL from env:', error);
  BASE_URL = "https://we.remak.vn";
}

console.log('🌍 API Environment:', {
  URL: BASE_URL,
  API_URL_FROM_ENV: API_URL,
  BASE_URL_TYPE: typeof BASE_URL
});

// Safe baseURL processing with null checks
const getBaseURL = () => {
  if (!BASE_URL || typeof BASE_URL !== 'string') {
    return "https://we.remak.vn";
  }
  return BASE_URL.replace(/\/$/, "");
};

// Tạo axios instance dùng chung - siêu tối ưu
export const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  timeoutErrorMessage: "Request timeout - Vui lòng kiểm tra kết nối mạng",
});

// Thêm interceptor cho request
api.interceptors.request.use(async (config) => {
  const sid = await SecureStore.getItemAsync(SID_KEY);
  if (!config.headers) config.headers = new AxiosHeaders();
  else if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = AxiosHeaders.from(config.headers);
  }
  const h = config.headers as AxiosHeaders;
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  if (sid) h.set("Cookie", `sid=${sid}`);
  return config;
});
