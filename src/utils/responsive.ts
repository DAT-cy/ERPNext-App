// src/utils/responsive.ts
import { Dimensions, PixelRatio, Platform } from 'react-native';

// Lấy kích thước màn hình
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Kích thước thiết kế chuẩn (iPhone 11/12/13/14)
const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;

// Tính toán tỷ lệ scale
const widthScale = SCREEN_WIDTH / DESIGN_WIDTH;
const heightScale = SCREEN_HEIGHT / DESIGN_HEIGHT;

/**
 * Responsive Width - Tính toán chiều rộng theo tỷ lệ phần trăm
 * @param percentage - Phần trăm chiều rộng màn hình (0-100)
 */
export const wp = (percentage: number): number => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

/**
 * Responsive Height - Tính toán chiều cao theo tỷ lệ phần trăm
 * @param percentage - Phần trăm chiều cao màn hình (0-100)
 */
export const hp = (percentage: number): number => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

/**
 * Responsive Font Size - Scale font size theo kích thước màn hình
 * @param size - Kích thước font gốc
 */
export const fs = (size: number): number => {
  const scale = Math.min(widthScale, heightScale);
  const newSize = size * scale;
  
  // Giới hạn scale không quá nhỏ hoặc quá lớn
  const minScale = 0.85;
  const maxScale = 1.3;
  const limitedScale = Math.max(minScale, Math.min(maxScale, scale));
  
  return Math.round(PixelRatio.roundToNearestPixel(size * limitedScale));
};

/**
 * Responsive Size - Scale kích thước (padding, margin, etc.) theo màn hình
 * @param size - Kích thước gốc
 */
export const ss = (size: number): number => {
  const scale = Math.min(widthScale, heightScale);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Device Detection
export const isSmallScreen = (): boolean => SCREEN_WIDTH < 375;
export const isMediumScreen = (): boolean => SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeScreen = (): boolean => SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768;
export const isTablet = (): boolean => SCREEN_WIDTH >= 768;

// Orientation Detection
export const isPortrait = (): boolean => SCREEN_HEIGHT > SCREEN_WIDTH;
export const isLandscape = (): boolean => SCREEN_WIDTH > SCREEN_HEIGHT;

// Device Info Object
export const deviceInfo = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallScreen(),
  isMedium: isMediumScreen(),
  isLarge: isLargeScreen(),
  isTablet: isTablet(),
  isPortrait: isPortrait(),
  isLandscape: isLandscape(),
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

// Responsive Breakpoints
export const breakpoints = {
  xs: 0,      // < 375px - iPhone SE, small phones
  sm: 375,    // 375px - iPhone 6/7/8
  md: 414,    // 414px - iPhone Plus, XR
  lg: 768,    // 768px - iPad Portrait
  xl: 1024,   // 1024px - iPad Landscape
  xxl: 1200,  // 1200px - Large tablets
};

// Get current breakpoint
export const getCurrentBreakpoint = (): string => {
  const width = SCREEN_WIDTH;
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints.xxl) return 'xl';
  return 'xxl';
};

// Responsive utilities for common use cases
export const getResponsiveValue = (values: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}): number => {
  const currentBreakpoint = getCurrentBreakpoint();
  
  // Return value for current breakpoint or fallback to smaller ones
  switch (currentBreakpoint) {
    case 'xxl':
      return values.xxl || values.xl || values.lg || values.md || values.sm || values.xs || 0;
    case 'xl':
      return values.xl || values.lg || values.md || values.sm || values.xs || 0;
    case 'lg':
      return values.lg || values.md || values.sm || values.xs || 0;
    case 'md':
      return values.md || values.sm || values.xs || 0;
    case 'sm':
      return values.sm || values.xs || 0;
    case 'xs':
    default:
      return values.xs || 0;
  }
};

// Export default object with all functions
export default {
  wp,
  hp,
  fs,
  ss,
  deviceInfo,
  breakpoints,
  getCurrentBreakpoint,
  getResponsiveValue,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  isTablet,
  isPortrait,
  isLandscape,
};