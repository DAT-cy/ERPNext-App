// Demo để test date filter functionality
// src/demo/DateFilterIntegrationDemo.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { InventoryFilterModal } from '../components/InventoryFilter';
import { getAllInventory } from '../services/inventoryService';

interface ActiveFilter {
    key: string;
    label: string;
    category: string;
    value: string;
}

const DateFilterIntegrationDemo: React.FC = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [testResults, setTestResults] = useState<string>('');

    const filterCategories = [
        { key: 'creation', title: 'Ngày Ghi Sổ', icon: '📅' },
        { key: 'stock_entry_type', title: 'Loại Nhập Xuất', icon: '📦' },
    ];

    const filterOptions = {
        creation: [
            { value: 'Một Ngày', label: 'Một Ngày', category: 'creation' },
            { value: 'Nhiều Ngày', label: 'Nhiều Ngày', category: 'creation' },
        ],
        stock_entry_type: [
            { value: 'Material Receipt', label: 'Nhập kho', category: 'stock_entry_type' },
            { value: 'Material Issue', label: 'Xuất kho', category: 'stock_entry_type' },
            { value: 'Material Transfer', label: 'Chuyển kho', category: 'stock_entry_type' },
        ],
    };

    const handleFiltersChange = (filters: ActiveFilter[]) => {
        setActiveFilters(filters);
        
        // Log filter changes
        console.log('🔍 [DateFilterIntegrationDemo] Filters changed:', filters);
        
        if (filters.length > 0) {
            const filterInfo = filters.map(f => {
                if (f.category === 'creation') {
                    try {
                        const parsed = JSON.parse(f.value);
                        return `${f.label}: ${JSON.stringify(parsed)}`;
                    } catch {
                        return `${f.label}: ${f.value}`;
                    }
                }
                return `${f.label}: ${f.value}`;
            }).join('\n');
            
            setTestResults(`Active Filters:\n${filterInfo}`);
        } else {
            setTestResults('No active filters');
        }
    };

    const testApiCall = async () => {
        if (activeFilters.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn filter trước khi test API call');
            return;
        }

        try {
            // Process filters giống như trong InventoryEntryScreens
            const filters = activeFilters.reduce((acc, filter) => {
                if (filter.category === 'creation') {
                    acc[filter.category] = filter.value;
                } else {
                    acc[filter.category] = filter.value;
                }
                return acc;
            }, {} as Record<string, string>);

            console.log('🚀 [DateFilterIntegrationDemo] Making API call with filters:', filters);

            const response = await getAllInventory({ 
                filters, 
                limit: 5, 
                offset: 0 
            });

            if (response.success && response.data) {
                const resultText = `API Call Success!\n\nFilters sent:\n${JSON.stringify(filters, null, 2)}\n\nData received: ${response.data.length} items\n\nFirst item:\n${JSON.stringify(response.data[0], null, 2)}`;
                setTestResults(resultText);
                Alert.alert('API Call Success', `Received ${response.data.length} items`);
            } else {
                const errorText = `API Call Failed!\n\nError: ${response.error?.message || 'Unknown error'}`;
                setTestResults(errorText);
                Alert.alert('API Call Failed', response.error?.message || 'Unknown error');
            }
        } catch (error) {
            const errorText = `API Call Error!\n\nError: ${error}`;
            setTestResults(errorText);
            Alert.alert('API Call Error', String(error));
        }
    };

    const clearFilters = () => {
        setActiveFilters([]);
        setTestResults('Filters cleared');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Date Filter Integration Demo</Text>
            <Text style={styles.subtitle}>Test date filter với API integration</Text>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Text style={styles.buttonText}>📅 Mở Filter Modal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.testButton]}
                    onPress={testApiCall}
                >
                    <Text style={styles.buttonText}>🚀 Test API Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={clearFilters}
                >
                    <Text style={styles.buttonText}>🗑️ Clear Filters</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Test Results:</Text>
                <Text style={styles.resultsText}>{testResults}</Text>
            </View>

            <InventoryFilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                activeFilters={activeFilters}
                onFiltersChange={handleFiltersChange}
                filterCategories={filterCategories}
                filterOptions={filterOptions}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    buttonContainer: {
        gap: 15,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    testButton: {
        backgroundColor: '#34C759',
    },
    clearButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});

export default DateFilterIntegrationDemo;
