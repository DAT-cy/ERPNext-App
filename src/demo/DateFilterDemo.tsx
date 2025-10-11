// Demo để test Date Filter với 2 chế độ: Một ngày và Nhiều ngày

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import InventoryFilterModal from '../components/InventoryFilter/InventoryFilterModal';

interface ActiveFilter {
  key: string;
  label: string;
  category: string;
  value: string;
}

const DateFilterDemo = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Filter categories với creation date
  const filterCategories = [
    { key: 'stock_entry_type', title: 'Loại Stock Entry' },
    { key: 'workflow_state', title: 'Trạng thái Workflow' },
    { key: 'creation', title: 'Ngày Ghi Sổ' }, // Category đặc biệt cho date picker
    { key: 'purpose', title: 'Mục đích' },
  ];

  // Filter options (không cần cho creation vì sẽ dùng date picker)
  const filterOptions = {
    stock_entry_type: [
      { value: 'Material Transfer', label: 'Material Transfer', category: 'stock_entry_type' },
      { value: 'Material Receipt', label: 'Material Receipt', category: 'stock_entry_type' },
      { value: 'Material Issue', label: 'Material Issue', category: 'stock_entry_type' },
    ],
    workflow_state: [
      { value: 'Draft', label: 'Draft', category: 'workflow_state' },
      { value: 'Submitted', label: 'Submitted', category: 'workflow_state' },
      { value: 'Approved', label: 'Approved', category: 'workflow_state' },
    ],
    purpose: [
      { value: 'Material Transfer', label: 'Material Transfer', category: 'purpose' },
      { value: 'Material Receipt', label: 'Material Receipt', category: 'purpose' },
    ],
    // creation sẽ được xử lý đặc biệt trong component
  };

  const handleFiltersChange = (filters: ActiveFilter[]) => {
    console.log('=== FILTERS CHANGED ===');
    console.log('New filters:', filters);
    setActiveFilters(filters);
    
    // Hiển thị thông báo ngắn gọn
    const creationFilters = filters.filter(f => f.category === 'creation');
    if (creationFilters.length > 0) {
      const creationFilter = creationFilters[0];
      console.log('Date filter:', creationFilter.label);
    } else {
      console.log('Date filter removed');
    }
  };

  const processFilters = (filters: ActiveFilter[]) => {
    const result: any = {};
    
    filters.forEach(filter => {
      switch (filter.category) {
        case 'stock_entry_type':
          result.stock_entry_type = filter.value;
          break;
        case 'workflow_state':
          result.workflow_state = filter.value;
          break;
        case 'purpose':
          result.purpose = filter.value;
          break;
        case 'creation':
          if (filter.key === 'creation-single') {
            // Single date - từ đầu ngày đến cuối ngày
            const dateRange = JSON.parse(filter.value);
            result.creation = dateRange;
          } else if (filter.key === 'creation-range') {
            // Date range - từ ngày này đến ngày kia
            const dateRange = JSON.parse(filter.value);
            result.creation = dateRange;
          }
          break;
      }
    });
    
    return result;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date Filter Demo</Text>
      <Text style={styles.subtitle}>Test chế độ "Một ngày" và "Nhiều ngày"</Text>
      <Text style={styles.instruction}>
        • Khi vào filter, chưa có mode nào được chọn sẵn{'\n'}
        • Chọn "Một ngày" hoặc "Nhiều ngày" trước{'\n'}
        • Ấn lại vào mode đang chọn để tắt mode (mất màu){'\n'}
        • Sau đó mới hiển thị ô chọn ngày{'\n'}
        • Ấn vào ô ngày để chọn ngày{'\n'}
        • Ấn lại vào ô ngày để xóa filter{'\n'}
        • Chuyển mode sẽ xóa filter cũ và reset
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowFilterModal(true)}
      >
        <Text style={styles.buttonText}>
          Mở Filter ({activeFilters.length})
        </Text>
      </TouchableOpacity>

      {/* Hiển thị filters đã chọn */}
      <View style={styles.filtersDisplay}>
        <Text style={styles.filtersTitle}>Filters đã chọn:</Text>
        {activeFilters.length > 0 ? (
          activeFilters.map((filter, index) => (
            <View key={index} style={styles.filterItem}>
              <Text style={styles.filterText}>
                {filter.category}: {filter.label}
              </Text>
              {filter.category === 'creation' && (
                <Text style={styles.filterDetails}>
                  {filter.value}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noFiltersText}>Chưa chọn filter nào</Text>
        )}
      </View>

      {/* Hiển thị processed filters */}
      {activeFilters.length > 0 && (
        <View style={styles.processedDisplay}>
          <Text style={styles.processedTitle}>Processed Filters (cho API):</Text>
          <Text style={styles.processedText}>
            {JSON.stringify(processFilters(activeFilters), null, 2)}
          </Text>
        </View>
      )}

      {/* Filter Modal */}
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
    marginBottom: 10,
    color: '#666',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 30,
    color: '#888',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersDisplay: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  filterItem: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  noFiltersText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  processedDisplay: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  processedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  processedText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
});

export default DateFilterDemo;
