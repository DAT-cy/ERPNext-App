// src/api/api.ts
import axios, { AxiosInstance, AxiosHeaders } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL, ENV_MODE } from "@env";

export const SID_KEY = "erpnext_sid";

const BASE_URL = API_URL;

console.log('🌍 API Environment:', {
  ENV_MODE,
  URL: BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

// Tạo axios instance dùng chung
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ""),
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000,
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
