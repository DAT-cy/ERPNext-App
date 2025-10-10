// src/screens/Inventory/InventoryEntryScreens.styles.ts
import { StyleSheet } from 'react-native';
import { wp, hp, fs } from '../utils/responsive';
import { colors } from './globalStyles';

export const inventoryEntryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  
  // Header Styles
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: fs(18),
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: hp(2),
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
    alignItems: 'center',
    marginBottom: hp(0.5),
    flexWrap: 'wrap',
  },

  compactLabel: {
    fontSize: fs(11),
    color: colors.gray600,
    fontWeight: '600',
    marginRight: wp(1),
    minWidth: wp(18),
  },

  compactValue: {
    fontSize: fs(12),
    color: colors.gray800,
    fontWeight: '500',
    flex: 1,
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
});