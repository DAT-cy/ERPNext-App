// src/components/InventoryFilter/InventoryFilterModal.styles.ts
import { StyleSheet } from 'react-native';
import { wp, hp, fs } from '../../utils/responsive';
import { colors } from '../../styles/globalStyles';

export const inventoryFilterStyles = StyleSheet.create({
  // Modal Base Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    maxHeight: hp(85),
    minHeight: hp(60),
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
  },
  
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: wp(3),
  },
  
  // Categories Left Panel Styles (1/5 width as in HTML)
  categoriesContainer: {
    width: '20%',
    backgroundColor: colors.gray50,
    borderRightWidth: 1,
    borderRightColor: colors.gray200,
    paddingVertical: hp(0.5),
  },
  
  categoryButton: {
    paddingHorizontal: wp(1),
    paddingVertical: hp(2),
    borderRadius: wp(2.5),
    margin: wp(0.5),
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: hp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  categoryButtonActive: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
  },
  
  categoryButtonText: {
    fontSize: fs(9),
    color: colors.gray700,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: fs(12),
  },
  
  categoryButtonTextActive: {
    color: colors.warning,
    fontWeight: '600',
  },
  
  // All Categories Right Panel Styles (4/5 width as in HTML)
  allCategoriesContainer: {
    width: '80%',
    flex: 1,
  },
  
  allCategoriesScroll: {
    flex: 1,
  },
  
  allCategoriesContent: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  
  // Category Section Styles
  categorySection: {
    marginBottom: hp(3),
  },
  
  sectionTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: hp(1.5),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  // Options Grid Styles (2x2 grid as in HTML)
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  filterOption: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
    marginBottom: hp(1),
    minHeight: hp(5),
    justifyContent: 'center',
  },
  
  filterOptionSelected: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  filterOptionText: {
    fontSize: fs(11),
    color: colors.gray700,
    textAlign: 'left',
    lineHeight: fs(14),
  },
  
  filterOptionTextSelected: {
    color: colors.warning,
    fontWeight: '600',
  },
  
  // Show More Button Styles
  showMoreButton: {
    width: '100%',
    paddingVertical: hp(1),
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: hp(0.5),
  },
  
  showMoreText: {
    fontSize: fs(11),
    color: colors.warning,
    fontWeight: '500',
  },
  
  // Action Buttons Styles
  resetButton: {
    flex: 1,
    backgroundColor: colors.gray200,
    borderRadius: wp(2.5),
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'center',
  },
  
  applyButtonText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: colors.white,
  },

  // Date picker styles
  dateFilterContainer: {
    width: '100%',
    marginBottom: hp(1),
  },

  modeSelectionContainer: {
    flexDirection: 'row',
    marginBottom: hp(1),
    gap: wp(2),
  },

  modeButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: wp(2.5),
    paddingVertical: hp(1),
    alignItems: 'center',
  },

  modeButtonSelected: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  modeButtonText: {
    fontSize: fs(12),
    color: colors.gray700,
    fontWeight: '500',
  },

  modeButtonTextSelected: {
    color: colors.warning,
    fontWeight: '600',
  },

  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(1),
    gap: wp(2),
  },

  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
  },

  dateButtonSelected: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  dateButtonText: {
    fontSize: fs(14),
    color: colors.gray700,
    flex: 1,
  },

  dateButtonTextSelected: {
    color: colors.warning,
    fontWeight: '600',
  },

  dateSeparator: {
    fontSize: fs(14),
    color: colors.gray600,
    fontWeight: '500',
    marginHorizontal: wp(2),
  },
});