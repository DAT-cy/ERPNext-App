// src/api/api.ts
import axios, { AxiosInstance, AxiosHeaders } from "axios";
import * as SecureStore from "expo-secure-store";
import NetInfo from '@react-native-community/netinfo';
import { API_URL } from "@env";

export const SID_KEY = "erpnext_sid";

// Test function để verify domain accessibility trên mobile data
export const testDomainAccessibility = async (): Promise<{
  success: boolean;
  error?: string;
  networkType?: string;
  responseTime?: number;
}> => {
  const startTime = Date.now();
  try {
    const networkState = await NetInfo.fetch();
    console.log('🧪 Testing domain accessibility on:', networkState.type);
    
    // Simple fetch test tới domain chính
    const response = await fetch(`${BASE_URL}/api/method/ping`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RemakApp-Test/1.0',
        'Cache-Control': 'no-cache'
      },
      // Không set timeout quá ngắt để test mobile data
    });
    
    const responseTime = Date.now() - startTime;
    console.log('✅ Domain accessibility test success:', {
      status: response.status,
      networkType: networkState.type,
      responseTime: `${responseTime}ms`
    });
    
    return {
      success: true,
      networkType: networkState.type,
      responseTime
    };
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    const networkState = await NetInfo.fetch();
    
    console.log('❌ Domain accessibility test failed:', {
      error: error.message,
      networkType: networkState.type,
      responseTime: `${responseTime}ms`
    });
    
    return {
      success: false,
      error: error.message,
      networkType: networkState.type,
      responseTime
    };
  }
};

// Robust API_URL handling with multiple fallbacks for mobile data
let BASE_URL: string;
const FALLBACK_URLS = [
  "https://we.remak.vn",
  "https://we.remak.vn:443", // Explicit HTTPS port
  // Có thể thêm IP backup nếu biết: "https://1.2.3.4"
];

try {
  BASE_URL = API_URL || FALLBACK_URLS[0];
  if (typeof BASE_URL !== 'string' || BASE_URL.trim() === '') {
    BASE_URL = FALLBACK_URLS[0];
  }
  console.log('📡 Using BASE_URL for mobile data:', BASE_URL);
} catch (error) {
  console.warn('⚠️ Error loading API_URL from env, using fallback:', error);
  BASE_URL = FALLBACK_URLS[0];
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

// Tạo axios instance dùng chung - tối ưu cho mobile data với retry logic
export const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: { 
    Accept: "application/json", 
    "Content-Type": "application/json",
    "User-Agent": "RemakApp/1.0 (Mobile)", // Thêm User-Agent
    "Cache-Control": "no-cache", // Tránh cache issues trên mobile data
  },
  withCredentials: true,
  timeout: 15000, // Tăng timeout cho mobile data (15s)
  maxRedirects: 5, // Cho phép redirects
});

// Retry logic cho mobile data
const retryRequest = async (error: any): Promise<any> => {
  const config = error.config;
  const networkState = await NetInfo.fetch();
  
  // Chỉ retry nếu:
  // 1. Đang dùng cellular/mobile data
  // 2. Lỗi network hoặc timeout  
  // 3. Chưa retry quá 2 lần
  if (
    networkState.type === 'cellular' &&
    (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') &&
    (!config.__retryCount || config.__retryCount < 2)
  ) {
    config.__retryCount = (config.__retryCount || 0) + 1;
    console.log(`🔄 Retrying request on mobile data (attempt ${config.__retryCount}/2):`, config.url);
    
    // Tăng timeout cho retry
    config.timeout = config.timeout * 1.5;
    
    // Đợi 1 giây trước khi retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return api.request(config);
  }
  
  return Promise.reject(error);
};

// Thêm interceptor cho request với network debugging và mobile data detection
api.interceptors.request.use(async (config) => {
  // Kiểm tra network state
  const networkState = await NetInfo.fetch();
  console.log('📶 Network State:', {
    type: networkState.type, // wifi, cellular, none, etc.
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    details: networkState.details
  });

  console.log('🌐 API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    timeout: config.timeout,
    networkType: networkState.type
  });

  // Tăng timeout nếu đang dùng cellular
  if (networkState.type === 'cellular') {
    config.timeout = 20000; // 20s cho cellular
    console.log('📱 Using cellular network, increased timeout to 20s');
  }

  const sid = await SecureStore.getItemAsync(SID_KEY);
  if (!config.headers) config.headers = new AxiosHeaders();
  else if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = AxiosHeaders.from(config.headers);
  }
  const h = config.headers as AxiosHeaders;
  h.set("Accept", "application/json");
  h.set("Content-Type", "application/json");
  
  // Thêm headers đặc biệt cho mobile data
  if (networkState.type === 'cellular') {
    h.set("Connection", "keep-alive");
    h.set("Accept-Encoding", "gzip, deflate");
  }
  
  if (sid) h.set("Cookie", `sid=${sid}`);
  return config;
});

// Thêm interceptor cho response để debug lỗi network và mobile data issues
api.interceptors.response.use(
  async (response) => {
    const networkState = await NetInfo.fetch();
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      networkType: networkState.type,
      responseTime: Date.now() - (response.config as any).requestStartTime
    });
    return response;
  },
  async (error) => {
    const networkState = await NetInfo.fetch();
    
    // Detailed mobile data error logging
    const errorInfo = {
      url: error.config?.url,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      networkType: networkState.type,
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      isNetworkError: error.code === 'NETWORK_ERROR' || error.message.includes('Network Error'),
      isTimeoutError: error.code === 'ECONNABORTED' || error.message.includes('timeout'),
      isMobileDataIssue: networkState.type === 'cellular' && !networkState.isInternetReachable
    };
    
    console.log('❌ API Response Error (Mobile Data Debug):', errorInfo);
    
    // Specific mobile data error messages
    if (errorInfo.isMobileDataIssue) {
      console.log('📱 MOBILE DATA ISSUE DETECTED:');
      console.log('- Network type: cellular');
      console.log('- Internet not reachable via cellular');
      console.log('- Possible causes: Carrier blocking, DNS issues, or APN settings');
    }
    
    if (errorInfo.isTimeoutError && networkState.type === 'cellular') {
      console.log('⏱️ CELLULAR TIMEOUT: Mobile data may be slow or unstable');
    }
    
    // Thử retry nếu có thể
    try {
      return await retryRequest(error);
    } catch (retryError) {
      return Promise.reject(retryError);
    }
  }
);
