// src/screens/HomeScreen.styles.ts
import { StyleSheet } from 'react-native';
import { 
  wp, hp, fs, ss, 
  typography, spacing, borderRadius, touchTargets 
} from '../utils';
import { wpPlatform, hpPlatform, fsPlatform, ssPlatform } from '../utils/responsive';
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
  mapLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  mapLoadingText: {
    color: '#666',
    fontSize: fs(16),
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  mapLoadingSubtext: {
    color: '#999',
    fontSize: fs(12),
    textAlign: 'center',
    fontStyle: 'italic',
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
    marginTop: hpPlatform(2, 4), // iOS: 2%, Android: 4% (Android cách top nhiều hơn)
    marginBottom: hpPlatform(1, 1.8), // iOS: 1%, Android: 1.8%
    paddingTop: hpPlatform(1, 2), // iOS: 1%, Android: 2% (Android có padding top)
    paddingBottom: hpPlatform(1, 1.8), // iOS: 1%, Android: 1.8%
    paddingHorizontal: wpPlatform(4, 3.5), // iOS: 4%, Android: 3.5%
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attendanceTitle: {
    fontSize: fsPlatform(18, 17), // iOS: 18, Android: 17
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
    textAlign: 'center',
    lineHeight: fs(20),
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
  
  // Header - Platform specific
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hpPlatform(2, 1.8), // iOS: 2%, Android: 1.8%
    paddingHorizontal: wpPlatform(4, 3.5), // iOS: 4%, Android: 3.5%
    marginBottom: hpPlatform(2, 1.8), // iOS: 2%, Android: 1.8%
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: fsPlatform(18, 17), // iOS: 18, Android: 17
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

  // Weekly Checkin Styles
  weeklyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  todayCard: {
    borderLeftColor: colors.primary,
    shadowOpacity: 0.12,
    elevation: 5,
  },
  weeklyHeader: {
    alignItems: 'center',
    marginBottom: hpPlatform(2, 1.8), // iOS: 2%, Android: 1.8%
    paddingBottom: hpPlatform(1.5, 1.3), // iOS: 1.5%, Android: 1.3%
    paddingHorizontal: wpPlatform(4, 3.5), // iOS: 4%, Android: 3.5%
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  weeklyHeaderText: {
    fontSize: fsPlatform(14, 13), // iOS: 14, Android: 13
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dateInfo: {
    alignItems: 'center',
  },
  dayName: {
    fontSize: fs(11),
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs / 2,
  },
  dayNumber: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: colors.textPrimary,
    lineHeight: fs(26),
  },
  todayText: {
    color: colors.primary,
  },
  monthName: {
    fontSize: fs(10),
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: spacing.xs / 2,
  },
  todayBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  todayBadgeText: {
    fontSize: fs(10),
    color: colors.white,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  timesContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  timeSection: {
    flex: 1,
    alignItems: 'center',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hpPlatform(1, 0.8), // iOS: 1%, Android: 0.8%
    paddingHorizontal: wpPlatform(4, 3.5), // iOS: 4%, Android: 3.5%
  },
  timeIcon: {
    width: ss(24),
    height: ss(24),
    borderRadius: ss(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  timeIconText: {
    fontSize: fs(9),
    color: colors.white,
    fontWeight: 'bold',
  },
  timeLabel: {
    fontSize: fs(12),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  missingTime: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statusText: {
    fontSize: fs(11),
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  missingStatus: {
    color: colors.gray400,
  },
  separator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  separatorLine: {
    width: ss(16),
    height: 1,
    backgroundColor: colors.gray300,
  },
  arrowText: {
    fontSize: fs(16),
    color: colors.primary,
    fontWeight: 'bold',
    marginVertical: spacing.xs / 2,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  durationText: {
    fontSize: fs(12),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  durationValue: {
    fontSize: fs(12),
    color: colors.success,
    fontWeight: 'bold',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },

  // New simplified layout styles
  inOutRow: {
    paddingVertical: spacing.sm,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  inLabel: {
    fontSize: fs(12),
    fontWeight: '600',
    color: colors.success,
    flex: 1,
    textAlign: 'center',
  },
  outLabel: {
    fontSize: fs(12),
    fontWeight: '600',
    color: colors.error,
    flex: 1,
    textAlign: 'center',
  },
  arrowSymbol: {
    fontSize: fs(16),
    color: colors.primary,
    fontWeight: 'bold',
    paddingHorizontal: spacing.md,
    minWidth: ss(30),
    textAlign: 'center',
  },
  timesRowDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  timeDisplay: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  missingTimeDisplay: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  timesSpacer: {
    width: ss(40),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  statusDisplay: {
    fontSize: fs(11),
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  missingStatusDisplay: {
    color: colors.gray400,
  },
  statusSpacer: {
    width: ss(30),
  },

  // Multiple pairs styles
  pairContainer: {
    marginVertical: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  pairNumber: {
    fontSize: fs(14),
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    textTransform: 'none',
    letterSpacing: 0.5,
  },
  totalDurationContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  totalDurationValue: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  // Latest pair container for today view
  latestPairContainer: {
    paddingVertical: spacing.sm,
  },
  latestPairTitle: {
    fontSize: fs(14),
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
});