// src/components/InventoryFilter/InventoryFilterModal.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Calendar from '../Calendar/Calendar';
import { colors } from '../../styles/globalStyles';
import { wp, hp, fs } from '../../utils/responsive';
import { inventoryFilterStyles } from '../InventoryFilter/InventoryFilterModal.styles';

interface FilterOption {
  value: string;
  label: string;
  category: string;
}

interface FilterCategory {
  key: string;
  title: string;
  icon?: string;
}

interface ActiveFilter {
  key: string;
  label: string;
  category: string;
  value: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  filterCategories: FilterCategory[];
  filterOptions: Record<string, FilterOption[]>;
}

export default function InventoryFilterModal({
  visible,
  onClose,
  activeFilters,
  onFiltersChange,
  filterCategories,
  filterOptions,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('stock_entry_type');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Set<string>>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<string, View | null>>({});
  const sectionLayouts = useRef<Record<string, { y: number; height: number }>>({});
  const isScrollingProgrammatically = useRef<boolean>(false);
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateMode, setDateMode] = useState<'single' | 'range' | null>(null);

  // Initialize selected options from active filters
  React.useEffect(() => {
    const newSelectedOptions: Record<string, Set<string>> = {};
    
    activeFilters.forEach(filter => {
      if (!newSelectedOptions[filter.category]) {
        newSelectedOptions[filter.category] = new Set();
      }
      newSelectedOptions[filter.category].add(filter.value);
    });
    
    setSelectedOptions(newSelectedOptions);
  }, [activeFilters]);

  // Handle filter option selection
  const handleOptionSelect = (option: FilterOption) => {
    const category = option.category;
    const value = option.value;
    
    if (!selectedOptions[category]) {
      selectedOptions[category] = new Set();
    }

    const newSelectedOptions = { ...selectedOptions };
    let newActiveFilters = [...activeFilters];

    if (newSelectedOptions[category].has(value)) {
      // Remove selection
      newSelectedOptions[category].delete(value);
      newActiveFilters = newActiveFilters.filter(f => 
        !(f.category === category && f.value === value)
      );
    } else {
      // Add selection
      newSelectedOptions[category].add(value);
      newActiveFilters.push({
        key: `${category}-${value}`,
        label: option.label,
        category: category,
        value: value
      });
    }

    setSelectedOptions(newSelectedOptions);
    onFiltersChange(newActiveFilters);
  };

  // Reset all filters
  const handleReset = () => {
    setSelectedOptions({});
    onFiltersChange([]);
    setStartDate(null);
    setEndDate(null);
    setDateMode(null);
    
    // Reset expanded sections
    setExpandedSections({});
  };

  // Date picker handlers
  const handleStartDateSelect = (dateString: string) => {
    setShowStartDatePicker(false);
    const selectedDate = new Date(dateString);
    setStartDate(selectedDate);
    
    if (dateMode === 'single') {
      // Single date mode - set both start and end to same date
      setEndDate(selectedDate);
      updateDateFilters(selectedDate, selectedDate);
    } else if (dateMode === 'range') {
      // Range mode - only update start date
      updateDateFilters(selectedDate, endDate);
    }
    // Nếu dateMode là null, không làm gì cả
  };

  const handleEndDateSelect = (dateString: string) => {
    setShowEndDatePicker(false);
    const selectedDate = new Date(dateString);
    setEndDate(selectedDate);
    
    if (dateMode === 'range') {
      updateDateFilters(startDate, selectedDate);
    }
    // Nếu dateMode là null hoặc 'single', không làm gì cả
  };

  const updateDateFilters = (start?: Date | null, end?: Date | null) => {
    // Remove existing date filters
    const newActiveFilters = activeFilters.filter(f => 
      !f.key.startsWith('creation-')
    );

    if (start && end) {
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      if (startStr === endStr) {
        // Same day - from start of day to end of day
        const startOfDay = new Date(start);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(start);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Format: [["creation", ">=", "2025-10-10 00:00:00"], ["creation", "<=", "2025-10-10 23:59:59"]]
        const frappeFilters = [
          ["creation", ">=", `${startStr} 00:00:00`],
          ["creation", "<=", `${startStr} 23:59:59`]
        ];
        
        newActiveFilters.push({
          key: 'creation-single',
          label: `Ngày ${startStr}`,
          category: 'creation',
          value: JSON.stringify(frappeFilters)
        });
      } else {
        // Date range - from start of first day to end of last day
        const startOfFirstDay = new Date(start);
        startOfFirstDay.setHours(0, 0, 0, 0);
        const endOfLastDay = new Date(end);
        endOfLastDay.setHours(23, 59, 59, 999);
        
        // Format: [["creation", ">=", "2025-10-10 00:00:00"], ["creation", "<=", "2025-10-15 23:59:59"]]
        const frappeFilters = [
          ["creation", ">=", `${startStr} 00:00:00`],
          ["creation", "<=", `${endStr} 23:59:59`]
        ];
        
        newActiveFilters.push({
          key: 'creation-range',
          label: `Từ ${startStr} đến ${endStr}`,
          category: 'creation',
          value: JSON.stringify(frappeFilters)
        });
      }
    }

    onFiltersChange(newActiveFilters);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Chọn ngày';
    return date.toLocaleDateString('vi-VN');
  };

  // Toggle date filter - xóa hoặc thêm lại filter
  const toggleDateFilter = () => {
    const hasDateFilter = activeFilters.some(f => f.key.startsWith('creation-'));
    
    if (hasDateFilter) {
      // Xóa filter hiện tại và reset dates
      const newActiveFilters = activeFilters.filter(f => !f.key.startsWith('creation-'));
      onFiltersChange(newActiveFilters);
      setStartDate(null);
      setEndDate(null);
    } else {
      // Thêm lại filter với ngày đã chọn (chỉ khi đã chọn mode)
      if (startDate && endDate && dateMode) {
        updateDateFilters(startDate, endDate);
      }
    }
  };

  // Handle mode change - xóa filter cũ khi chuyển mode hoặc toggle mode
  const handleModeChange = (newMode: 'single' | 'range') => {
    // Xóa filter hiện tại khi chuyển mode
    const newActiveFilters = activeFilters.filter(f => !f.key.startsWith('creation-'));
    onFiltersChange(newActiveFilters);
    
    // Reset dates khi chuyển mode
    setStartDate(null);
    setEndDate(null);
    
    // Toggle mode - nếu ấn vào mode đang được chọn thì tắt nó
    if (dateMode === newMode) {
      setDateMode(null);
    } else {
      setDateMode(newMode);
    }
  };

  // Toggle section expansion
  const toggleSection = (category: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle scroll to detect current visible section
  const handleScroll = useCallback((event: any) => {
    if (isScrollingProgrammatically.current) {
      return;
    }

    const scrollY = event.nativeEvent.contentOffset.y;
    let currentCategory = filterCategories[0]?.key;

    // Find the section that is currently most visible
    for (const category of filterCategories) {
      const layout = sectionLayouts.current[category.key];
      if (layout && scrollY >= layout.y - 50) { // 50px threshold
        currentCategory = category.key;
      }
    }

    if (currentCategory !== selectedCategory) {
      setSelectedCategory(currentCategory);
    }
  }, [filterCategories, selectedCategory]);

  // Switch to category and scroll to it
  const switchToCategory = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    isScrollingProgrammatically.current = true;
    
    // Use the actual measured layout if available
    const layout = sectionLayouts.current[categoryKey];
    if (layout && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: layout.y,
        animated: true
      });
    } else {
      // Fallback to approximate calculation
      const sectionIndex = filterCategories.findIndex(cat => cat.key === categoryKey);
      if (sectionIndex >= 0) {
        scrollViewRef.current?.scrollTo({
          y: sectionIndex * hp(15),
          animated: true
        });
      }
    }

    // Reset flag after scroll animation
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 500);
  };

  // Handle section layout measurement
  const handleSectionLayout = (categoryKey: string, event: any) => {
    const { y, height } = event.nativeEvent.layout;
    sectionLayouts.current[categoryKey] = { y, height };
  };

  // Render filter option with show more functionality
  const renderCategorySection = (category: FilterCategory) => {
    const rawOptions = filterOptions[category.key];
    
    // Ensure options is always an array
    const options = Array.isArray(rawOptions) ? rawOptions : [];
    
    if (options.length === 0) {
      console.warn(`[InventoryFilterModal] No options found for category: ${category.key}`);
      return (
        <View key={category.key} style={inventoryFilterStyles.categorySection}>
          <Text style={inventoryFilterStyles.sectionTitle}>{category.title}</Text>
          <Text style={inventoryFilterStyles.filterOptionText}>Không có tùy chọn</Text>
        </View>
      );
    }
    
    const isExpanded = expandedSections[category.key] || false;
    const visibleOptions = isExpanded ? options : options.slice(0, 4);
    const hasMoreOptions = options.length > 4;

    return (
      <View 
        key={category.key} 
        style={inventoryFilterStyles.categorySection}
        ref={(ref) => { sectionRefs.current[category.key] = ref; }}
        onLayout={(event) => handleSectionLayout(category.key, event)}
      >
        <Text style={inventoryFilterStyles.sectionTitle}>
          {category.title}
        </Text>
        
        <View style={inventoryFilterStyles.optionsGrid}>
          {/* Special handling for creation date filter */}
          {category.key === 'creation' ? (
            <View style={inventoryFilterStyles.dateFilterContainer}>
              {/* Mode selection */}
              <View style={inventoryFilterStyles.modeSelectionContainer}>
                <TouchableOpacity
                  style={[
                    inventoryFilterStyles.modeButton,
                    dateMode === 'single' && inventoryFilterStyles.modeButtonSelected
                  ]}
                  onPress={() => handleModeChange('single')}
                >
                  <Text style={[
                    inventoryFilterStyles.modeButtonText,
                    dateMode === 'single' && inventoryFilterStyles.modeButtonTextSelected
                  ]}>
                    Một ngày
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    inventoryFilterStyles.modeButton,
                    dateMode === 'range' && inventoryFilterStyles.modeButtonSelected
                  ]}
                  onPress={() => handleModeChange('range')}
                >
                  <Text style={[
                    inventoryFilterStyles.modeButtonText,
                    dateMode === 'range' && inventoryFilterStyles.modeButtonTextSelected
                  ]}>
                    Nhiều ngày
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date picker - chỉ hiển thị khi đã chọn mode */}
              {dateMode && (
                <View style={inventoryFilterStyles.dateRangeContainer}>
                  <TouchableOpacity
                    style={[
                      inventoryFilterStyles.dateButton,
                      activeFilters.some(f => f.key.startsWith('creation-')) && inventoryFilterStyles.dateButtonSelected
                    ]}
                    onPress={() => {
                      const hasDateFilter = activeFilters.some(f => f.key.startsWith('creation-'));
                      if (hasDateFilter) {
                        toggleDateFilter();
                      } else {
                        setShowStartDatePicker(true);
                      }
                    }}
                  >
                    <Text style={[
                      inventoryFilterStyles.dateButtonText,
                      activeFilters.some(f => f.key.startsWith('creation-')) && inventoryFilterStyles.dateButtonTextSelected
                    ]}>
                      {formatDate(startDate)}
                    </Text>
                    <Feather 
                      name="calendar" 
                      size={wp(4)} 
                      color={activeFilters.some(f => f.key.startsWith('creation-')) ? colors.warning : colors.gray600} 
                    />
                  </TouchableOpacity>

                  {dateMode === 'range' && (
                    <>
                      <Text style={inventoryFilterStyles.dateSeparator}>đến</Text>
                      
                      <TouchableOpacity
                        style={[
                          inventoryFilterStyles.dateButton,
                          activeFilters.some(f => f.key.startsWith('creation-')) && inventoryFilterStyles.dateButtonSelected
                        ]}
                        onPress={() => {
                          const hasDateFilter = activeFilters.some(f => f.key.startsWith('creation-'));
                          if (hasDateFilter) {
                            toggleDateFilter();
                          } else {
                            setShowEndDatePicker(true);
                          }
                        }}
                      >
                        <Text style={[
                          inventoryFilterStyles.dateButtonText,
                          activeFilters.some(f => f.key.startsWith('creation-')) && inventoryFilterStyles.dateButtonTextSelected
                        ]}>
                          {formatDate(endDate)}
                        </Text>
                        <Feather 
                          name="calendar" 
                          size={wp(4)} 
                          color={activeFilters.some(f => f.key.startsWith('creation-')) ? colors.warning : colors.gray600} 
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>
          ) : (
            visibleOptions.map((option, index) => {
              const isSelected = selectedOptions[option.category]?.has(option.value) || false;
              
              return (
                <TouchableOpacity
                  key={`${option.category}-${option.value}`}
                  style={[
                    inventoryFilterStyles.filterOption,
                    isSelected && inventoryFilterStyles.filterOptionSelected
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text style={[
                    inventoryFilterStyles.filterOptionText,
                    isSelected && inventoryFilterStyles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
          
          {hasMoreOptions && (
            <TouchableOpacity
              style={inventoryFilterStyles.showMoreButton}
              onPress={() => toggleSection(category.key)}
            >
              <Text style={inventoryFilterStyles.showMoreText}>
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={inventoryFilterStyles.modalOverlay}>
        <View style={inventoryFilterStyles.modalContainer}>
          {/* Modal Header */}
          <View style={inventoryFilterStyles.modalHeader}>
            <Text style={inventoryFilterStyles.modalTitle}>Bộ Lọc</Text>
            <TouchableOpacity
              style={inventoryFilterStyles.closeButton}
              onPress={onClose}
            >
              <Feather name="x" size={wp(6)} color={colors.gray600} />
            </TouchableOpacity>
          </View>

          <View style={inventoryFilterStyles.modalContent}>
            {/* Left Categories */}
            <View style={inventoryFilterStyles.categoriesContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {filterCategories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      inventoryFilterStyles.categoryButton,
                      selectedCategory === category.key && inventoryFilterStyles.categoryButtonActive
                    ]}
                    onPress={() => switchToCategory(category.key)}
                  >
                    <Text style={[
                      inventoryFilterStyles.categoryButtonText,
                      selectedCategory === category.key && inventoryFilterStyles.categoryButtonTextActive
                    ]}>
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Right All Categories Data */}
            <View style={inventoryFilterStyles.allCategoriesContainer}>
              <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                style={inventoryFilterStyles.allCategoriesScroll}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                <View style={inventoryFilterStyles.allCategoriesContent}>
                  {filterCategories.map(category => renderCategorySection(category))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={inventoryFilterStyles.modalFooter}>
            <TouchableOpacity
              style={inventoryFilterStyles.resetButton}
              onPress={handleReset}
            >
              <Text style={inventoryFilterStyles.resetButtonText}>
                Thiết lập lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={inventoryFilterStyles.applyButton}
              onPress={onClose}
            >
              <Text style={inventoryFilterStyles.applyButtonText}>
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Date Pickers */}
      <Calendar
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onDateSelect={handleStartDateSelect}
        selectedDate={startDate?.toISOString().split('T')[0]}
      />
      
      <Calendar
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onDateSelect={handleEndDateSelect}
        selectedDate={endDate?.toISOString().split('T')[0]}
      />
    </Modal>
  );
}