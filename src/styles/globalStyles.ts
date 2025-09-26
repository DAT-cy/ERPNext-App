// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';
import { wp, hp, fs, ss, deviceInfo } from '../utils/responsive';
import { typography, spacing, borderRadius, touchTargets, shadows } from '../utils/dimensions';

// Colors
export const colors = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D6',
  
  // Secondary
  secondary: '#34C759',
  secondaryLight: '#63DA78',
  secondaryDark: '#248A3D',
  
  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
};

// Global Styles
export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Flex utilities
  flex: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  flexCenter: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  flexBetween: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  flexStart: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  flexEnd: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  
  // Padding utilities
  p0: { padding: 0 },
  pXS: { padding: spacing.xs },
  pSM: { padding: spacing.sm },
  pMD: { padding: spacing.md },
  pLG: { padding: spacing.lg },
  pXL: { padding: spacing.xl },
  
  // Padding horizontal
  pxXS: { paddingHorizontal: spacing.xs },
  pxSM: { paddingHorizontal: spacing.sm },
  pxMD: { paddingHorizontal: spacing.md },
  pxLG: { paddingHorizontal: spacing.lg },
  pxXL: { paddingHorizontal: spacing.xl },
  
  // Padding vertical
  pyXS: { paddingVertical: spacing.xs },
  pySM: { paddingVertical: spacing.sm },
  pyMD: { paddingVertical: spacing.md },
  pyLG: { paddingVertical: spacing.lg },
  pyXL: { paddingVertical: spacing.xl },
  
  // Margin utilities
  m0: { margin: 0 },
  mXS: { margin: spacing.xs },
  mSM: { margin: spacing.sm },
  mMD: { margin: spacing.md },
  mLG: { margin: spacing.lg },
  mXL: { margin: spacing.xl },
  
  // Margin horizontal
  mxXS: { marginHorizontal: spacing.xs },
  mxSM: { marginHorizontal: spacing.sm },
  mxMD: { marginHorizontal: spacing.md },
  mxLG: { marginHorizontal: spacing.lg },
  mxXL: { marginHorizontal: spacing.xl },
  
  // Margin vertical
  myXS: { marginVertical: spacing.xs },
  mySM: { marginVertical: spacing.sm },
  myMD: { marginVertical: spacing.md },
  myLG: { marginVertical: spacing.lg },
  myXL: { marginVertical: spacing.xl },
  
  // Typography
  textXS: { fontSize: typography.xs, color: colors.textPrimary },
  textSM: { fontSize: typography.sm, color: colors.textPrimary },
  textBase: { fontSize: typography.base, color: colors.textPrimary },
  textMD: { fontSize: typography.md, color: colors.textPrimary },
  textLG: { fontSize: typography.lg, color: colors.textPrimary },
  textXL: { fontSize: typography.xl, color: colors.textPrimary },
  text2XL: { fontSize: typography['2xl'], color: colors.textPrimary },
  text3XL: { fontSize: typography['3xl'], color: colors.textPrimary },
  text4XL: { fontSize: typography['4xl'], color: colors.textPrimary },
  text5XL: { fontSize: typography['5xl'], color: colors.textPrimary },
  
  // Font weights
  fontThin: { fontWeight: '100' },
  fontLight: { fontWeight: '300' },
  fontNormal: { fontWeight: '400' },
  fontMedium: { fontWeight: '500' },
  fontSemibold: { fontWeight: '600' },
  fontBold: { fontWeight: '700' },
  fontExtrabold: { fontWeight: '800' },
  fontBlack: { fontWeight: '900' },
  
  // Text alignment
  textLeft: { textAlign: 'left' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  
  // Text colors
  textPrimary: { color: colors.textPrimary },
  textSecondary: { color: colors.textSecondary },
  textTertiary: { color: colors.textTertiary },
  textInverse: { color: colors.textInverse },
  textBlue: { color: colors.primary },
  textGreen: { color: colors.secondary },
  textRed: { color: colors.error },
  textYellow: { color: colors.warning },
  
  // Background colors
  bgWhite: { backgroundColor: colors.white },
  bgGray: { backgroundColor: colors.gray100 },
  bgLightGray: { backgroundColor: colors.gray50 },
  bgBlue: { backgroundColor: colors.primary },
  bgGreen: { backgroundColor: colors.secondary },
  bgRed: { backgroundColor: colors.error },
  bgYellow: { backgroundColor: colors.warning },
  
  // Border radius
  roundedNone: { borderRadius: borderRadius.none },
  roundedXS: { borderRadius: borderRadius.xs },
  roundedSM: { borderRadius: borderRadius.sm },
  roundedMD: { borderRadius: borderRadius.md },
  roundedLG: { borderRadius: borderRadius.lg },
  roundedXL: { borderRadius: borderRadius.xl },
  rounded2XL: { borderRadius: borderRadius['2xl'] },
  rounded3XL: { borderRadius: borderRadius['3xl'] },
  roundedFull: { borderRadius: borderRadius.full },
  
  // Shadows
  shadowNone: shadows.none,
  shadowXS: shadows.xs,
  shadowSM: shadows.sm,
  shadowMD: shadows.md,
  shadowLG: shadows.lg,
  shadowXL: shadows.xl,
  
  // Borders
  border: { 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  borderTop: { 
    borderTopWidth: 1, 
    borderTopColor: colors.border 
  },
  borderBottom: { 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  borderLeft: { 
    borderLeftWidth: 1, 
    borderLeftColor: colors.border 
  },
  borderRight: { 
    borderRightWidth: 1, 
    borderRightColor: colors.border 
  },
  
  // Common components
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTargets.medium,
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  buttonText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
  
  buttonTextPrimary: {
    color: colors.white,
  },
  
  buttonTextSecondary: {
    color: colors.primary,
  },
  
  // Input
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.base,
    backgroundColor: colors.white,
    minHeight: touchTargets.medium,
    color: colors.textPrimary,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    ...shadows.sm,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  // List item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: touchTargets.medium,
    backgroundColor: colors.white,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  
  errorText: {
    fontSize: typography.base,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});

export default globalStyles;