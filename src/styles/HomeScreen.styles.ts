// src/screens/HomeScreen.styles.ts
import { StyleSheet } from 'react-native';
import { 
  wp, hp, fs, ss, 
  typography, spacing, borderRadius, touchTargets 
} from '../utils';
import { colors } from './globalStyles';

export const homeScreenStyles = StyleSheet.create({
  // Base containers
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flexContent: {
    flex: 1,
    backgroundColor: colors.gray50,
    marginTop: ss(8),
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  
  // Content tabs
  contentContainer: {
    flex: 1,
  },
  contentTabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  contentTab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  contentTabActive: {
    borderBottomColor: colors.primary,
  },
  contentTabText: {
    fontSize: fs(16),
    fontWeight: '500',
    color: colors.textSecondary,
  },
  contentTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Map styles
  mapContainer: {
    height: hp(30),
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.sm,
    alignItems: 'center',
  },
  mapOverlayText: {
    color: colors.textInverse,
    fontWeight: 'bold',
    fontSize: fs(12),
  },
  refreshLocationButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: ss(20),
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 3,
  },
  refreshLocationText: {
    color: colors.textInverse,
    fontWeight: 'bold',
    fontSize: fs(12),
  },
  
  // Attendance card
  attendanceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attendanceTitle: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  viewAllButton: {
    padding: spacing.xs,
  },
  viewAllText: {
    fontSize: fs(14),
    color: colors.primary,
    fontWeight: '500',
  },
  
  // Time and user info
  currentTimeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
  },
  currentTimeText: {
    fontSize: fs(13),
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  usernameText: {
    fontSize: fs(16),
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  todayDateText: {
    fontSize: fs(14),
    color: colors.textSecondary,
  },
  attendanceContent: {
    paddingVertical: spacing.sm,
  },
  
  // Time info
  timeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  timeColumn: {
    alignItems: 'center',
    flex: 1,
  },
  timeSeparator: {
    width: 1,
    height: ss(40),
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  timeLabel: {
    fontSize: fs(12),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeValue: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  noDataText: {
    fontSize: fs(16),
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: spacing.lg,
  },
  
  // Checkin button
  checkinButton: {
    alignSelf: 'center',
    width: ss(80),
    height: ss(80),
    borderRadius: ss(40),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  checkinButtonText: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: colors.textInverse,
  },
  
  // State containers
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: fs(16),
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: fs(16),
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  retryText: {
    color: colors.textInverse,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: fs(16),
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
  },
  headerTitle: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  
  // Checkin status
  checkinStatusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundTertiary,
  },
  checkinStatusText: {
    fontWeight: 'bold',
    fontSize: fs(12),
  },
  
  // Checkin item
  checkinItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  logTypeIndicator: {
    width: ss(50),
    height: ss(50),
    borderRadius: ss(25),
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logTypeText: {
    fontSize: fs(14),
    fontWeight: 'bold',
  },
  checkinInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  checkinTime: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  checkinDate: {
    fontSize: fs(14),
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  checkinStatus: {
    fontSize: fs(12),
    color: colors.primary,
    fontWeight: '500',
    marginTop: spacing.xs,
  },

  // Disabled states
  checkinButtonDisabled: {
    backgroundColor: colors.gray300,
    opacity: 0.6,
  },
  checkinButtonTextDisabled: {
    color: colors.gray600,
  },

  // Location error
  locationErrorContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  locationErrorText: {
    fontSize: fs(14),
    color: colors.error,
    marginBottom: spacing.xs,
  },
  retryLocationButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  retryLocationText: {
    fontSize: fs(12),
    color: colors.white,
    fontWeight: '500',
  },
});