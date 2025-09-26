// src/components/SuccessAnimation/SuccessAnimation.styles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { wp, hp, fs, ss, spacing, borderRadius } from '../utils';
import { colors } from './globalStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const successAnimationStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: wp(70),
    maxWidth: wp(85),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  checkmarkContainer: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  
  checkmark: {
    width: ss(80),
    height: ss(80),
    borderRadius: ss(40),
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  checkmarkText: {
    fontSize: fs(36),
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  
  title: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  message: {
    fontSize: fs(16),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fs(22),
  },
  
  ripple: {
    position: 'absolute',
    width: ss(80),
    height: ss(80),
    borderRadius: ss(40),
    backgroundColor: colors.success,
    top: '50%',
    left: '50%',
    marginTop: -ss(40) - spacing.lg,
    marginLeft: -ss(40),
  },
});