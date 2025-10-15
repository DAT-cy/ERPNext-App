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
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllExportImportType, getWarehouse } from '../../services/inventoryService';
import { getItemDetails, getIncomingRate, getStockBalance } from '../../services/inventoryInsertService';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';
import { insertInventoryStyles as styles } from '../../styles/InsertInventoryScreen.styles';
import { formatCurrentDateDisplay, formatCurrentTimeHMS } from '../../utils/date';

type InventoryItemRow = {
    fromWarehouse: string;
    toWarehouse: string;
    code: string;
    name: string;
    qty: string;
    unit: string;
    price: string;
    isStockItem: boolean;
};

export default function InsertInventoryScreen() {
    const navigation = useNavigation();

    // States
    const [isSaved, setIsSaved] = useState(false);
    const [sectionExpanded, setSectionExpanded] = useState<Record<string, boolean>>({
        section1: true,
        section2: true,
        section3: true,
    });

    // Form data
    const [code, setCode] = useState('MAT-STE-.YYYY.');
    const [company, setCompany] = useState('CTY REMAK');
    const [entryType, setEntryType] = useState('');
    const [stockEntryTypes, setStockEntryTypes] = useState<string[]>([]);
    const [postDate, setPostDate] = useState('');
    const [postTime, setPostTime] = useState('');
    const [diffAccount, setDiffAccount] = useState('6328 điều chỉnh tồn kho – COM');
    const [description, setDescription] = useState('');

    // Warehouse settings
    const [originLocationEnabled, setOriginLocationEnabled] = useState(false);
    const [originLocation, setOriginLocation] = useState('');
    const [defaultFromWarehouse, setDefaultFromWarehouse] = useState('');
    const [defaultToWarehouse, setDefaultToWarehouse] = useState('');
    const [warehouses, setWarehouses] = useState<string[]>([]);

    // Dropdown states
    const [isEntryTypePickerVisible, setIsEntryTypePickerVisible] = useState(false);
    const [isWarehousePickerVisible, setIsWarehousePickerVisible] = useState(false);
    const [isFromPickerVisible, setIsFromPickerVisible] = useState(false);
    const [isToPickerVisible, setIsToPickerVisible] = useState(false);
    // Items
    const [items, setItems] = useState<InventoryItemRow[]>([]);
    // UI states
    const [toastMessage, setToastMessage] = useState('');
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [currentScanningItemIndex, setCurrentScanningItemIndex] = useState<number | null>(null);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    // Animations
    const toastAnim = useRef(new Animated.Value(-100)).current;
    const entryTypeAnim = useRef(new Animated.Value(0)).current;
    const warehouseAnim = useRef(new Animated.Value(0)).current;
    const fromAnim = useRef(new Animated.Value(0)).current;
    const toAnim = useRef(new Animated.Value(0)).current;

    // Toast function
    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        Animated.sequence([
            Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.delay(2400),
            Animated.timing(toastAnim, { toValue: -100, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [toastAnim]);

    // Helpers
    const toApiDate = (ddmmyyyy: string) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(ddmmyyyy)) return ddmmyyyy;
        const m = ddmmyyyy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
        return ddmmyyyy;
    };

    const createEmptyRow = useCallback((): InventoryItemRow => ({
        fromWarehouse: defaultFromWarehouse,
        toWarehouse: defaultToWarehouse,
        code: '',
        name: '',
        qty: '',
        unit: '',
        price: '',
        isStockItem: true,
    }), [defaultFromWarehouse, defaultToWarehouse]);

    const fetchRateAndQty = useCallback(async (itemCode: string, warehouse: string) => {
        let incomingRate = '0';
        let stockQty: string | undefined;
        try {
            const rateResponse = await getIncomingRate(
                itemCode,
                toApiDate(postDate),
                postTime,
                warehouse || ''
            );
            if (rateResponse && rateResponse.message) {
                incomingRate = rateResponse.message.toString();
            }
        } catch {}

        try {
            const balanceResponse = await getStockBalance(
                itemCode,
                toApiDate(postDate),
                postTime,
                warehouse || ''
            );
            const stockQtyVal = balanceResponse?.message?.qty;
            if (stockQtyVal !== undefined && stockQtyVal !== null) {
                stockQty = String(stockQtyVal);
            }
        } catch {}

        return { incomingRate, stockQty } as const;
    }, [postDate, postTime]);

    // Navigation
    const goBack = useCallback(() => {
        (navigation as any)?.goBack?.() || showToast('Quay lại');
    }, [navigation, showToast]);

    const saveTransfer = useCallback(() => {
        setIsSaved(true);
        showToast('Đã lưu phiếu chuyển kho thành công!');
    }, [showToast]);

    // Items management
    const addNewRow = useCallback(() => {
        setItems(prev => [...prev, createEmptyRow()]);
        showToast('Đã thêm dòng mới');
    }, [createEmptyRow, showToast]);

    const removeItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
        showToast('Đã xóa sản phẩm');
    }, [showToast]);

    const editItem = useCallback((index: number) => {
        setEditingItemIndex(index);
        showToast(`Đang chỉnh sửa sản phẩm #${index + 1}`);
    }, []);

    const saveEdit = useCallback(() => {
        setEditingItemIndex(null);
        showToast('Đã lưu thay đổi');
    }, []);

    const cancelEdit = useCallback(() => {
        setEditingItemIndex(null);
        showToast('Đã hủy chỉnh sửa');
    }, []);

    const updateItem = useCallback((index: number, field: keyof InventoryItemRow, value: string | boolean) => {
        setItems(prev => {
            const next = prev.map((it, i) => i === index ? { ...it, [field]: value } : it);
            if (field === 'fromWarehouse') {
                const changed = next[index];
                const itemCode = changed.code;
                const warehouse = typeof value === 'string' ? value : changed.fromWarehouse;
                if (itemCode) {
                    (async () => {
                        const { incomingRate, stockQty } = await fetchRateAndQty(itemCode, warehouse || '');
                        setItems(cur => cur.map((it2, i2) => i2 === index ? { ...it2, price: incomingRate } : it2));
                        if (stockQty !== undefined) {
                            setItems(cur => cur.map((it2, i2) => i2 === index ? { ...it2, qty: stockQty as string } : it2));
                        }
                    })();
                }
            }
            return next;
        });
    }, [fetchRateAndQty]);

    // Barcode scanning
    const scanBarcode = useCallback((index: number) => {
        setCurrentScanningItemIndex(index);
        setIsScannerVisible(true);
    }, []);

    // Quick scan: add a new row then open scanner immediately
    const quickScanNewProduct = useCallback(() => {
        setItems(prev => {
            const next = [...prev, createEmptyRow()];
            const newIndex = next.length - 1;
            // set scanner target and open
            setCurrentScanningItemIndex(newIndex);
            setIsScannerVisible(true);
            return next;
        });
    }, [createEmptyRow]);

    const handleBarcodeScan = useCallback(async (barcode: string) => {
        if (currentScanningItemIndex === null) return;

        const itemIndex = currentScanningItemIndex;
        setIsScannerVisible(false);
        setCurrentScanningItemIndex(null);

        try {
            showToast('Đang tải thông tin sản phẩm...');
            const response = await getItemDetails(barcode);
            const itemDetails = response?.data;

            if (itemDetails) {
                // Fetch incoming rate (price) and stock quantity for the item
                let incomingRate = '0';
                let stockQty = '';
                try {
                    showToast('Đang tải giá sản phẩm...');
                    const { incomingRate: rate } = await fetchRateAndQty(
                        barcode,
                        (items[itemIndex]?.fromWarehouse || defaultFromWarehouse || '')
                    );
                    incomingRate = rate;
                } catch (rateError) {
                    incomingRate = itemDetails.last_purchase_rate ? itemDetails.last_purchase_rate.toString() : '0';
                }

                // Fetch stock balance for quantity
                try {
                    const { stockQty: qty } = await fetchRateAndQty(
                        barcode,
                        (items[itemIndex]?.fromWarehouse || defaultFromWarehouse || '')
                    );
                    if (qty !== undefined) stockQty = qty;
                } catch { }

                setItems(prev => prev.map((it, i) =>
                    i === itemIndex ? {
                        ...it,
                        code: itemDetails.item_code || barcode,
                        name: itemDetails.item_name || '',
                        unit: itemDetails.stock_uom || 'Cái',
                        price: incomingRate,
                        isStockItem: itemDetails.is_stock_item === 1,
                        qty: stockQty || (itemDetails.opening_stock ? itemDetails.opening_stock.toString() : '1')
                    } : it
                ));
                showToast(`Đã quét và tải thông tin: ${itemDetails.item_name} - Giá: ${incomingRate}${stockQty ? ` - Tồn: ${stockQty}` : ''}`);
            } else {
                updateItem(itemIndex, 'code', barcode);
                showToast(`Đã quét barcode: ${barcode} (không tìm thấy thông tin sản phẩm)`);
            }
        } catch (error) {
            updateItem(itemIndex, 'code', barcode);
            showToast(`Đã quét barcode: ${barcode}`);
        }
    }, [currentScanningItemIndex, showToast, updateItem, postDate, postTime, company]);

    // Warehouse management
    const loadWarehouses = useCallback(async () => {
        if (warehouses.length === 0) {
            try {
                const data = await getWarehouse();
                const labels: string[] = Array.isArray(data)
                    ? data.map((w: any) => w?.label || w?.name || '').filter(Boolean)
                    : [];
                setWarehouses(labels);
            } catch { }
        }
    }, [warehouses.length]);

    // Effects
    useEffect(() => {
        const loadTypes = async () => {
            try {
                const types = await getAllExportImportType();
                const labels: string[] = Array.isArray(types)
                    ? types.map((t: any) => t?.label || t?.name || '').filter(Boolean)
                    : [];
                setStockEntryTypes(labels);
            } catch { }
            setEntryType(prev => prev || 'Chuyển kho');
        };
        loadTypes();
    }, []);

    useEffect(() => {
        setPostDate(prev => prev || formatCurrentDateDisplay());
        setPostTime(prev => prev || formatCurrentTimeHMS());
    }, []);

    useEffect(() => {
        if (originLocationEnabled && originLocation && defaultToWarehouse !== 'Kho đi đường - COM') {
            setDefaultToWarehouse('Kho đi đường - COM');
        }
    }, [originLocationEnabled, originLocation, defaultToWarehouse]);

    // Update all items when default warehouses change and refetch prices & qty once
    useEffect(() => {
        if (items.length === 0) return;
        if (!(defaultFromWarehouse || defaultToWarehouse)) return;

        // 1) Update warehouses
        setItems(prev => prev.map(item => ({
            ...item,
            fromWarehouse: defaultFromWarehouse || item.fromWarehouse,
            toWarehouse: defaultToWarehouse || item.toWarehouse
        })));

        // 2) Refetch prices and stock qty based on new fromWarehouse
        const fetchPrices = async () => {
            const snapshot = items; // use current snapshot to know which rows have codes
            for (let i = 0; i < snapshot.length; i++) {
                const row = snapshot[i];
                const wh = defaultFromWarehouse || row.fromWarehouse;
                if (!row.code || !wh) continue;
                try {
                    const { incomingRate, stockQty } = await fetchRateAndQty(row.code, wh || '');
                    setItems(cur => cur.map((it2, idx) => idx === i ? { ...it2, price: incomingRate } : it2));
                    if (stockQty !== undefined) {
                        setItems(cur => cur.map((it2, idx) => idx === i ? { ...it2, qty: stockQty as string } : it2));
                    }
                } catch { }
            }
        };
        fetchPrices();
    }, [defaultFromWarehouse, defaultToWarehouse, fetchRateAndQty]);

    // Animation effects
    useEffect(() => {
        Animated.timing(entryTypeAnim, {
            toValue: isEntryTypePickerVisible ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [isEntryTypePickerVisible, entryTypeAnim]);

    useEffect(() => {
        Animated.timing(warehouseAnim, {
            toValue: isWarehousePickerVisible ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [isWarehousePickerVisible, warehouseAnim]);

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

    // Render helpers
    const renderSectionHeader = (title: string, sectionKey: string, iconColor: string) => (
        <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setSectionExpanded(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
            activeOpacity={0.7}
        >
            <View style={styles.sectionHeaderLeft}>
                <View style={[styles.iconCircle, { backgroundColor: iconColor }]} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Text style={styles.chevron}>{sectionExpanded[sectionKey] ? '˄' : '˅'}</Text>
        </TouchableOpacity>
    );

    const renderFormField = (
        label: string,
        value: string,
        onChangeText: (text: string) => void,
        placeholder?: string,
        disabled?: boolean
    ) => (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                style={[
                    styles.input,
                    disabled && styles.disabledInput
                ]}
                placeholder={placeholder}
                editable={!disabled}
            />
        </View>
    );

    const renderDropdown = (
        label: string,
        value: string,
        options: string[],
        onSelect: (value: string) => void,
        placeholder: string,
        isVisible: boolean,
        onToggle: () => void,
        anim: Animated.Value,
        disabled?: boolean
    ) => (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={disabled ? undefined : onToggle}
                style={[
                    styles.input,
                    {
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        opacity: disabled ? 0.6 : 1
                    }
                ]}
            >
                <Text style={{ fontSize: 16, color: value ? '#111827' : '#9CA3AF' }}>
                    {value || placeholder}
                </Text>
                <Text style={{ fontSize: 16, color: '#9CA3AF' }}>
                    {disabled ? '⛒' : (isVisible ? '▴' : '▾')}
                </Text>
            </TouchableOpacity>
            <Animated.View
                pointerEvents={disabled ? 'none' : (isVisible ? 'auto' : 'none')}
                style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                    height: disabled ? 0 : anim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }),
                    opacity: disabled ? 0 : anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                }}
            >
                <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
                    {options.map((option, idx) => (
                        <TouchableOpacity
                            key={`${option}-${idx}`}
                            onPress={() => {
                                onSelect(option);
                                onToggle();
                            }}
                            style={{
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                                backgroundColor: value === option ? '#D1D5DB' : '#FFFFFF',
                                borderBottomWidth: 1,
                                borderBottomColor: '#F3F4F6',
                            }}
                        >
                            <Text style={{ fontSize: 16, color: '#111827' }}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>
        </View>
    );

    const renderItemCard = (item: InventoryItemRow, index: number) => (
        <View
            key={`item-${index}-${item.code || 'empty'}`}
            style={[
                styles.itemCard,
                editingItemIndex === index && styles.editingCard
            ]}
        >
            <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitle}>Sản phẩm #{index + 1}</Text>
                <View style={styles.itemActions}>
                    {editingItemIndex === index ? (
                        <>
                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={saveEdit}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.saveBtnText}>✓</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={cancelEdit}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelBtnText}>✕</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => editItem(index)}
                                activeOpacity={0.7}
                            >
                                <Image source={require('../../assets/edit.png')} style={{ width: 30, height: 30, tintColor: '#000' }} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => removeItem(index)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.deleteBtnText}>X</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            <View style={styles.row2}>
                <View style={styles.col}>
                    <Text style={styles.label}>Kho Xuất</Text>
                    <TextInput
                        value={item.fromWarehouse}
                        onChangeText={(t) => updateItem(index, 'fromWarehouse', t)}
                        style={[
                            styles.input,
                            { fontWeight: '700', color: '#000000' },
                            editingItemIndex !== index && {
                                backgroundColor: '#F3F4F6',
                                color: '#000000',
                                opacity: 1,
                            }
                        ]}
                        placeholder="Kho xuất"
                        editable={editingItemIndex === index}
                    />
                </View>
                <View style={styles.col}>
                    <Text style={styles.label}>Kho Nhập</Text>
                    <TextInput
                        value={item.toWarehouse}
                        onChangeText={(t) => updateItem(index, 'toWarehouse', t)}
                        style={[
                            styles.input,
                            { fontWeight: '700', color: '#000000' },
                            editingItemIndex !== index && {
                                backgroundColor: '#F3F4F6',
                                color: '#000000',
                                opacity: 1,
                            }
                        ]}
                        placeholder="Kho nhập"
                        editable={editingItemIndex === index}
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Mã Sản Phẩm</Text>
                <View style={styles.inlineRow}>
                    <TextInput
                        value={item.code}
                        onChangeText={(t) => updateItem(index, 'code', t)}
                        style={[
                            styles.input,
                            { flex: 1, fontWeight: '700', color: '#000000' },
                            editingItemIndex !== index && styles.disabledInput
                        ]}
                        placeholder="Nhập mã hoặc quét barcode..."
                        editable={editingItemIndex === index}
                    />

                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Tên Sản Phẩm</Text>
                <TextInput
                    value={item.name}
                    onChangeText={(t) => updateItem(index, 'name', t)}
                    style={[
                        styles.input,
                        { fontWeight: '700', color: '#000000' },
                        editingItemIndex !== index && styles.disabledInput
                    ]}
                    placeholder="Nhập tên..."
                    editable={editingItemIndex === index}
                />
            </View>

            <View style={styles.row3}>
                <View style={styles.col3}>
                    <Text style={styles.label}>Số Lượng</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={item.qty}
                        onChangeText={(t) => updateItem(index, 'qty', t)}
                        style={[
                            styles.input,
                            { fontWeight: '700', color: '#000000' },
                            editingItemIndex !== index && {
                                backgroundColor: '#F3F4F6',
                                color: '#000000',
                                opacity: 1,
                            }
                        ]}
                        placeholder="0"
                        editable={editingItemIndex === index}
                    />
                </View>
                <View style={styles.col3}>
                    <Text style={styles.label}>Đơn Vị</Text>
                    <TextInput
                        value={item.unit}
                        onChangeText={(t) => updateItem(index, 'unit', t)}
                        style={[
                            styles.input,
                            { fontWeight: '700', color: '#000000' },
                            editingItemIndex !== index && {
                                backgroundColor: '#F3F4F6',
                                color: '#000000',
                                opacity: 1,
                            }
                        ]}
                        placeholder="Nhập đơn vị"
                        editable={editingItemIndex === index}
                    />
                </View>
                <View style={styles.col3}>
                    <Text style={styles.label}>Đơn giá</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={item.price}
                        onChangeText={(t) => updateItem(index, 'price', t)}
                        style={[
                            styles.input,
                            { fontWeight: '700', color: '#000000' },
                            editingItemIndex !== index && {
                                backgroundColor: '#F3F4F6',
                                color: '#000000',
                                opacity: 1,
                            }
                        ]}
                        placeholder="0"
                        editable={editingItemIndex === index}
                    />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
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
                    {renderSectionHeader('Chi Tiết Chuyển Kho', 'section1', '#DBEAFE')}
                    <View style={styles.sectionBody}>
                        {renderFormField('Mã Số *', code, setCode, 'Nhập mã số', true)}
                        {renderFormField('Công ty *', company, setCompany, 'Công ty', true)}

                        {renderDropdown(
                            'Loại Nhập Xuất *',
                            entryType,
                            ['Chuyển kho', ...stockEntryTypes.filter(t => t && t !== 'Chuyển kho')],
                            setEntryType,
                            'Chọn loại nhập xuất',
                            isEntryTypePickerVisible,
                            () => setIsEntryTypePickerVisible(!isEntryTypePickerVisible),
                            entryTypeAnim
                        )}

                        <View style={styles.row2}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Ngày Ghi Sổ</Text>
                                <TextInput value={postDate} onChangeText={setPostDate} style={[styles.input, styles.disabledInput]} placeholder="dd/MM/yyyy" editable={false} />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Thời Gian</Text>
                                <TextInput value={postTime} onChangeText={setPostTime} style={[styles.input, styles.disabledInput]} placeholder="HH:mm:ss" editable={false} />
                            </View>
                        </View>

                        {renderFormField('Tài Khoản Chênh Lệch', diffAccount, setDiffAccount, 'Tài khoản', true)}

                        <View style={styles.formGroup}>
                            <View style={styles.switchRow}>
                                <Switch value={originLocationEnabled} onValueChange={setOriginLocationEnabled} />
                                <Text style={styles.switchLabel}>Kho Đích Gốc</Text>
                            </View>
                            {originLocationEnabled && (
                                renderDropdown(
                                    '',
                                    originLocation,
                                    warehouses,
                                    setOriginLocation,
                                    'Chọn kho đích gốc',
                                    isWarehousePickerVisible,
                                    async () => {
                                        await loadWarehouses();
                                        setIsWarehousePickerVisible(!isWarehousePickerVisible);
                                    },
                                    warehouseAnim
                                )
                            )}
                        </View>

                        {renderFormField('Diễn giải', description, setDescription, 'Nhập mô tả...')}
                    </View>
                </View>

                {/* Section 2: Default Warehouses */}
                <View style={[styles.card, sectionExpanded.section2 ? styles.expanded : styles.collapsed]}>
                    {renderSectionHeader('Kho Đích Gốc', 'section2', '#DCFCE7')}
                    <View style={styles.sectionBody}>
                        {renderDropdown(
                            'Kho Xuất Mặc Định',
                            defaultFromWarehouse,
                            warehouses,
                            (value) => {
                                setDefaultFromWarehouse(value);
                                if (originLocation) {
                                    setDefaultToWarehouse('Kho đi đường - COM');
                                }
                            },
                            'Chọn kho xuất',
                            isFromPickerVisible,
                            async () => {
                                await loadWarehouses();
                                setIsFromPickerVisible(!isFromPickerVisible);
                            },
                            fromAnim
                        )}

                        {renderDropdown(
                            'Kho Nhập Mặc Định',
                            defaultToWarehouse,
                            warehouses,
                            setDefaultToWarehouse,
                            'Chọn kho nhập',
                            isToPickerVisible,
                            async () => {
                                if (originLocationEnabled && originLocation) return;
                                await loadWarehouses();
                                setIsToPickerVisible(!isToPickerVisible);
                            },
                            toAnim,
                            !!(originLocationEnabled && originLocation)
                        )}
                    </View>
                </View>

                {/* Section 3: Items */}
                <View style={[styles.card, sectionExpanded.section3 ? styles.expanded : styles.collapsed]}>
                    {renderSectionHeader('Danh Sách Sản Phẩm', 'section3', '#EDE9FE')}
                    <View style={styles.sectionBody}>
                        <View style={styles.row2}>
                            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={addNewRow} activeOpacity={0.8}>
                                <Text style={styles.btnText}>Thêm dòng</Text>
                            </TouchableOpacity>
                        </View>

                        {items.map((item, index) => renderItemCard(item, index))}

                        {/* <View style={styles.row2}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnWarning, { flex: 1 }]}
                                onPress={() => showToast('Đang cập nhật giá và tình trạng khả dụng...')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnText}>Cập Nhật Giá</Text>
                                        </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnSuccess, { flex: 1, marginLeft: 8 }]}
                                onPress={() => {
                                    setItems(prev => prev.map(item => ({
                                        ...item,
                                        fromWarehouse: defaultFromWarehouse || item.fromWarehouse,
                                        toWarehouse: defaultToWarehouse || item.toWarehouse
                                    })));
                                    showToast(`Đã cập nhật kho cho ${items.length} sản phẩm`);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnText}>Cập Nhật Kho</Text>
                        </TouchableOpacity>
                        </View> */}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Scan Button */}
            <TouchableOpacity style={styles.floatingScanButton} onPress={quickScanNewProduct} activeOpacity={0.85}>
                <Text style={styles.floatingScanText}>Quét</Text>
            </TouchableOpacity>

            {/* Toast */}
            <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
                <Text style={styles.toastText}>{toastMessage || 'Thao tác thành công!'}</Text>
            </Animated.View>

            {/* Barcode Scanner */}
            <BarcodeScanner
                visible={isScannerVisible}
                onClose={() => {
                    setIsScannerVisible(false);
                    setCurrentScanningItemIndex(null);
                }}
                onScan={handleBarcodeScan}
                title="Quét Barcode Sản Phẩm"
            />
        </SafeAreaView>
    );
}