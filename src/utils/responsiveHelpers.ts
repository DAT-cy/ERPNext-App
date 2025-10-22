// src/utils/responsiveHelpers.ts
import { 
  wp, 
  hp, 
  fs, 
  ss, 
  deviceInfo, 
  getResponsiveValue,
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveTextStyle,
  getResponsiveContainerStyle,
  getCurrentBreakpoint,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  isTablet,
  isPortrait,
  isLandscape,
} from './responsive';

// Responsive breakpoint helpers
export const useResponsiveBreakpoint = () => {
  return getCurrentBreakpoint();
};

export const isMobile = () => !isTablet();
export const isDesktop = () => isTablet();

// Responsive size helpers
export const getResponsiveWidth = (percentage: number) => wp(percentage);
export const getResponsiveHeight = (percentage: number) => hp(percentage);
export const getResponsiveFont = (size: number) => fs(size);
export const getResponsiveSize = (size: number) => ss(size);

// Responsive text helpers
export const getResponsiveHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
  const sizes = {
    1: getResponsiveFontSize(32),
    2: getResponsiveFontSize(28),
    3: getResponsiveFontSize(24),
    4: getResponsiveFontSize(20),
    5: getResponsiveFontSize(18),
    6: getResponsiveFontSize(16),
  };
  
  return getResponsiveTextStyle(sizes[level], {
    fontWeight: '700',
    lineHeight: sizes[level] * 1.2,
  });
};

export const getResponsiveBody = (size: 'small' | 'medium' | 'large' = 'medium') => {
  const sizes = {
    small: getResponsiveFontSize(12),
    medium: getResponsiveFontSize(14),
    large: getResponsiveFontSize(16),
  };
  
  return getResponsiveTextStyle(sizes[size], {
    lineHeight: sizes[size] * 1.4,
  });
};

export const getResponsiveCaption = () => {
  return getResponsiveTextStyle(getResponsiveFontSize(12), {
    color: '#6B7280',
    lineHeight: getResponsiveFontSize(12) * 1.3,
  });
};

// Responsive spacing helpers
export const getResponsivePadding = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
  const sizes = {
    small: getResponsiveSpacing(8),
    medium: getResponsiveSpacing(16),
    large: getResponsiveSpacing(24),
    xlarge: getResponsiveSpacing(32),
  };
  
  return {
    padding: sizes[size],
    paddingHorizontal: sizes[size],
    paddingVertical: sizes[size],
  };
};

export const getResponsiveMargin = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
  const sizes = {
    small: getResponsiveSpacing(8),
    medium: getResponsiveSpacing(16),
    large: getResponsiveSpacing(24),
    xlarge: getResponsiveSpacing(32),
  };
  
  return {
    margin: sizes[size],
    marginHorizontal: sizes[size],
    marginVertical: sizes[size],
  };
};

// Responsive component helpers
export const getResponsiveButton = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      height: getResponsiveSize(36),
      paddingHorizontal: getResponsiveSpacing(12),
      fontSize: getResponsiveFontSize(14),
    },
    medium: {
      height: getResponsiveSize(44),
      paddingHorizontal: getResponsiveSpacing(16),
      fontSize: getResponsiveFontSize(16),
    },
    large: {
      height: getResponsiveSize(56),
      paddingHorizontal: getResponsiveSpacing(20),
      fontSize: getResponsiveFontSize(18),
    },
  };
  
  return {
    ...sizes[size],
    borderRadius: getResponsiveSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  };
};

export const getResponsiveInput = () => {
  return {
    height: getResponsiveSize(44),
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(12),
    fontSize: getResponsiveFontSize(16),
    borderRadius: getResponsiveSize(8),
    borderWidth: 1,
  };
};

export const getResponsiveCard = () => {
  return {
    padding: getResponsiveSpacing(16),
    borderRadius: getResponsiveSize(12),
    margin: getResponsiveSpacing(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };
};

// Responsive layout helpers
export const getResponsiveGridColumns = () => {
  if (isTablet()) {
    return isPortrait() ? 2 : 3;
  }
  return 1;
};

export const getResponsiveGridGap = () => {
  return getResponsiveSpacing(16);
};

export const getResponsiveContainerMaxWidth = () => {
  if (isTablet()) {
    return isPortrait() ? wp(90) : wp(80);
  }
  return wp(95);
};

// Responsive image helpers
export const getResponsiveImageSize = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
  const sizes = {
    small: getResponsiveSize(32),
    medium: getResponsiveSize(48),
    large: getResponsiveSize(64),
    xlarge: getResponsiveSize(96),
  };
  
  return {
    width: sizes[size],
    height: sizes[size],
    borderRadius: sizes[size] / 2,
  };
};

// Responsive icon helpers
export const getResponsiveIconSize = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: getResponsiveSize(16),
    medium: getResponsiveSize(24),
    large: getResponsiveSize(32),
  };
  
  return sizes[size];
};

// Export all helpers
export default {
  // Breakpoint helpers
  useResponsiveBreakpoint,
  isMobile,
  isDesktop,
  
  // Size helpers
  getResponsiveWidth,
  getResponsiveHeight,
  getResponsiveFont,
  getResponsiveSize,
  
  // Text helpers
  getResponsiveHeading,
  getResponsiveBody,
  getResponsiveCaption,
  
  // Spacing helpers
  getResponsivePadding,
  getResponsiveMargin,
  
  // Component helpers
  getResponsiveButton,
  getResponsiveInput,
  getResponsiveCard,
  
  // Layout helpers
  getResponsiveGridColumns,
  getResponsiveGridGap,
  getResponsiveContainerMaxWidth,
  
  // Image helpers
  getResponsiveImageSize,
  
  // Icon helpers
  getResponsiveIconSize,
  
  // Device info
  deviceInfo,
};
