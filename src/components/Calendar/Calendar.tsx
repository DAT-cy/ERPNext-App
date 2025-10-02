import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface CalendarProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  minDate?: string; // Ngày tối thiểu có thể chọn
  maxDate?: string; // Ngày tối đa có thể chọn
}

const Calendar: React.FC<CalendarProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  minDate,
  maxDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Sample events - có thể mở rộng sau này
  const events: { [key: string]: string } = {
    '2024-12-25': 'Giáng sinh',
    '2024-12-31': 'Tết Dương lịch',
  };

  useEffect(() => {
    if (selectedDate && visible) {
      try {
        const date = new Date(selectedDate);
        if (!isNaN(date.getTime())) {
          setSelected(date);
          setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
        }
      } catch (error) {
        console.log('Invalid date format:', selectedDate);
      }
    }
  }, [selectedDate, visible]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return selected ? date.toDateString() === selected.toDateString() : false;
  };

  const hasEvent = (date: Date): boolean => {
    const dateString = formatDate(date);
    return !!events[dateString];
  };

  const isDateDisabled = (date: Date): boolean => {
    if (!minDate && !maxDate) return false;
    
    const dateString = formatDate(date);
    
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    
    return false;
  };

  const selectDate = (date: Date) => {
    // Không cho phép chọn ngày bị disabled
    if (isDateDisabled(date)) {
      return;
    }
    
    setSelected(date);
    const formattedDate = formatDate(date);
    onDateSelect(formattedDate);
    
    // Hiển thị thông báo ngắn
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    
    // Kiểm tra xem hôm nay có nằm trong khoảng được phép không
    if (isDateDisabled(today)) {
      // Nếu hôm nay không được phép chọn, chỉ navigate đến tháng hiện tại
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
      return;
    }
    
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(today);
    onDateSelect(formatDate(today));
  };

  const changeMonth = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setShowMonthPicker(false);
  };

  const changeYear = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      const disabled = isDateDisabled(date);
      
      days.push(
        <TouchableOpacity
          key={`prev-${day}`}
          style={[
            styles.day, 
            styles.otherMonth,
            disabled && styles.disabledDay
          ]}
          onPress={() => selectDate(date)}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Text style={[
            styles.dayText, 
            styles.otherMonthText,
            disabled && styles.disabledText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = isToday(date);
      const selectedDay = isSelected(date);
      const eventDay = hasEvent(date);
      const disabled = isDateDisabled(date);
      
      days.push(
        <TouchableOpacity
          key={`current-${day}`}
          style={[
            styles.day,
            today && !disabled && styles.today,
            selectedDay && !disabled && styles.selectedDay,
            eventDay && !disabled && styles.eventDay,
            disabled && styles.disabledDay,
          ]}
          onPress={() => selectDate(date)}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Text
            style={[
              styles.dayText,
              today && !disabled && styles.todayText,
              selectedDay && !disabled && styles.selectedText,
              eventDay && !disabled && styles.eventText,
              disabled && styles.disabledText,
            ]}
          >
            {day}
          </Text>
          {eventDay && !disabled && <View style={styles.eventDot} />}
        </TouchableOpacity>
      );
    }
    
    // Next month's leading days
    const totalCells = days.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells && totalCells + day - 1 < 42; day++) {
      const date = new Date(year, month + 1, day);
      const disabled = isDateDisabled(date);
      
      days.push(
        <TouchableOpacity
          key={`next-${day}`}
          style={[
            styles.day, 
            styles.otherMonth,
            disabled && styles.disabledDay
          ]}
          onPress={() => selectDate(date)}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Text style={[
            styles.dayText, 
            styles.otherMonthText,
            disabled && styles.disabledText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const renderMonthPicker = () => {
    if (!showMonthPicker) return null;
    
    return (
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity 
          style={styles.pickerOverlay} 
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <ScrollView style={styles.pickerScroll}>
              {monthNames.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pickerItem,
                    currentDate.getMonth() === index && styles.pickerItemSelected
                  ]}
                  onPress={() => changeMonth(index)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    currentDate.getMonth() === index && styles.pickerItemTextSelected
                  ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderYearPicker = () => {
    if (!showYearPicker) return null;
    
    const years = generateYears();
    
    return (
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity 
          style={styles.pickerOverlay} 
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <ScrollView style={styles.pickerScroll}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    currentDate.getFullYear() === year && styles.pickerItemSelected
                  ]}
                  onPress={() => changeYear(year)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    currentDate.getFullYear() === year && styles.pickerItemTextSelected
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.navButton} onPress={previousMonth}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            
            <View style={styles.monthYearContainer}>
              <TouchableOpacity 
                style={styles.monthYearButton}
                onPress={() => setShowMonthPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.monthText}>
                  {monthNames[currentDate.getMonth()]} ▼
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.monthYearButton}
                onPress={() => setShowYearPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.yearText}>
                  {currentDate.getFullYear()} ▼
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.navButton} onPress={nextMonth}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View style={styles.weekdaysContainer}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekday}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {renderDays()}
          </View>

          {/* Date Range Info */}
          {(minDate || maxDate) && (
            <View style={styles.dateRangeInfo}>
              <Text style={styles.dateRangeText}>
                🗓️ Chỉ có thể chọn từ {minDate || '...'} đến {maxDate || '...'}
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.todayButton,
                isDateDisabled(new Date()) && styles.todayButtonDisabled
              ]} 
              onPress={goToToday}
            >
              <Text style={[
                styles.todayButtonText,
                isDateDisabled(new Date()) && styles.todayButtonTextDisabled
              ]}>
                📅 {isDateDisabled(new Date()) ? 'Tháng này' : 'Hôm nay'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendToday]} />
              <Text style={styles.legendText}>Hôm nay</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendSelected]} />
              <Text style={styles.legendText}>Đã chọn</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendEvent]} />
              <Text style={styles.legendText}>Có sự kiện</Text>
            </View>
          </View>
        </View>
        
        {/* Month and Year Pickers */}
        {renderMonthPicker()}
        {renderYearPicker()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: Math.min(width - 40, 400),
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthYearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  yearText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 0,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  weekday: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  day: {
    width: (width - 120) / 7 - 5,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  otherMonth: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#cbd5e1',
  },
  today: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  todayText: {
    color: 'white',
    fontWeight: '700',
  },
  selectedDay: {
    backgroundColor: '#10b981',
  },
  selectedText: {
    color: 'white',
    fontWeight: '700',
  },
  eventDay: {
    backgroundColor: '#fef3c7',
  },
  eventText: {
    color: '#92400e',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
  disabledDay: {
    backgroundColor: '#f3f4f6',
    opacity: 0.5,
  },
  disabledText: {
    color: '#9ca3af',
  },
  dateRangeInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  dateRangeText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 10,
  },
  todayButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  todayButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  todayButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  todayButtonTextDisabled: {
    color: '#f3f4f6',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendToday: {
    backgroundColor: '#3b82f6',
  },
  legendSelected: {
    backgroundColor: '#10b981',
  },
  legendEvent: {
    backgroundColor: '#f59e0b',
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  // Picker styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: 300,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#3b82f6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: 'white',
    fontWeight: '700',
  },
});

export default Calendar;