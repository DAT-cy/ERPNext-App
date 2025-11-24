// src/screens/Inventory/InventoryEntryScreens.styles.ts
import { StyleSheet } from 'react-native';
import { wp, hp, fs, wpPlatform, hpPlatform, fsPlatform } from '../utils/responsive';
import { colors } from './globalStyles';

export const inventoryEntryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  
  // Header Styles - Platform specific
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: wpPlatform(4, 3.5), // iOS: 4%, Android: 3.5%
    paddingTop: hpPlatform(2, 6), // iOS: 7%, Android: 6% (Android có status bar khác)
    paddingBottom: hpPlatform(1, 1.8), // iOS: 2%, Android: 1.8%
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: fsPlatform(18, 17), // iOS: 18, Android: 17 (Android text thường nhỏ hơn)
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: hpPlatform(2, 1.8),
  },
  
  // Search Styles
  searchContainer: {
    marginBottom: hp(1),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: colors.gray300,
    paddingHorizontal: wp(3),
  },
  searchInput: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    fontSize: fs(14),
    color: colors.gray700,
  },
  filterButton: {
    padding: wp(3),
  },
  
  // Active Filters Styles
  activeFiltersContainer: {
    marginTop: hp(1),
    maxHeight: hp(5),
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    borderRadius: wp(5),
    paddingHorizontal: wp(3),
    paddingVertical: wp(1.5),
    marginRight: wp(2),
  },
  activeFilterText: {
    fontSize: fs(12),
    color: colors.warning,
    fontWeight: '600',
    marginRight: wp(1.5),
  },
  
  // Results Styles
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: colors.white,
  },
  resultsTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.gray800,
  },
  resultsCount: {
    fontSize: fs(12),
    color: colors.gray500,
  },

  statisticsContainer: {
    backgroundColor: colors.white,
    marginHorizontal: wp(4),
    marginBottom: hp(1),
    borderRadius: wp(3),
    padding: wp(4),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statisticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  statisticsTitle: {
    fontSize: fs(15),
    fontWeight: '600',
    color: colors.gray800,
  },
  statisticsSubtitle: {
    fontSize: fs(12),
    color: colors.gray500,
  },
  statisticsCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statisticsCard: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: colors.gray200,
    marginRight: wp(2),
  },
  statisticsCardRight: {
    marginRight: 0,
  },
  statisticsCardLabel: {
    fontSize: fs(12),
    color: colors.gray600,
    marginBottom: hp(0.5),
  },
  statisticsCardValue: {
    fontSize: fs(18),
    fontWeight: '700',
    color: colors.primary,
  },
  
  resultsList: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  
  // Inventory Item Styles
  inventoryItem: {
    backgroundColor: colors.white,
    borderRadius: wp(3),
    marginVertical: hp(0.75),
    padding: wp(4),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
    paddingBottom: hp(0.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },

  // Compact layout columns
  leftColumn: {
    flex: 1,
    paddingRight: wp(2),
  },

  rightColumn: {
    flex: 1,
    paddingLeft: wp(2),
  },
  
  itemId: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: hp(1),
  },
  
  itemDetails: {
    gap: hp(0.5),
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  
  detailLabel: {
    fontSize: fs(12),
    color: colors.gray600,
    fontWeight: '500',
    minWidth: wp(15),
    marginRight: wp(1),
  },
  
  detailValue: {
    fontSize: fs(12),
    color: colors.gray700,
    flex: 1,
  },
  
  statusBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: wp(0.5),
    borderRadius: wp(1.5),
    alignSelf: 'flex-start',
  },
  
  statusText: {
    fontSize: fs(11),
    fontWeight: '600',
  },

  // Compact styles - Key và Value cùng dòng
  compactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(0.5),
    paddingVertical: hp(0.25),
    flexWrap: 'wrap',
  },

  compactLabel: {
    fontSize: fs(11),
    color: colors.gray500,
    fontWeight: '500',
    marginRight: wp(2),
    width: wp(26), // slightly narrower for better balance
    textAlign: 'left',
  },

  compactValue: {
    fontSize: fs(12),
    color: colors.gray900,
    fontWeight: '400',
    flex: 1,
    flexShrink: 1,
    paddingTop: hp(0.1),
    lineHeight: fs(16),
  },

  // Interpretation row (full width)
  interpretationRow: {
    marginTop: hp(0.5),
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },

  interpretationLabel: {
    fontSize: fs(11),
    color: colors.gray600,
    fontWeight: '500',
    marginBottom: hp(0.2),
  },

  interpretationValue: {
    fontSize: fs(12),
    color: colors.gray700,
    fontStyle: 'italic',
    lineHeight: fs(16),
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    maxHeight: hp(80),
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  modalTitle: {
    fontSize: fs(18),
    fontWeight: '600',
    color: colors.gray800,
  },
  
  closeButton: {
    padding: wp(2),
    borderRadius: wp(2),
    backgroundColor: colors.gray100,
  },
  
  modalContent: {
    flexDirection: 'row',
    flex: 1,
    maxHeight: hp(50),
  },
  
  // Categories Styles
  categoriesContainer: {
    width: '25%',
    backgroundColor: colors.gray50,
    borderRightWidth: 1,
    borderRightColor: colors.gray200,
    paddingVertical: hp(1),
  },
  
  categoryButton: {
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    margin: wp(0.5),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  categoryButtonActive: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
  },
  
  categoryButtonText: {
    fontSize: fs(10),
    color: colors.gray700,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  categoryButtonTextActive: {
    color: colors.warning,
    fontWeight: '600',
  },
  
  // Options Styles
  optionsContainer: {
    width: '75%',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  
  sectionTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: hp(2),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  optionsRow: {
    justifyContent: 'space-between',
  },
  
  filterOption: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: wp(2),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
    marginBottom: hp(1),
  },
  
  filterOptionSelected: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
  },
  
  filterOptionText: {
    fontSize: fs(11),
    color: colors.gray700,
    textAlign: 'left',
    lineHeight: fs(16),
  },
  
  filterOptionTextSelected: {
    color: colors.warning,
    fontWeight: '600',
  },
  
  // Modal Footer Styles
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: wp(3),
  },
  
  resetButton: {
    flex: 1,
    backgroundColor: colors.gray200,
    borderRadius: wp(2.5),
    paddingVertical: hp(1.5),
    alignItems: 'center',
  },
  
  resetButtonText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: colors.gray700,
  },
  
  applyButton: {
    flex: 1,
    backgroundColor: colors.warning,
    borderRadius: wp(2.5),
    paddingVertical: hp(1.5),
    alignItems: 'center',
  },
  
  applyButtonText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: colors.white,
  },
  
  // Loading More Styles
  loadingMoreContainer: {
    flexDirection: 'row',
    paddingVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  
  loadingMoreText: {
    fontSize: fs(14),
    color: colors.gray600,
    fontStyle: 'italic',
  },
  
  noMoreDataContainer: {
    paddingVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  noMoreDataText: {
    fontSize: fs(14),
    color: colors.gray500,
    fontStyle: 'italic',
  },
  
  // Enhanced Search Bar Styles
  enhancedSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: colors.gray300,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIconContainer: {
    padding: wp(2),
    marginRight: wp(1),
  },
  enhancedSearchInput: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
    fontSize: fs(14),
    color: colors.gray700,
    minHeight: hp(4),
  },
  clearSearchButton: {
    padding: wp(2),
    marginRight: wp(1),
    borderRadius: wp(2),
    backgroundColor: colors.gray100,
  },
  enhancedFilterButton: {
    position: 'relative',
    padding: wp(2.5),
    marginRight: wp(1),
    borderRadius: wp(2.5),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -wp(1),
    right: -wp(1),
    backgroundColor: colors.error,
    borderRadius: wp(3),
    minWidth: wp(5),
    height: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  filterBadgeText: {
    fontSize: fs(10),
    fontWeight: '700',
    color: colors.white,
  },
  scanButton: {
    padding: wp(2.5),
    borderRadius: wp(2.5),
    backgroundColor: colors.warning,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginRight: wp(1),
  },
  addButton: {
    padding: wp(2.5),
    borderRadius: wp(2.5),
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});