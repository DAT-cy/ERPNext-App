// src/styles/InsertInventoryScreen.styles.ts
import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';
import { wp, hp, fs, wpPlatform, hpPlatform, fsPlatform } from '../utils/responsive';

export const insertInventoryStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.gray50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wpPlatform(4, 3.5), // iOS: 4%, Android: 3.5%
        paddingTop: hpPlatform(2, 7), // iOS: 7%, Android: 6% (Android có status bar khác)
        paddingBottom: hpPlatform(1.5, 1.3), // iOS: 1.5%, Android: 1.3%
        backgroundColor: colors.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        zIndex: 1000,
        position: 'relative',
        minHeight: hpPlatform(7, 6.5), // iOS: 7%, Android: 6.5%
    },
    iconBtn: {
        padding: wp(2),
        borderRadius: wp(2),
    },
    iconText: {
        fontSize: fsPlatform(18, 17), // iOS: 18, Android: 17
        color: colors.gray600,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerStatus: {
        marginTop: hp(0.25),
        fontSize: fs(12),
        fontWeight: '600',
    },
    statusUnsaved: { color: colors.warning },
    statusSaved: { color: colors.success },
    saveBtn: {
        backgroundColor: '#2563EB',
        paddingHorizontal: wp(4.5),
        paddingVertical: hp(1.25),
        borderRadius: wp(3),
        shadowColor: '#2563EB',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    saveBtnText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: fs(14),
    },
    container: {
        padding: 0,
        paddingBottom: hp(3),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: wp(3),
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        marginVertical: hp(1),
        overflow: 'hidden',
    },
    expanded: {
        // natural height via content
    },
    collapsed: {
        height: hp(7.5),
    },
    sectionHeader: {
        minHeight: hp(6),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.gray100,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        marginRight: wp(3),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: fs(16),
        fontWeight: '700',
        color: colors.gray900,
    },
    chevron: {
        fontSize: fs(18),
        color: '#9CA3AF',
    },
    sectionBody: {
        paddingHorizontal: wp(4),
        paddingBottom: hp(2),
    },
    formGroup: {
        marginTop: hp(1.5),
    },
    label: {
        fontSize: fs(12),
        color: colors.gray700,
        marginBottom: hp(0.75),
        fontWeight: '600',
    },
    input: {
        height: hp(5.5),
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(3.5),
        fontSize: fs(14),
        backgroundColor: colors.white,
    },
    textarea: {
        height: hp(13),
        paddingTop: hp(1),
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchLabel: {
        marginLeft: wp(2.5),
        fontSize: fs(14),
        color: colors.gray700,
        fontWeight: '600',
    },
    row2: {
        flexDirection: 'row',
        gap: 12 as any,
        marginTop: 12,
    },
    col: {
        flex: 1,
    },
    row3: {
        flexDirection: 'row',
        gap: 8 as any,
        marginTop: 12,
    },
    col3: {
        flex: 1,
    },
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8 as any,
    },
    btn: {
        flex: 1,
        height: hp(5.5),
        borderRadius: wp(2.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: fs(14),
    },
    btnPrimary: { backgroundColor: '#2563EB' },
    btnSuccess: { backgroundColor: '#16A34A' },
    btnWarning: { backgroundColor: '#EA580C' },
    btnDark: { backgroundColor: '#374151' },
    smallBtn: {
        height: hp(5.5),
        paddingHorizontal: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    smallBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    itemCard: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: wp(3),
        padding: wp(3.5),
        backgroundColor: colors.gray50,
        marginTop: 12,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    editingCard: {
        borderColor: '#3B82F6',
        borderWidth: 2,
        backgroundColor: '#F0F9FF',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    itemHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: fs(14),
        fontWeight: '600',
        color: '#374151',
    },
    removeText: {
        color: colors.error,
        fontWeight: '700',
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBtnText: {
        fontSize: fs(14),
        color: colors.white,
    },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteBtnText: {
        fontSize: fs(14),
        color: colors.white,
    },
    cancelBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6B7280',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: fs(14),
        color: colors.white,
        fontWeight: '700',
    },
    disabledInput: {
        backgroundColor: colors.gray100,
        color: '#000000',
    },
    disabledBtn: {
        backgroundColor: colors.gray300,
        opacity: 0.5,
    },
    toast: {
        position: 'absolute',
        left: wp(4),
        right: wp(4),
        top: hp(2),
        backgroundColor: colors.success,
        paddingVertical: hp(1.25),
        paddingHorizontal: wp(3.5),
        borderRadius: wp(3),
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    toastText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: fs(14),
    },
    floatingScanButton: {
        position: 'absolute',
        right: 16,
        bottom: 99,
        backgroundColor: '#111827',
        borderRadius: 28,
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 8,
        zIndex: 1200,
    },
    floatingScanText: {
        color: colors.white,
        fontSize: fs(12),
        fontWeight: '700',
    },

    // Mobile-optimized header
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backBtn: {
        padding: 6,
        marginRight: 4,
    },
    backBtnText: {
        fontSize: fs(20),
        color: colors.gray900,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: fs(16),
        fontWeight: '600',
        color: colors.gray900,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    filterBtn: {
        backgroundColor: '#111111',
        paddingHorizontal: wp(3),
        paddingVertical: hp(1),
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 80,
        minHeight: 32,
    },
    filterBtnText: {
        color: 'white',
        fontSize: fs(12),
        fontWeight: '600',
    },

    // Progress Bar - Mobile optimized
    progressBar: {
        backgroundColor: 'white',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        zIndex: 999,
        position: 'relative',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
    },
    progressStep: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
        paddingHorizontal: wp(1),
    },
    stepCircle: {
        width: wp(5),
        height: wp(5),
        borderRadius: wp(2.5),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        position: 'relative',
        zIndex: 2,
    },
    stepCircleCompleted: {
        backgroundColor: '#4CAF50',
    },
    stepCircleActive: {
        backgroundColor: '#111111',
    },
    stepCirclePending: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    stepText: {
        fontSize: fs(9),
        fontWeight: '700',
        color: '#FFFFFF',
    },
    stepLabel: {
        fontSize: fs(12),
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
        paddingHorizontal: wp(2),
        lineHeight: 16,
        alignSelf: 'stretch',
        flexGrow: 1,
        flexShrink: 1,
    },
    stepLabelCompleted: {
        color: '#4CAF50',
    },
    stepLabelActive: {
        color: '#111111',
        fontWeight: '600',
    },
    stepLabelPending: {
        color: '#999',
    },
    progressLine: {
        position: 'absolute',
        top: 12,
        left: '50%',
        right: '-50%',
        height: 1,
        backgroundColor: '#f0f0f0',
        zIndex: 1,
    },
    progressLineCompleted: {
        backgroundColor: '#4CAF50',
    },
    progressLineActive: {
        backgroundColor: '#4CAF50',
    },

    // Active Filters Chips
    filtersBar: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: colors.gray50,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.gray200,
    },
    filtersChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8 as any,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.75),
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#111111',
    },
    filterChipText: {
        color: '#111111',
        fontSize: fs(12),
        fontWeight: '600',
    },

    // Company Details - Mobile optimized
    companyDetails: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 16,
        marginHorizontal: wp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        overflow: 'hidden',
    },
    companyInfo: {
        padding: wp(3),
    },
    companyLine: {
        fontSize: fs(12),
        color: '#333',
        fontWeight: '500',
        marginBottom: 4,
        lineHeight: 16,
    },

    // Main Content - Mobile optimized
    mainContent: {
        padding: wp(4),
    },

    // Shop Section - Mobile optimized
    shopSection: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 12,
        marginHorizontal: wp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        overflow: 'hidden',
    },
    productItem: {
        padding: wp(3),
    },
    productMain: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    productInfo: {
        flex: 1,
    },
    productTitle: {
        fontSize: fs(12),
        lineHeight: 16,
        marginBottom: 2,
        fontWeight: '400',
        color: '#333',
        paddingVertical: 2,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    productNameReadOnly: {
        backgroundColor: '#F9FAFB', // Màu nền khác để phân biệt
        borderBottomColor: '#D1D5DB', // Màu border khác
        color: '#6B7280', // Màu text khác để cho thấy chỉ đọc
        fontWeight: '300', // Font weight nhẹ hơn
        textAlignVertical: 'center', // Căn giữa theo chiều dọc
        paddingRight: 8, // Thêm padding bên phải để text không bị cắt
    },
    productTitleScrollContainer: {
        maxHeight: 40, // Giới hạn chiều cao
        marginBottom: 2,
    },
    productTitleScrollContent: {
        flexGrow: 1,
        alignItems: 'center',
    },
    productCode: {
        fontSize: fs(10),
        color: '#6B7280',
        paddingVertical: 2,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    removeBtn: {
        padding: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
    },
    removeBtnText: {
        color: '#EF4444',
        fontSize: fs(10),
        fontWeight: '600',
    },
    productPriceQuantity: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    currentPrice: {
        color: '#111111',
        fontSize: fs(12),
        fontWeight: '400',
    },
    originalPrice: {
        color: '#666',
        textDecorationLine: 'line-through',
        fontSize: fs(12),
    },
    quantityInputControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    quantityBtn: {
            width: wp(8),
        height: wp(8),
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: wp(4),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBtnText: {
        fontSize: fs(16),
        color: '#4B5563',
    },
    quantityInput: {
        width: 50,
        height: hp(4),
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        textAlign: 'center',
        fontSize: fs(12),
        fontWeight: '600',
        backgroundColor: 'white',
    },

    // Checkbox - Mobile optimized
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 3,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#111111',
        borderColor: '#111111',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: fs(10),
        fontWeight: 'bold',
    },

    // Empty State - Mobile optimized
    emptyState: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginHorizontal: wp(4),
    },
    emptyIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyIconText: {
        fontSize: fs(20),
        color: '#9CA3AF',
    },
    emptyTitle: {
        fontSize: fs(14),
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 6,
        fontWeight: '600',
    },
    emptySubtitle: {
        fontSize: fs(12),
        color: '#9CA3AF',
        textAlign: 'center',
    },

    // Add Product Button - Mobile optimized
    addProductBtn: {
        backgroundColor: '#111111',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(5),
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
        marginHorizontal: wp(4),
    },
    addProductBtnText: {
        color: 'white',
        fontSize: fs(14),
        fontWeight: '600',
    },

    // Footer - Mobile optimized
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        padding: wp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    footerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectAllText: {
        fontSize: fs(12),
        color: '#4B5563',
        fontWeight: '600',
        marginLeft: 6,
    },
    shippingInfo: {
        marginLeft: 8,
    },
    shippingText: {
        fontSize: fs(10),
        color: '#4CAF50',
        fontWeight: '600',
    },
    footerTotal: {
        flex: 1,
        alignItems: 'flex-end',
    },
    totalPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: fs(18),
        fontWeight: '600',
        color: '#111111',
    },
    arrowUp: {
        fontSize: fs(10),
        color: '#666',
        marginLeft: 4,
    },
    savings: {
        fontSize: fs(12),
        color: '#666',
    },
    checkoutBtn: {
        backgroundColor: '#111111',
        borderRadius: 8,
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(5),
        alignItems: 'center',
        marginTop: 8,
    },
    checkoutBtnText: {
        fontSize: fs(14),
        fontWeight: '600',
        color: '#FFFFFF',
    },
});


