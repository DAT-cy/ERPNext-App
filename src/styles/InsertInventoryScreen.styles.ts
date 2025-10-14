// src/styles/InsertInventoryScreen.styles.ts
import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';
import { wp, hp, fs } from '../utils/responsive';

export const insertInventoryStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.gray50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    iconBtn: {
        padding: 8,
        borderRadius: 8,
    },
    iconText: {
        fontSize: fs(18),
        color: colors.gray600,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fs(18),
        fontWeight: '700',
        color: colors.gray900,
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
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
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
        padding: wp(3),
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
        marginVertical: 8,
        overflow: 'hidden',
    },
    expanded: {
        // natural height via content
    },
    collapsed: {
        height: 60,
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
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: fs(16),
        fontWeight: '700',
        color: colors.gray900,
    },
    chevron: {
        fontSize: 18,
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
    itemHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    removeText: {
        color: colors.error,
        fontWeight: '700',
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
});


