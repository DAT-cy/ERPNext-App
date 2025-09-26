// src/utils/dimensions.ts
import { deviceInfo, wp, hp, fs, ss, getResponsiveValue } from './responsive';

// Typography Scale - Responsive font sizes
export const typography = {
  xs: fs(10),
  sm: fs(12),
  base: fs(14),
  md: fs(16),
  lg: fs(18),
  xl: fs(20),
  '2xl': fs(24),
  '3xl': fs(30),
  '4xl': fs(36),
  '5xl': fs(48),
};

// Spacing Scale - Responsive spacing
export const spacing = {
  xs: ss(4),
  sm: ss(8),
  base: ss(12),
  md: ss(16),
  lg: ss(20),
  xl: ss(24),
  '2xl': ss(32),
  '3xl': ss(48),
  '4xl': ss(64),
  '5xl': ss(80),
};

// Border Radius Scale
export const borderRadius = {
  none: 0,
  xs: ss(2),
  sm: ss(4),
  base: ss(6),
  md: ss(8),
  lg: ss(12),
  xl: ss(16),
  '2xl': ss(24),
  '3xl': ss(32),
  full: 9999,
};

// Touch Targets - Apple HIG recommends minimum 44pt
export const touchTargets = {
  small: ss(36),
  medium: ss(44),
  large: ss(56),
  xl: ss(64),
};

// Shadow Styles
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
};

// Component Dimensions
export const components = {
  // Header/AppBar
  header: {
    height: getResponsiveValue({
      xs: 56,
      sm: 60,
      md: 64,
      lg: 70,
      xl: 80,
    }),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  // Tab Bars
  bottomTabBar: {
    height: getResponsiveValue({
      xs: 65,
      sm: 70,
      md: 75,
      lg: 80,
      xl: 85,
    }),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  
  topTabBar: {
    height: getResponsiveValue({
      xs: 48,
      sm: 52,
      md: 56,
      lg: 60,
      xl: 64,
    }),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  
  // Buttons
  button: {
    small: {
      height: touchTargets.small,
      paddingHorizontal: spacing.md,
      fontSize: typography.sm,
    },
    medium: {
      height: touchTargets.medium,
      paddingHorizontal: spacing.lg,
      fontSize: typography.base,
    },
    large: {
      height: touchTargets.large,
      paddingHorizontal: spacing.xl,
      fontSize: typography.md,
    },
  },
  
  // Input Fields
  input: {
    height: touchTargets.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.base,
    borderRadius: borderRadius.md,
  },
  
  // Cards
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    margin: spacing.sm,
  },
  
  // List Items
  listItem: {
    height: getResponsiveValue({
      xs: 56,
      sm: 60,
      md: 64,
      lg: 70,
    }),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  // Icons
  icon: {
    small: ss(16),
    medium: ss(20),
    large: ss(24),
    xl: ss(32),
    '2xl': ss(40),
  },
  
  // Avatar
  avatar: {
    small: ss(32),
    medium: ss(40),
    large: ss(56),
    xl: ss(80),
    '2xl': ss(120),
  },
  
  // Modal/Dialog
  modal: {
    maxWidth: getResponsiveValue({
      xs: wp(95),
      sm: wp(90),
      md: wp(85),
      lg: wp(70),
      xl: wp(60),
    }),
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  
  // Sidebar/Drawer
  sidebar: {
    width: getResponsiveValue({
      xs: wp(85),
      sm: wp(80),
      md: wp(75),
      lg: wp(60),
      xl: wp(40),
    }),
  },
};

// Layout Helpers
export const layout = {
  // Container với responsive padding
  container: {
    paddingHorizontal: getResponsiveValue({
      xs: spacing.md,
      sm: spacing.lg,
      md: spacing.xl,
      lg: spacing['2xl'],
    }),
  },
  
  // Safe area padding
  safeArea: {
    paddingTop: deviceInfo.isIOS ? hp(5) : hp(3),
    paddingBottom: deviceInfo.isIOS ? hp(3) : hp(2),
  },
  
  // Section spacing
  section: {
    marginVertical: spacing.lg,
  },
  
  // Grid system
  grid: {
    gap: spacing.md,
    columns: getResponsiveValue({
      xs: 1,
      sm: 2,
      lg: 3,
      xl: 4,
    }),
  },
};

// Export all
export default {
  typography,
  spacing,
  borderRadius,
  touchTargets,
  shadows,
  components,
  layout,
};