// src/styles/DeliveryNoteScreen.styles.ts
import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';
import { wp, hp, fs } from '../utils/responsive';

export const deliveryNoteStyles = StyleSheet.create({
    // Container styles
    container: {
        flex: 1,
        backgroundColor: colors.gray50,
    },

    // Header styles
    header: {
        backgroundColor: colors.white,
        paddingTop: hp(2),
        paddingBottom: hp(1.5),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },

    headerTitle: {
        fontSize: fs(18),
        fontWeight: '600',
        color: colors.gray800,
        textAlign: 'center',
    },

    // Search container styles
    searchContainer: {
        marginTop: hp(1.5),
    },

    enhancedSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray100,
        borderRadius: wp(2.5),
        borderWidth: 1,
        borderColor: colors.gray300,
        paddingHorizontal: wp(3),
        paddingVertical: hp(1),
        marginHorizontal: wp(1),
    },

    searchIconContainer: {
        marginRight: wp(2),
    },

    enhancedSearchInput: {
        flex: 1,
        fontSize: fs(14),
        color: colors.gray800,
        paddingVertical: 0,
        marginRight: wp(2),
    },

    clearSearchButton: {
        padding: wp(1),
        marginRight: wp(2),
    },

    enhancedFilterButton: {
        backgroundColor: colors.primary,
        borderRadius: wp(1.5),
        padding: wp(2.5),
        marginRight: wp(1),
        position: 'relative',
    },

    filterButtonActive: {
        backgroundColor: colors.primaryDark,
    },

    filterBadge: {
        position: 'absolute',
        top: -wp(1),
        right: -wp(1),
        backgroundColor: colors.error,
        borderRadius: wp(2),
        minWidth: wp(4),
        height: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
    },

    filterBadgeText: {
        color: colors.white,
        fontSize: fs(10),
        fontWeight: '600',
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

    // Active filters styles
    activeFiltersContainer: {
        marginTop: hp(1),
        paddingHorizontal: wp(1),
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
        color: colors.warning,
        fontSize: fs(12),
        fontWeight: '600',
        marginRight: wp(1.5),
    },

    // Results header styles
    resultsHeader: {
        backgroundColor: colors.white,
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },

    resultsTitle: {
        fontSize: fs(16),
        fontWeight: '600',
        color: colors.gray800,
    },

    // Results list styles
    resultsList: {
        flex: 1,
        paddingHorizontal: wp(4),
    },

    // Delivery note item styles
    deliveryNoteItem: {
        backgroundColor: colors.white,
        borderRadius: wp(3),
        marginVertical: hp(0.75),
        padding: wp(4),
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
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

    // Row for ID and Date to align nicely
    idDateRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },

    itemId: {
        fontSize: fs(16),
        fontWeight: '600',
        color: colors.gray800,
        marginBottom: hp(1),
    },

    itemIdWithDate: {
        fontSize: fs(16),
        fontWeight: '600',
        color: colors.gray800,
        // Balance with date text
        lineHeight: fs(18),
    },

    itemDate: {
        fontSize: fs(12),
        fontWeight: '400',
        color: colors.gray500,
        marginLeft: wp(1.5),
        lineHeight: fs(18),
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

    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },

    leftColumn: {
        flex: 1,
        paddingRight: wp(2),
    },

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
        width: wp(26),
    },

    compactValue: {
        fontSize: fs(12),
        color: colors.gray900,
        fontWeight: '400',
        flex: 1,
        lineHeight: fs(16),
    },

    // Loading states
    loadingMoreContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp(2),
    },

    loadingMoreText: {
        marginLeft: wp(2),
        fontSize: fs(14),
        color: colors.gray600,
    },

    noMoreDataContainer: {
        alignItems: 'center',
        paddingVertical: hp(2),
    },

    noMoreDataText: {
        fontSize: fs(14),
        color: colors.gray500,
        fontStyle: 'italic',
    },

    // Empty state styles
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(8),
    },

    emptyStateIcon: {
        marginBottom: hp(2),
    },

    emptyStateTitle: {
        fontSize: fs(18),
        fontWeight: '600',
        color: colors.gray600,
        marginBottom: hp(1),
        textAlign: 'center',
    },

    emptyStateMessage: {
        fontSize: fs(14),
        color: colors.gray500,
        textAlign: 'center',
        lineHeight: fs(20),
    },

    // Error state styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(8),
    },

    errorTitle: {
        fontSize: fs(18),
        fontWeight: '600',
        color: colors.error,
        marginBottom: hp(1),
        textAlign: 'center',
    },

    errorMessage: {
        fontSize: fs(14),
        color: colors.gray600,
        textAlign: 'center',
        lineHeight: fs(20),
        marginBottom: hp(2),
    },

    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: wp(6),
        paddingVertical: hp(1),
        borderRadius: wp(2),
    },

    retryButtonText: {
        color: colors.white,
        fontSize: fs(14),
        fontWeight: '600',
    },

    // Priority indicators
    priorityHigh: {
        borderLeftColor: colors.error,
    },

    priorityMedium: {
        borderLeftColor: colors.warning,
    },

    priorityLow: {
        borderLeftColor: colors.success,
    },

});
