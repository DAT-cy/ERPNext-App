// src/screens/Inventory/InsertInventoryScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Switch,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllExportImportType, getWarehouse } from '../../services/inventoryService';
import { insertInventoryStyles as styles } from '../../styles/InsertInventoryScreen.styles';
import { formatCurrentDateDisplay, formatCurrentTimeHMS } from '../../utils/date';

type InventoryItemRow = {
    id: number;
    fromWarehouse: string;
    toWarehouse: string;
    code: string;
    name: string;
    qty: string;
    unit: string;
    price: string;
};

export default function InsertInventoryScreen() {
    const navigation = useNavigation();

    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [sectionExpanded, setSectionExpanded] = useState<Record<string, boolean>>({
        section1: true,
        section2: true,
        section3: true,
    });

    const [code, setCode] = useState<string>('MAT-STE-.YYYY.');
    const [company, setCompany] = useState<string>('CTY REMAK');
    const [entryType, setEntryType] = useState<string>('');
    const [stockEntryTypes, setStockEntryTypes] = useState<string[]>([]);
    const [isEntryTypePickerVisible, setIsEntryTypePickerVisible] = useState<boolean>(false);
    const entryTypeAnim = useRef(new Animated.Value(0)).current;
    const [postDate, setPostDate] = useState<string>('');
    const [postTime, setPostTime] = useState<string>('');
    const [diffAccount, setDiffAccount] = useState<string>('6328 điều chỉnh tồn kho – COM');
    const [originLocationEnabled, setOriginLocationEnabled] = useState<boolean>(false);
    const [originLocation, setOriginLocation] = useState<string>('');
    const [warehouses, setWarehouses] = useState<string[]>([]);
    const [isWarehousePickerVisible, setIsWarehousePickerVisible] = useState<boolean>(false);
    const warehouseAnim = useRef(new Animated.Value(0)).current;
    const [description, setDescription] = useState<string>('');

    const [defaultFromWarehouse, setDefaultFromWarehouse] = useState<string>('Lại Yên – COM');
    const [defaultToWarehouse, setDefaultToWarehouse] = useState<string>('Kho đi đường – COM');
    const [isFromPickerVisible, setIsFromPickerVisible] = useState<boolean>(false);
    const [isToPickerVisible, setIsToPickerVisible] = useState<boolean>(false);
    const fromAnim = useRef(new Animated.Value(0)).current;
    const toAnim = useRef(new Animated.Value(0)).current;

    const [items, setItems] = useState<InventoryItemRow[]>([
        {
            id: 1,
            fromWarehouse: 'Lại Yên – COM',
            toWarehouse: 'Kho đi đường – COM',
            code: '',
            name: '',
            qty: '',
            unit: 'Cái',
            price: '',
        },
    ]);
    const nextIdRef = useRef<number>(2);

    // Toast animation
    const toastAnim = useRef(new Animated.Value(-100)).current;
    const [toastMessage, setToastMessage] = useState<string>('');

    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        Animated.sequence([
            Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.delay(2400),
            Animated.timing(toastAnim, { toValue: -100, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [toastAnim]);

    const toggleSection = useCallback((key: string) => {
        setSectionExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const goBack = useCallback(() => {
        if ((navigation as any)?.goBack) {
            (navigation as any).goBack();
        } else {
            showToast('Quay lại');
        }
    }, [navigation, showToast]);

    const saveTransfer = useCallback(() => {
        setIsSaved(true);
        showToast('Đã lưu phiếu chuyển kho thành công!');
    }, [showToast]);

    const addNewRow = useCallback(() => {
        const newRow: InventoryItemRow = {
            id: nextIdRef.current++,
            fromWarehouse: defaultFromWarehouse,
            toWarehouse: defaultToWarehouse,
            code: '',
            name: '',
            qty: '',
            unit: 'Cái',
            price: '',
        };
        setItems(prev => [...prev, newRow]);
        showToast('Đã thêm dòng mới');
    }, [defaultFromWarehouse, defaultToWarehouse, showToast]);

    const removeItem = useCallback((id: number) => {
        setItems(prev => prev.filter(it => it.id !== id));
        showToast('Đã xóa sản phẩm');
    }, [showToast]);

    const scanBarcode = useCallback((id: number) => {
        const sampleBarcodes = [
            'SP001234567890',
            'PRD987654321',
            'ITM456789012',
            'BAR123456789',
            'CODE987654321',
        ];
        const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
        setItems(prev => prev.map(it => it.id === id ? { ...it, code: randomBarcode } : it));
        showToast(`Đã quét barcode: ${randomBarcode}`);
    }, [showToast]);

    const updatePrices = useCallback(() => {
        showToast('Đang cập nhật giá và tình trạng khả dụng...');
    }, [showToast]);

    const uploadFile = useCallback(() => {
        showToast('Đã mở hộp thoại tải lên (mô phỏng)');
    }, [showToast]);

    const downloadFile = useCallback(() => {
        showToast('Đang tải xuống file Excel (mô phỏng)...');
    }, [showToast]);

    const units = useMemo(() => ['Cái', 'Kg', 'Thùng'], []);

    // Load Stock Entry Types and set default
    useEffect(() => {
        const loadTypes = async () => {
            try {
                const types = await getAllExportImportType();
                // Extract label/name field as Vietnamese for display if available
                const labels: string[] = Array.isArray(types)
                    ? types.map((t: any) => t?.label || t?.name || '').filter(Boolean)
                    : [];
                setStockEntryTypes(labels);
            } catch (e) {
                // ignore, will fallback to default label
            } finally {
                // Ensure default value is set for UI
                setEntryType(prev => prev || 'Chuyển kho');
            }
        };
        loadTypes();
    }, []);

    // When Kho Đích Gốc is enabled and selected, lock Kho Nhập Mặc Định
    useEffect(() => {
        if (originLocationEnabled && originLocation) {
            if (defaultToWarehouse !== 'Kho đi đường - COM') {
                setDefaultToWarehouse('Kho đi đường - COM');
            }
            setIsToPickerVisible(false);
        }
    }, [originLocationEnabled, originLocation]);

    // Initialize posting date/time to current formatted values
    useEffect(() => {
        setPostDate(prev => prev || formatCurrentDateDisplay());
        setPostTime(prev => prev || formatCurrentTimeHMS());
    }, []);

    // Animate entry type dropdown open/close
    useEffect(() => {
        Animated.timing(entryTypeAnim, {
            toValue: isEntryTypePickerVisible ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [isEntryTypePickerVisible, entryTypeAnim]);

    // Animate warehouse dropdown open/close
    useEffect(() => {
        Animated.timing(warehouseAnim, {
            toValue: isWarehousePickerVisible ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [isWarehousePickerVisible, warehouseAnim]);

    // Animate from/to dropdowns
    useEffect(() => {
        Animated.timing(fromAnim, {
            toValue: isFromPickerVisible ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [isFromPickerVisible, fromAnim]);

    useEffect(() => {
        Animated.timing(toAnim, {
            toValue: isToPickerVisible ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [isToPickerVisible, toAnim]);

    // InlineDropdown component (animated)
    const InlineDropdown: React.FC<{
        visible: boolean;
        onToggle: () => void;
        selected: string;
        placeholder: string;
        options: string[];
        onSelect: (value: string) => void;
        style?: any;
    }> = ({ visible, onToggle, selected, placeholder, options, onSelect, style }) => {
        const anim = useRef(new Animated.Value(0)).current;
        useEffect(() => {
            Animated.timing(anim, {
                toValue: visible ? 1 : 0,
                duration: 180,
                useNativeDriver: false,
            }).start();
        }, [visible, anim]);

        return (
            <View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onToggle}
                    style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }, style]}
                >
                    <Text style={{ fontSize: 16, color: selected ? '#111827' : '#9CA3AF' }}>
                        {selected || placeholder}
                    </Text>
                    <Text style={{ fontSize: 16, color: '#9CA3AF' }}>{visible ? '▴' : '▾'}</Text>
                </TouchableOpacity>
                <Animated.View
                    pointerEvents={visible ? 'auto' : 'none'}
                    style={{
                        marginTop: 6,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        overflow: 'hidden',
                        height: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }),
                        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                    }}
                >
                    <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
                        {options.map((opt, idx) => (
                            <TouchableOpacity
                                key={`${opt}-${idx}`}
                                onPress={() => {
                                    onSelect(opt);
                                    onToggle();
                                }}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 12,
                                    backgroundColor: selected === opt ? '#D1D5DB' : '#FFFFFF',
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#F3F4F6',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Text style={{ fontSize: 16, color: '#111827' }}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.iconBtn} activeOpacity={0.7}>
                    <Text style={styles.iconText}>{'‹'}</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Nhập Xuất Kho</Text>
                    <Text style={[styles.headerStatus, isSaved ? styles.statusSaved : styles.statusUnsaved]}>
                        {isSaved ? 'Đã lưu' : 'Chưa lưu'}
                    </Text>
                </View>
                <TouchableOpacity onPress={saveTransfer} style={styles.saveBtn} activeOpacity={0.8}>
                    <Text style={styles.saveBtnText}>Lưu</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Section 1: Transfer Details */}
                <View style={[styles.card, sectionExpanded.section1 ? styles.expanded : styles.collapsed]}>
                    <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('section1')} activeOpacity={0.7}>
                        <View style={styles.sectionHeaderLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]} />
                            <Text style={styles.sectionTitle}>Chi Tiết Chuyển Kho</Text>
                        </View>
                        <Text style={styles.chevron}>{sectionExpanded.section1 ? '˄' : '˅'}</Text>
                    </TouchableOpacity>
                    <View style={styles.sectionBody}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mã Số *</Text>
                            <TextInput value={code} onChangeText={setCode} style={styles.input} placeholder="Nhập mã số" />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Công ty *</Text>
                            <TextInput value={company} onChangeText={setCompany} style={styles.input} placeholder="Công ty" />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Loại Nhập Xuất *</Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setIsEntryTypePickerVisible(prev => !prev)}
                                style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center'}]}
                            >
                                <Text style={{ fontSize: 16, color: entryType ? '#111827' : '#9CA3AF' }}>
                                    {entryType || 'Chọn loại nhập xuất'}
                                </Text>
                                <Text style={{ fontSize: 16, color: '#9CA3AF' }}>{isEntryTypePickerVisible ? '▴' : '▾'}</Text>
                            </TouchableOpacity>
                            <Animated.View
                                pointerEvents={isEntryTypePickerVisible ? 'auto' : 'none'}
                                style={{
                                    marginTop: 6,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    borderRadius: 8,
                                    backgroundColor: '#FFFFFF',
                                    overflow: 'hidden',
                                    height: entryTypeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }),
                                    opacity: entryTypeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                                }}
                            >
                                <ScrollView
                                    style={{ maxHeight: 240 }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {([ 'Chuyển kho', ...stockEntryTypes.filter(t => t && t !== 'Chuyển kho') ] as string[]).map((type, idx) => (
                                        <TouchableOpacity
                                            key={`${type}-${idx}`}
                                            onPress={() => {
                                                setEntryType(type);
                                                setIsEntryTypePickerVisible(false);
                                            }}
                                            style={{
                                                paddingVertical: 12,
                                                paddingHorizontal: 12,
                                                backgroundColor: entryType === type ? '#D1D5DB' : '#FFFFFF',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#F3F4F6',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Text style={{ fontSize: 16, color: '#111827' }}>{type}</Text>

                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        </View>
                        <View style={styles.row2}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Ngày Ghi Sổ</Text>
                                <TextInput value={postDate} onChangeText={setPostDate} style={styles.input} placeholder="dd/MM/yyyy" />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Thời Gian</Text>
                                <TextInput value={postTime} onChangeText={setPostTime} style={styles.input} placeholder="HH:mm:ss" />
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tài Khoản Chênh Lệch</Text>
                            <TextInput value={diffAccount} onChangeText={setDiffAccount} style={styles.input} placeholder="Tài khoản" />
                        </View>
                        <View style={styles.formGroup}>
                            <View style={styles.switchRow}>
                                <Switch value={originLocationEnabled} onValueChange={setOriginLocationEnabled} />
                                <Text style={styles.switchLabel}>Kho Đích Gốc</Text>
                            </View>
                            {originLocationEnabled && (
                                <>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={async () => {
                                            if (warehouses.length === 0) {
                                                try {
                                                    const data = await getWarehouse();
                                                    const labels: string[] = Array.isArray(data)
                                                        ? data.map((w: any) => w?.label || w?.name || '').filter(Boolean)
                                                        : [];
                                                    setWarehouses(labels);
                                                } catch {}
                                            }
                                            setIsWarehousePickerVisible(prev => !prev);
                                        }}
                                        style={[styles.input, { marginTop: 8, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center'}]}
                                    >
                                        <Text style={{ fontSize: 16, color: originLocation ? '#111827' : '#9CA3AF' }}>
                                            {originLocation || 'Chọn kho đích gốc'}
                                        </Text>
                                        <Text style={{ fontSize: 16, color: '#9CA3AF' }}>{isWarehousePickerVisible ? '▴' : '▾'}</Text>
                                    </TouchableOpacity>
                                    <Animated.View
                                        pointerEvents={isWarehousePickerVisible ? 'auto' : 'none'}
                                        style={{
                                            marginTop: 6,
                                            borderWidth: 1,
                                            borderColor: '#E5E7EB',
                                            borderRadius: 8,
                                            backgroundColor: '#FFFFFF',
                                            overflow: 'hidden',
                                            height: warehouseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }),
                                            opacity: warehouseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                                        }}
                                    >
                                        <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
                                            {(warehouses as string[]).map((w, idx) => (
                                                <TouchableOpacity
                                                    key={`${w}-${idx}`}
                                            onPress={() => {
                                                setOriginLocation(w);
                                                // When origin location (Kho Đích Gốc) is selected, enforce rule:
                                                // if a from warehouse will be chosen next, then default to warehouse must be 'Kho đi đường - COM'
                                                // We'll enforce on from selection handler below
                                                setIsWarehousePickerVisible(false);
                                            }}
                                                    style={{
                                                        paddingVertical: 12,
                                                        paddingHorizontal: 12,
                                                        backgroundColor: originLocation === w ? '#D1D5DB' : '#FFFFFF',
                                                        borderBottomWidth: 1,
                                                        borderBottomColor: '#F3F4F6',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 16, color: '#111827' }}>{w}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </Animated.View>
                                </>
                            )}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Diễn giải</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                style={[styles.input, styles.textarea]}
                                placeholder="Nhập mô tả..."
                                multiline
                            />
                        </View>
                    </View>
                </View>

                {/* Section 2: Default Warehouses */}
                <View style={[styles.card, sectionExpanded.section2 ? styles.expanded : styles.collapsed]}>
                    <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('section2')} activeOpacity={0.7}>
                        <View style={styles.sectionHeaderLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]} />
                            <Text style={styles.sectionTitle}>Kho Đích Gốc</Text>
                        </View>
                        <Text style={styles.chevron}>{sectionExpanded.section2 ? '˄' : '˅'}</Text>
                    </TouchableOpacity>
                    <View style={styles.sectionBody}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Kho Xuất Mặc Định</Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={async () => {
                                    if (warehouses.length === 0) {
                                        try {
                                            const data = await getWarehouse();
                                            const labels: string[] = Array.isArray(data)
                                                ? data.map((w: any) => w?.label || w?.name || '').filter(Boolean)
                                                : [];
                                            setWarehouses(labels);
                                        } catch {}
                                    }
                                    setIsFromPickerVisible(prev => !prev);
                                }}
                                style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center'}]}
                            >
                                <Text style={{ fontSize: 16, color: defaultFromWarehouse ? '#111827' : '#9CA3AF' }}>
                                    {defaultFromWarehouse || 'Chọn kho xuất'}
                                </Text>
                                <Text style={{ fontSize: 16, color: '#9CA3AF' }}>{isFromPickerVisible ? '▴' : '▾'}</Text>
                            </TouchableOpacity>
                            <Animated.View
                                pointerEvents={isFromPickerVisible ? 'auto' : 'none'}
                                style={{
                                    marginTop: 6,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    borderRadius: 8,
                                    backgroundColor: '#FFFFFF',
                                    overflow: 'hidden',
                                    height: fromAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }),
                                    opacity: fromAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                                }}
                            >
                                <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
                                    {(warehouses as string[]).map((w, idx) => (
                                        <TouchableOpacity
                                            key={`${w}-${idx}`}
                                            onPress={() => {
                                                setDefaultFromWarehouse(w);
                                                // Business rule: if Kho Đích Gốc is selected, force 'Kho đi đường - COM' for defaultToWarehouse
                                                if (originLocation) {
                                                    setDefaultToWarehouse('Kho đi đường - COM');
                                                }
                                                setIsFromPickerVisible(false);
                                            }}
                                            style={{
                                                paddingVertical: 12,
                                                paddingHorizontal: 12,
                                                backgroundColor: defaultFromWarehouse === w ? '#D1D5DB' : '#FFFFFF',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#F3F4F6',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Text style={{ fontSize: 16, color: '#111827' }}>{w}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Kho Nhập Mặc Định</Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={async () => {
                                    if (originLocationEnabled && originLocation) {
                                        return; // locked
                                    }
                                    if (warehouses.length === 0) {
                                        try {
                                            const data = await getWarehouse();
                                            const labels: string[] = Array.isArray(data)
                                                ? data.map((w: any) => w?.label || w?.name || '').filter(Boolean)
                                                : [];
                                            setWarehouses(labels);
                                        } catch {}
                                    }
                                    setIsToPickerVisible(prev => !prev);
                                }}
                                style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', opacity: (originLocationEnabled && originLocation) ? 0.6 : 1 }]}
                            >
                                <Text style={{ fontSize: 16, color: defaultToWarehouse ? '#111827' : '#9CA3AF' }}>
                                    {defaultToWarehouse || 'Chọn kho nhập'}
                                </Text>
                                <Text style={{ fontSize: 16, color: '#9CA3AF' }}>{(originLocationEnabled && originLocation) ? '⛒' : (isToPickerVisible ? '▴' : '▾')}</Text>
                            </TouchableOpacity>
                            <Animated.View
                                pointerEvents={(originLocationEnabled && originLocation) ? 'none' : (isToPickerVisible ? 'auto' : 'none')}
                                style={{
                                    marginTop: 6,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    borderRadius: 8,
                                    backgroundColor: '#FFFFFF',
                                    overflow: 'hidden',
                                    height: (originLocationEnabled && originLocation) ? 0 : toAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }),
                                    opacity: (originLocationEnabled && originLocation) ? 0 : toAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                                }}
                            >
                                <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
                                    {(warehouses as string[]).map((w, idx) => (
                                        <TouchableOpacity
                                            key={`${w}-${idx}`}
                                            onPress={() => {
                                                if (originLocationEnabled && originLocation) return;
                                                setDefaultToWarehouse(w);
                                                setIsToPickerVisible(false);
                                            }}
                                            style={{
                                                paddingVertical: 12,
                                                paddingHorizontal: 12,
                                                backgroundColor: defaultToWarehouse === w ? '#D1D5DB' : '#FFFFFF',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#F3F4F6',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Text style={{ fontSize: 16, color: '#111827' }}>{w}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        </View>
                    </View>
                </View>

                {/* Section 3: Items */}
                <View style={[styles.card, sectionExpanded.section3 ? styles.expanded : styles.collapsed]}>
                    <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('section3')} activeOpacity={0.7}>
                        <View style={styles.sectionHeaderLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]} />
                            <Text style={styles.sectionTitle}>Danh Sách Sản Phẩm</Text>
                        </View>
                        <Text style={styles.chevron}>{sectionExpanded.section3 ? '˄' : '˅'}</Text>
                    </TouchableOpacity>
                    <View style={styles.sectionBody}>
                        <View style={styles.row2}>
                            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={addNewRow} activeOpacity={0.8}>
                                <Text style={styles.btnText}>Thêm dòng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => showToast('Mở danh sách sản phẩm để chọn')} activeOpacity={0.8}>
                                <Text style={styles.btnText}>Thêm sản phẩm</Text>
                            </TouchableOpacity>
                        </View>

                        {items.map(item => (
                            <View key={item.id} style={styles.itemCard}>
                                <View style={styles.itemHeaderRow}>
                                    <Text style={styles.itemTitle}>Sản phẩm #{item.id}</Text>
                                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                                        <Text style={styles.removeText}>Xóa</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.row2}>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>Kho Xuất</Text>
                                        <TextInput
                                            value={item.fromWarehouse}
                                            onChangeText={(t) => setItems(prev => prev.map(it => it.id === item.id ? { ...it, fromWarehouse: t } : it))}
                                            style={styles.input}
                                            placeholder="Kho xuất"
                                        />
                                    </View>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>Kho Nhập</Text>
                                        <TextInput
                                            value={item.toWarehouse}
                                            onChangeText={(t) => setItems(prev => prev.map(it => it.id === item.id ? { ...it, toWarehouse: t } : it))}
                                            style={styles.input}
                                            placeholder="Kho nhập"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Mã Sản Phẩm</Text>
                                    <View style={styles.inlineRow}>
                                        <TextInput
                                            value={item.code}
                                            onChangeText={(t) => setItems(prev => prev.map(it => it.id === item.id ? { ...it, code: t } : it))}
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder="Nhập mã hoặc quét barcode..."
                                        />
                                        <TouchableOpacity style={[styles.smallBtn, styles.btnPrimary]} onPress={() => scanBarcode(item.id)}>
                                            <Text style={styles.smallBtnText}>Quét</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Tên Sản Phẩm</Text>
                                    <TextInput
                                        value={item.name}
                                        onChangeText={(t) => setItems(prev => prev.map(it => it.id === item.id ? { ...it, name: t } : it))}
                                        style={styles.input}
                                        placeholder="Nhập tên..."
                                    />
                                </View>

                                <View style={styles.row3}>
                                    <View style={styles.col3}>
                                        <Text style={styles.label}>Số Lượng</Text>
                                        <TextInput
                                            keyboardType="numeric"
                                            value={item.qty}
                                            onChangeText={(t) => setItems(prev => prev.map(it => it.id === item.id ? { ...it, qty: t } : it))}
                                            style={styles.input}
                                            placeholder="0"
                                        />
                                    </View>
                                    <View style={styles.col3}>
                                        <Text style={styles.label}>Đơn Vị</Text>
                                        <TextInput
                                            value={item.unit}
                                            onChangeText={(t) => setItems(prev => prev.map(it => it.id === item.id ? { ...it, unit: t } : it))}
                                            style={styles.input}
                                            placeholder={units[0]}
                                        />
                                    </View>
                                    <View style={styles.col3}>
                                        <Text style={styles.label}>Giá</Text>
                                        <TextInput
                                            keyboardType="numeric"
                                            value={item.price}
                                            onChangeText={(t) => setItems(prev => prev.map(it => it.id === item.id ? { ...it, price: t } : it))}
                                            style={styles.input}
                                            placeholder="0"
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={[styles.btn, styles.btnWarning, { marginTop: 12 }]} onPress={updatePrices} activeOpacity={0.8}>
                            <Text style={styles.btnText}>Cập Nhật Giá và Tình Trạng Khả Dụng</Text>
                        </TouchableOpacity>

                        <View style={styles.row2}>
                            <TouchableOpacity style={[styles.btn, styles.btnDark]} onPress={uploadFile} activeOpacity={0.8}>
                                <Text style={styles.btnText}>Tải lên</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnDark]} onPress={downloadFile} activeOpacity={0.8}>
                                <Text style={styles.btnText}>Tải xuống</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            

            <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
                <Text style={styles.toastText}>{toastMessage || 'Thao tác thành công!'}</Text>
            </Animated.View>
        </SafeAreaView>
    );
}


