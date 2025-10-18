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
    Modal,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllExportImportType, getWarehouse, InventoryItem, toEnglishStockEntryType } from '../../services/inventoryService';
import { getItemDetails, getIncomingRate, getStockBalance, saveInventory } from '../../services/inventoryInsertService';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';
import { Input } from '../../components/Input';
import InventoryFilterModal from '../../components/InventoryFilter/InventoryFilterModal';
import { insertInventoryStyles as styles } from '../../styles/InsertInventoryScreen.styles';
import { formatCurrentDateDisplay, formatCurrentTimeHMS } from '../../utils/date';
import { SaveInventoryRequest, StockEntryItem } from '../../types/inventory.types';
import { getInventoryDetail } from '@/services/inventoryDetailService';

type InventoryItemRow = {
    fromWarehouse: string;
    toWarehouse: string;
    code: string;
    name: string;
    qty: string;
    qtyAvailable?: string;
    unit: string;
    price: string;
    isStockItem: boolean;
    isSelected?: boolean;
};

type ProgressStep = {
    id: string;
    label: string;
    status: 'completed' | 'active' | 'pending';
};

type FilterOption = {
    value: string;
    label: string;
    category: string;
};

type FilterCategory = {
    key: string;
    title: string;
    icon?: string;
};

type ActiveFilter = {
    key: string;
    label: string;
    category: string;
    value: string;
};

export default function InsertInventoryScreen() {
    const navigation = useNavigation();

    // States
    const [isSaved, setIsSaved] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Form data
    const [code, setCode] = useState('MAT-STE-.YYYY.');
    const [company, setCompany] = useState('CTY REMAK');
    const [entryType, setEntryType] = useState('');
    const [stockEntryTypes, setStockEntryTypes] = useState<string[]>([]);
    const [postDate, setPostDate] = useState('');
    const [postTime, setPostTime] = useState('');
    const [diffAccount, setDiffAccount] = useState('6328 Điều chỉnh tồn kho - COM');
    const [description, setDescription] = useState('');
    // Warehouse settings
    const [originLocationEnabled, setOriginLocationEnabled] = useState(false);
    const [originLocation, setOriginLocation] = useState('');
    const [defaultFromWarehouse, setDefaultFromWarehouse] = useState('');
    const [defaultToWarehouse, setDefaultToWarehouse] = useState('');
    const [warehouses, setWarehouses] = useState<string[]>([]);

    // Items
    const [items, setItems] = useState<InventoryItemRow[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);

    // UI states
    const [toastMessage, setToastMessage] = useState('');
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [currentScanningItemIndex, setCurrentScanningItemIndex] = useState<number | null>(null);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    // Filter states
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [filterCategories] = useState<FilterCategory[]>([
        { key: 'stock_entry_type', title: 'Loại nhập xuất *' },
        { key: 'warehouse_origin', title: 'Kho gốc' },
        { key: 'warehouse_export', title: 'Kho xuất *' },
        {key : 'warehouse_import', title: 'Kho nhập *'}
    ]);
    const [filterOptions, setFilterOptions] = useState<Record<string, FilterOption[]>>({
        stock_entry_type: [],
        warehouse_origin: [],
        warehouse_export: [],
        warehouse_import: [],

    });

    // Animations
    const toastAnim = useRef(new Animated.Value(-100)).current;

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
        isSelected: false,
    }), [defaultFromWarehouse, defaultToWarehouse]);

    const fetchRateAndQty = useCallback(async (itemCode: string, warehouse: string) => {
        // Prefer selected warehouse_export from filters if available
        const exportWh = activeFilters.find(f => f.category === 'warehouse_export')?.value;
        const resolvedWarehouse = (exportWh || warehouse || '').toString();
        let incomingRate = '0';
        let stockQty: string | undefined;
        try {
            const rateResponse = await getIncomingRate(
                itemCode,
                toApiDate(postDate),
                postTime,
                resolvedWarehouse
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
                resolvedWarehouse
            );
            const stockQtyVal = balanceResponse?.message?.qty;
            if (stockQtyVal !== undefined && stockQtyVal !== null) {
                stockQty = String(stockQtyVal);
            }
        } catch {}

        return { incomingRate, stockQty } as const;
    }, [postDate, postTime, activeFilters]);

    // Navigation
    const goBack = useCallback(() => {
        (navigation as any)?.goBack?.() || showToast('Quay lại');
    }, [navigation, showToast]);

    const saveTransfer = useCallback(async () => {
        try {
            // Get selected filters
            const stockEntryTypeFilter = activeFilters.find(f => f.category === 'stock_entry_type');
            const exportWarehouseFilter = activeFilters.find(f => f.category === 'warehouse_export');
            const importWarehouseFilter = activeFilters.find(f => f.category === 'warehouse_import');

            // Collect all validation errors
            const validationErrors: string[] = [];

            if (!stockEntryTypeFilter) {
                validationErrors.push('• Loại nhập xuất');
            }

            if (!exportWarehouseFilter) {
                validationErrors.push('• Kho xuất');
            }

            if (!importWarehouseFilter) {
                validationErrors.push('• Kho nhập');
            }

            if (items.length === 0) {
                validationErrors.push('• Ít nhất một sản phẩm');
            } else {
                // Validate item quantities
                const itemsWithEmptyQty = items.filter(item => !item.qty || item.qty.trim() === '' || parseFloat(item.qty) <= 0);
                if (itemsWithEmptyQty.length > 0) {
                    validationErrors.push('• Số lượng cho tất cả sản phẩm');
                }

                // Validate item codes
                const itemsWithEmptyCode = items.filter(item => !item.code || item.code.trim() === '');
                if (itemsWithEmptyCode.length > 0) {
                    validationErrors.push('• Mã sản phẩm cho tất cả items');
                }
            }

            // Show validation errors if any
            if (validationErrors.length > 0) {
                Alert.alert(
                    'Thiếu thông tin bắt buộc', 
                    `Vui lòng điền đầy đủ các trường sau:\n\n${validationErrors.join('\n')}`,
                    [{ text: 'OK', style: 'default' }]
                );
                return;
            }

            // Prepare stock entry items
            const stockEntryItems: StockEntryItem[] = items.map(item => ({
                doctype: 'Stock Entry Detail',
                item_code: item.code,
                item_name: item.name,
                qty: parseFloat(item.qty) || 0,
                s_warehouse: exportWarehouseFilter!.value,
                t_warehouse: importWarehouseFilter!.value,
                basic_rate: parseFloat(item.price) || 0,
                stock_uom: item.unit,
                uom: item.unit,
                expense_account: '6328 Điều chỉnh tồn kho - COM'
            }));

            // Origin warehouse logic for transit
            const originWarehouseFilter = activeFilters.find(f => f.category === 'warehouse_origin');
            const addToTransit = originWarehouseFilter ? '1' : '0';
            const originalTargetWarehouse = originWarehouseFilter?.value || importWarehouseFilter!.value;

            // Prepare save request
            const saveRequest: SaveInventoryRequest = {
                docstatus: '0',
                doctype: 'Stock Entry',
                purpose: toEnglishStockEntryType(stockEntryTypeFilter!.value),
                company: 'CTY REMAK',
                posting_date: postDate,
                posting_time: postTime,
                stock_entry_type: stockEntryTypeFilter!.value,
                add_to_transit: addToTransit,
                custom_original_target_warehouse: originalTargetWarehouse,
                from_warehouse: exportWarehouseFilter!.value,
                to_warehouse: importWarehouseFilter!.value,
                custom_interpretation: description,
                items: stockEntryItems
            };

            console.log('Saving inventory:', saveRequest);

            // Call API
            const response = await saveInventory(saveRequest);
            
            if (response?.data?.name) {
                setIsSaved(true);
                handleItemPress(response.data.name);
            } else {
                Alert.alert('Lỗi', 'Lưu thất bại. Vui lòng thử lại.');
            }
        } catch (error: any) {
            console.error('Save error:', error);

            Alert.alert('Lỗi', `Không thể lưu dữ liệu: ${error.message || 'Có lỗi xảy ra'}`);
        }
    }, [items, activeFilters, postDate, postTime, showToast, navigation]);


    const handleItemPress = async (item: string) => {
        try {            
            // Call API to get detail
            const response = await getInventoryDetail(item);
            
            if (response.success && response.data) {
                
                // Navigate to detail screen with data
                (navigation as any).navigate('InventoryDetailScreen', {
                    inventoryDetail: response.data
                });
            } else {
                Alert.alert('Lỗi', 'Không thể tải chi tiết phiếu nhập xuất');
            }
        } catch (error) {
            console.error('💥 [InventoryEntryScreens] Error handling item press:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải chi tiết');
        }
    };
    // Progress management
    const hasExportSelected = useMemo(() => activeFilters.some(f => f.category === 'warehouse_export'), [activeFilters]);
    useEffect(() => {
        if (!hasExportSelected) {
            setDefaultFromWarehouse('');
            // Only update qtyAvailable, don't reset other user data
            setItems(prev => prev.map(it => ({ 
                ...it, 
                fromWarehouse: '', 
                qtyAvailable: '0' 
            })));
        }
    }, [hasExportSelected]);
    const exportWarehouseLabel = React.useMemo(() => {
        const labels = activeFilters
            .filter(f => f.category === 'warehouse_export')
            .map(f => f.label)
            .filter(Boolean);
        return labels.length > 0 ? labels.join(', ') : 'Kho xuất *';
    }, [activeFilters]);

    const importWarehouseLabel = React.useMemo(() => {
        const labels = activeFilters
            .filter(f => f.category === 'warehouse_import')
            .map(f => f.label)
            .filter(Boolean);
        return labels.length > 0 ? labels.join(', ') : 'Kho nhập *';
    }, [activeFilters]);

    // Show (1/0) status depending on selection
    const hasImportSelected = activeFilters.some(f => f.category === 'warehouse_import');
    const progressSteps: ProgressStep[] = [
        { id: 'export', label: exportWarehouseLabel, status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending' },
        { id: 'import', label: importWarehouseLabel, status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending' },
    ];

    const nextStep = useCallback(() => {
        if (currentStep < progressSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
            showToast(`Đã chuyển đến: ${progressSteps[currentStep + 1]?.label}`);
        }
    }, [currentStep, progressSteps, showToast]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            showToast(`Đã quay lại: ${progressSteps[currentStep - 1]?.label}`);
        }
    }, [currentStep, progressSteps, showToast]);

    // Items management
    const addNewRow = useCallback(() => {
        setItems(prev => [...prev, createEmptyRow()]);
    }, [createEmptyRow]);

    const removeItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
        });
    }, []);

    const toggleItemSelection = useCallback((index: number) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (isAllSelected) {
            setSelectedItems(new Set());
            setIsAllSelected(false);
        } else {
            const allIndices = new Set(items.map((_, index) => index));
            setSelectedItems(allIndices);
            setIsAllSelected(true);
        }
    }, [isAllSelected, items.length]);

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

    // Quick scan: open scanner; only append item after successful fetch
    const quickScanNewProduct = useCallback(() => {
        setCurrentScanningItemIndex(-1 as any);
            setIsScannerVisible(true);
    }, []);

    const handleBarcodeScan = useCallback(async (barcode: string) => {
        if (currentScanningItemIndex === null) return;

        const itemIndex = currentScanningItemIndex;
        setIsScannerVisible(false);
        setCurrentScanningItemIndex(null);

        try {
            const response = await getItemDetails(barcode);
            const itemDetails = response?.data;

            if (itemDetails) {
                // Fetch incoming rate (price) and stock quantity for the item
                let incomingRate = '0';
                let stockQty = '';
                try {
                    const { incomingRate: rate } = await fetchRateAndQty(
                        barcode,
                        (items[itemIndex]?.fromWarehouse || defaultFromWarehouse || '')
                    );
                    incomingRate = rate;
                } catch (rateError) {
                    incomingRate = itemDetails.last_purchase_rate ? itemDetails.last_purchase_rate.toString() : '0';
                }

                // Stock quantity: only fetch/show when export warehouse is selected; otherwise force 0
                const exportSelected = activeFilters.some(f => f.category === 'warehouse_export');
                if (exportSelected) {
                try {
                    const { stockQty: qty } = await fetchRateAndQty(
                        barcode,
                        (items[itemIndex]?.fromWarehouse || defaultFromWarehouse || '')
                    );
                    if (qty !== undefined) stockQty = qty;
                } catch { }
                } else {
                    stockQty = '0';
                }

                const newItem = {
                    fromWarehouse: defaultFromWarehouse,
                    toWarehouse: defaultToWarehouse,
                        code: itemDetails.item_code || barcode,
                        name: itemDetails.item_name || '',
                    qty: '',
                        unit: itemDetails.stock_uom || 'Cái',
                        price: incomingRate,
                        isStockItem: itemDetails.is_stock_item === 1,
                    isSelected: false,
                    qtyAvailable: stockQty || '0',
                } as InventoryItemRow;
                // Always show only one product per successful scan
                setItems([newItem]);
            } else {
                updateItem(itemIndex, 'code', barcode);
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

    // Helper functions
    const formatCurrency = useCallback((amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) return '0';
        return num.toLocaleString('vi-VN');
    }, []);

    const calculateTotal = useCallback(() => {
        return items.reduce((total, item, index) => {
            if (selectedItems.has(index)) {
                const price = parseFloat(item.price) || 0;
                const qty = parseFloat(item.qty) || 0;
                return total + (price * qty);
            }
            return total;
        }, 0);
    }, [items, selectedItems]);

    const calculateTotalItems = useCallback(() => {
        return Array.from(selectedItems).reduce((total, index) => {
            const qty = parseFloat(items[index]?.qty) || 0;
            return total + qty;
        }, 0);
    }, [items, selectedItems]);

    // Effects
    useEffect(() => {
        const loadTypes = async () => {
            try {
                const types = await getAllExportImportType();
                const options: FilterOption[] = Array.isArray(types)
                    ? types
                        .map((t: any) => (t?.label || t?.name || '').trim())
                        .filter((v: string) => !!v)
                        .map((v: string) => ({ value: v, label: v, category: 'stock_entry_type' }))
                    : [];
                setFilterOptions(prev => ({ ...prev, stock_entry_type: options }));
                setStockEntryTypes(options.map(o => o.label));
            } catch { }
            setEntryType(prev => prev || 'Chuyển kho');
        };
        const loadWarehouses = async () => {
            try {
                const whs = await getWarehouse();
                const whOptions: FilterOption[] = Array.isArray(whs)
                    ? whs
                        .map((w: any) => (w?.label || w?.name || '').trim())
                        .filter((v: string) => !!v)
                        .map((v: string) => ({ value: v, label: v, category: 'warehouse' }))
                    : [];
                // Reuse same options for all three warehouse categories
                setFilterOptions(prev => ({
                    ...prev,
                    warehouse_origin: whOptions.map(o => ({ ...o, category: 'warehouse_origin' })),
                    warehouse_export: whOptions.map(o => ({ ...o, category: 'warehouse_export' })),
                    warehouse_import: whOptions.map(o => ({ ...o, category: 'warehouse_import' })),
                }));
            } catch {}
        };
        loadTypes();
        loadWarehouses();
    }, []);

    // Default stock_entry_type to "Chuyển kho" once options are ready
    useEffect(() => {
        const hasType = activeFilters.some(f => f.category === 'stock_entry_type');
        if (!hasType) {
            setActiveFilters(prev => [
                ...prev,
                {
                    key: 'stock_entry_type-Chuyển kho',
                    label: 'Chuyển kho',
                    category: 'stock_entry_type',
                    value: 'Chuyển kho',
                }
            ]);
        }
    }, [filterOptions.stock_entry_type]);

    useEffect(() => {
        setPostDate(prev => prev || formatCurrentDateDisplay());
        setPostTime(prev => prev || formatCurrentTimeHMS());
    }, []);

    // When origin warehouse is selected via filters, default (and lock) import warehouse filter
    useEffect(() => {
        const hasOrigin = activeFilters.some(f => f.category === 'warehouse_origin');
        const hasFixedImport = activeFilters.some(f => f.category === 'warehouse_import' && f.value === 'Kho đi đường - COM');
        if (!hasOrigin) return;
        if (hasFixedImport) return;
        const next = [
            ...activeFilters.filter(f => f.category !== 'warehouse_import'),
            {
                key: 'warehouse_import-Kho đi đường - COM',
                label: 'Kho đi đường - COM',
                category: 'warehouse_import',
                value: 'Kho đi đường - COM',
            },
        ];
        // Shallow equality check to avoid unnecessary set and loops
        const same = next.length === activeFilters.length && next.every((n, i) => {
            const a = activeFilters[i];
            return a && a.key === n.key && a.value === n.value && a.category === n.category && a.label === n.label;
        });
        if (!same) setActiveFilters(next);
    }, [activeFilters]);

    // Sync selected warehouse filters to defaultFromWarehouse/defaultToWarehouse
    useEffect(() => {
        const exportWh = activeFilters.find(f => f.category === 'warehouse_export')?.value;
        const importWh = activeFilters.find(f => f.category === 'warehouse_import')?.value;
        if (exportWh && exportWh !== defaultFromWarehouse) {
            setDefaultFromWarehouse(String(exportWh));
        }
        if (importWh && importWh !== defaultToWarehouse) {
            setDefaultToWarehouse(String(importWh));
        }
    }, [activeFilters, defaultFromWarehouse, defaultToWarehouse]);

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
                        // do not prefill user qty; store available stock for clamping
                        setItems(cur => cur.map((it2, idx) => idx === i ? { ...it2, qtyAvailable: stockQty as string } : it2));
                    }
                } catch { }
            }
        };
        fetchPrices();
    }, [defaultFromWarehouse, defaultToWarehouse, fetchRateAndQty]);

    // Update isAllSelected when selectedItems changes
    useEffect(() => {
        setIsAllSelected(selectedItems.size === items.length && items.length > 0);
    }, [selectedItems, items.length]);

    // Render helpers
    const renderProgressBar = () => {
        const exportSelected = activeFilters.some(f => f.category === 'warehouse_export');
        const importSelected = activeFilters.some(f => f.category === 'warehouse_import');
        return (
            <View style={styles.progressBar}>
                <View style={styles.progressContainer}>
                    {progressSteps.map((step, index) => {
                        const isSelected = index === 0 ? exportSelected : importSelected;
                        return (
                            <View key={step.id} style={styles.progressStep}>
        <TouchableOpacity
                                    style={[
                                        styles.stepCircle,
                                        step.status === 'completed' && styles.stepCircleCompleted,
                                        isSelected && styles.stepCircleActive,
                                        !isSelected && styles.stepCirclePending,
                                    ]}
                                    onPress={() => {
                                        if (step.status === 'completed' || step.status === 'active') {
                                            setCurrentStep(index);
                                        }
                                    }}
            activeOpacity={0.7}
        >
                                    <Text style={styles.stepText}>
                                        {step.status === 'completed' ? '✓' : (index + 1).toString()}
                                    </Text>
        </TouchableOpacity>
                                <Text style={[
                                    styles.stepLabel,
                                    step.status === 'completed' && styles.stepLabelCompleted,
                                    isSelected && styles.stepLabelActive,
                                    !isSelected && styles.stepLabelPending,
                                ]}>
                                    {step.label}
                                </Text>
                                {index < progressSteps.length - 1 && (
                                    <View style={[
                                        styles.progressLine,
                                        step.status === 'completed' && styles.progressLineCompleted,
                                        isSelected && styles.progressLineActive,
                                    ]} />
                                )}
                            </View>
                        );
                    })}
                </View>
        </View>
    );
    };

    const renderCompanyDetails = () => (
        <View style={styles.companyDetails}>
            <View style={styles.companyInfo}>
                <Text style={styles.companyLine}>
                    {company} - {postDate} - {postTime}
                </Text>
                <Text style={styles.companyLine}>
                    {diffAccount}
                </Text>
            </View>
        </View>
    );

    const renderProductCard = (item: InventoryItemRow, index: number) => {
        const isSelected = selectedItems.has(index);
        
        return (
            <View key={`item-${index}-${item.code || 'empty'}`} style={styles.shopSection}>
                <View style={styles.productItem}>
                    <View style={styles.productMain}>
                      

                        <View style={styles.productInfo}>
                    <TextInput
                                value={item.code && item.name ? `${item.code} - ${item.name}` : (item.code || item.name || '')}
                                onChangeText={(text) => {
                                    // Split input back to code and name if user edits
                                    const [maybeCode, ...rest] = text.split(' - ');
                                    updateItem(index, 'code', maybeCode);
                                    updateItem(index, 'name', rest.join(' - '));    
                                }}
                                style={styles.productTitle}
                                placeholder="Mã - Tên sản phẩm *"
                        placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                                value={item.unit}
                                onChangeText={(text) => updateItem(index, 'unit', text)}
                                style={styles.productCode}
                                placeholder="Đơn vị tính (stock_uom)"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <TouchableOpacity
                            style={styles.removeBtn}
                    onPress={() => removeItem(index)}
                    activeOpacity={0.7}
                >
                            <Text style={styles.removeBtnText}>X</Text>
                </TouchableOpacity>
            </View>

                    <View style={styles.productPriceQuantity}>
                        <View style={styles.priceSection}>
                            <Text style={styles.currentPrice}>
                                Số lượng tồn kho: {hasExportSelected && item.qtyAvailable ? `${item.qtyAvailable}` : '0'}
                        </Text>
                </View>

                        <View style={styles.quantityInputControl}>
                        <TouchableOpacity
                                style={styles.quantityBtn}
                            onPress={() => {
                                const currentQty = parseFloat(item.qty) || 0;
                                let next = currentQty - 1;
                                if (next < 0) next = 0;
                                updateItem(index, 'qty', next.toString());
                            }}
                            activeOpacity={0.7}
                        >
                                <Text style={styles.quantityBtnText}>−</Text>
                        </TouchableOpacity>
                        
                        <TextInput
                            keyboardType="decimal-pad"
                            value={item.qty}
                                onChangeText={(text) => {
                                    // allow empty input directly
                                    if (text === '') { updateItem(index, 'qty', ''); return; }
                                    // normalize commas to dots, and allow only digits and single dot
                                    const replaced = text.replace(',', '.');
                                    const stripped = replaced.replace(/[^0-9.]/g, '');
                                    const parts = stripped.split('.');
                                    const singleDot = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : stripped;
                                    // allow intermediate states like "." or "12."
                                    if (singleDot === '.' || /^(\d+)\.$/.test(singleDot)) {
                                        updateItem(index, 'qty', singleDot);
                                        return;
                                    }
                                    // if it's a valid decimal number, optionally clamp to available stock
                                    if (/^\d*(?:\.\d+)?$/.test(singleDot)) {
                                        const valueNum = singleDot === '' ? NaN : parseFloat(singleDot);
                                        const stockAvail = item.qtyAvailable ? parseFloat(item.qtyAvailable) : undefined;
                                        if (!isNaN(valueNum) && typeof stockAvail === 'number' && !isNaN(stockAvail) && stockAvail >= 0) {
                                            if (valueNum > stockAvail) {
                                                updateItem(index, 'qty', stockAvail.toString());
                                                return;
                                            }
                                        }
                                        updateItem(index, 'qty', singleDot);
                                        return;
                                    }
                                    // fallback: keep previous value if input is invalid
                                }}
                                style={styles.quantityInput}
                            placeholder="Số lượng *"
                            placeholderTextColor="#9CA3AF"
                        />
                        
                        <TouchableOpacity
                                style={styles.quantityBtn}
                            onPress={() => {
                                    const currentQty = item.qty === '' ? 0 : (parseFloat(item.qty) || 0);
                                    const stockAvail = item.qtyAvailable ? parseFloat(item.qtyAvailable) : undefined;
                                    let next = currentQty + 1;
                                    if (typeof stockAvail === 'number' && !isNaN(stockAvail) && stockAvail >= 0) {
                                        next = Math.min(next, stockAvail);
                                    }
                                    updateItem(index, 'qty', next.toString());
                            }}
                            activeOpacity={0.7}
                        >
                                <Text style={styles.quantityBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            </View>
        );
    };

    const renderBottomSummary = () => (
        <View style={styles.footer}>
            <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={saveTransfer}
                activeOpacity={0.8}
            >
                <Text style={styles.checkoutBtnText}>
                    Lưu
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderProductList = () => (
        <View style={styles.mainContent}>
            {items.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Text style={styles.emptyIconText}>📦</Text>
                    </View>
                    <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
                    <Text style={styles.emptySubtitle}>Nhấn "Thêm dòng" để bắt đầu nhập sản phẩm</Text>
                </View>
            ) : (
                items.map((item, index) => renderProductCard(item, index))
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
                        <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thêm Xuất Nhập Kho</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                        style={[styles.filterBtn, { backgroundColor: '#111111' }]}
                        onPress={() => setIsFilterModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.filterBtnText, { color: 'white' }]}>🔍</Text>
                </TouchableOpacity>
                            </View>
                        </View>

            {/* Progress Bar */}
            {renderProgressBar()}

            {/* Active Filters */}
            {activeFilters.some(f => !['warehouse_export','warehouse_import'].includes(f.category)) && (
                <View style={styles.filtersBar}>
                    <View style={styles.filtersChipsRow}>
                        {activeFilters.filter(f => !['warehouse_export','warehouse_import'].includes(f.category)).map(f => (
                            <View key={f.key} style={styles.filterChip}>
                                <Text style={styles.filterChipText}>{f.label}</Text>
                            </View>
                        ))}
                        </View>
                    </View>
            )}

            {/* Main Content */}
            <ScrollView 
                contentContainerStyle={[styles.container, { paddingBottom: items.length > 0 ? 160 : 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Company Details */}
                {renderCompanyDetails()}

                {/* Description */}
                <View style={styles.shopSection}>
                    <View style={styles.productItem}>
                        <Input
                            placeholder="Nhập mô tả..."
                            autoGrow
                            minHeight={100}
                            maxHeight={260}
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor="#9CA3AF"
                            containerStyle={{ marginBottom: 0 }}
                            style={[styles.input, styles.textarea] as any}
                        />
                    </View>
                </View>

                {/* Product List */}
                        {renderProductList()}

            </ScrollView>

            {/* Floating Scan Button */}
            <TouchableOpacity style={styles.floatingScanButton} onPress={quickScanNewProduct} activeOpacity={0.85}>
                <Text style={styles.floatingScanText}>Quét</Text>
            </TouchableOpacity>

            {/* Bottom Summary Bar */}
            {items.length > 0 && renderBottomSummary()}

            {/* Toast */}
            <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
                <Text style={styles.toastText}>{toastMessage || 'Thao tác thành công!'}</Text>
            </Animated.View>

            {/* Filter Modal */}
            <InventoryFilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
                filterCategories={filterCategories}
                filterOptions={filterOptions}
            />

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