import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
// Removed gradient import for basic styling
import { CheckinRecord } from '../types/checkin.types';
import { fs, ss } from '../utils/responsive';

interface AttendanceStatisticsProps {
  records: CheckinRecord[];
}

interface DayStatus {
  date: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  hasCheckin: boolean;
  hasCheckout: boolean;
  isFullyApproved: boolean; // Cả IN và OUT đều đã duyệt
  isPartiallyApproved: boolean; // Chỉ có IN hoặc OUT đã duyệt
  isCheckinDraft: boolean; // IN của cặp mới nhất ở trạng thái nháp
  isCheckoutDraft: boolean; // OUT của cặp mới nhất ở trạng thái nháp
  checkinTime?: string;
  checkoutTime?: string;
}

const AttendanceStatistics: React.FC<AttendanceStatisticsProps> = ({ records }) => {
  const monthYearText = useMemo(() => {
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return vietnamTime.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }, []);

  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  // Tính toán thống kê cho tháng
  const statistics = useMemo(() => {
    if (!records || records.length === 0) {
      return null;
    }

    // Nhóm records theo ngày
    const groupedByDate: { [key: string]: CheckinRecord[] } = {};
    records.forEach(record => {
      const dateKey = record.time.split(' ')[0]; // YYYY-MM-DD
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(record);
    });

    const dates = Object.keys(groupedByDate);
    let checkedInDays = 0;
    let totalMinutes = 0;

    dates.forEach(dateKey => {
      const dayRecords = groupedByDate[dateKey].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );

      // Tạo cặp IN/OUT
      const pairs: Array<{ inRecord?: CheckinRecord; outRecord?: CheckinRecord }> = [];
      let currentPair: { inRecord?: CheckinRecord; outRecord?: CheckinRecord } = {};

      dayRecords.forEach(record => {
        if (record.log_type === 'IN') {
          if (currentPair.inRecord && !currentPair.outRecord) {
            pairs.push(currentPair);
            currentPair = { inRecord: record };
          } else {
            currentPair.inRecord = record;
          }
        } else if (record.log_type === 'OUT') {
          currentPair.outRecord = record;
          pairs.push(currentPair);
          currentPair = {};
        }
      });

      if (currentPair.inRecord || currentPair.outRecord) {
        pairs.push(currentPair);
      }

      // Đếm các ngày có chấm công
      if (pairs.length > 0) {
        checkedInDays++;
      }

      // Tính tổng số giờ làm việc
      pairs.forEach(pair => {
        if (pair.inRecord && pair.outRecord) {
          const inDateTime = new Date(pair.inRecord.time);
          const outDateTime = new Date(pair.outRecord.time);
          const diff = outDateTime.getTime() - inDateTime.getTime();
          totalMinutes += diff / (1000 * 60);
        }
      });
    });

    const totalHours = totalMinutes / 60;
    const averageHoursPerDay = checkedInDays > 0 ? totalHours / checkedInDays : 0;

    return {
      checkedInDays,
      totalHours,
      averageHoursPerDay,
    };
  }, [records]);

  // Tính toán trạng thái các ngày trong tháng theo múi giờ Việt Nam
  const dayStatuses = useMemo(() => {
    // Lấy thời gian hiện tại theo múi giờ Việt Nam (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
    
    const year = vietnamTime.getUTCFullYear();
    const month = vietnamTime.getUTCMonth();
    
    // Lấy ngày hôm nay theo múi giờ Việt Nam
    const todayVietnam = new Date(vietnamTime.getTime());
    todayVietnam.setUTCHours(0, 0, 0, 0);
    const today = todayVietnam.toISOString().split('T')[0];
    
    // Số ngày trong tháng hiện tại
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    // Nhóm records theo ngày
    const groupedByDate: { [key: string]: CheckinRecord[] } = {};
    records.forEach(record => {
      const recordDate = new Date(record.time);
      const recordVietnamTime = new Date(recordDate.getTime() + (7 * 60 * 60 * 1000));
      if (recordVietnamTime.getUTCMonth() === month && recordVietnamTime.getUTCFullYear() === year) {
        const dateKey = record.time.split(' ')[0];
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(record);
      }
    });
    
    const dayStatuses: DayStatus[] = [];
    
    // Tạo tất cả các ngày trong tháng theo múi giờ Việt Nam
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dateKey = date.toISOString().split('T')[0];
      const isToday = dateKey === today;
      const isPast = dateKey < today;
      const isFuture = dateKey > today;
      
      let hasCheckin = false;
      let hasCheckout = false;
      let isFullyApproved = false;
      let isPartiallyApproved = false;
      let checkinTime = '';
      let checkoutTime = '';
      let isCheckinDraft = false;
      let isCheckoutDraft = false;
      
      const dayRecords = groupedByDate[dateKey];
      
      if (dayRecords && dayRecords.length > 0) {
        // Sắp xếp records theo thời gian
        const sortedRecords = dayRecords.sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );
        
        // Tạo cặp IN/OUT
        const pairs: Array<{ inRecord?: CheckinRecord; outRecord?: CheckinRecord }> = [];
        let currentPair: { inRecord?: CheckinRecord; outRecord?: CheckinRecord } = {};
        
        sortedRecords.forEach(record => {
          if (record.log_type === 'IN') {
            if (currentPair.inRecord && !currentPair.outRecord) {
              pairs.push(currentPair);
              currentPair = { inRecord: record };
            } else {
              currentPair.inRecord = record;
            }
          } else if (record.log_type === 'OUT') {
            currentPair.outRecord = record;
            pairs.push(currentPair);
            currentPair = {};
          }
        });
        
        if (currentPair.inRecord || currentPair.outRecord) {
          pairs.push(currentPair);
        }
        
        // Lấy cặp mới nhất
        const latestPair = pairs[pairs.length - 1];
        
        if (latestPair) {
          hasCheckin = !!latestPair.inRecord;
          hasCheckout = !!latestPair.outRecord;
          
          if (latestPair.inRecord) {
            checkinTime = formatTime(latestPair.inRecord.time);
          }
          
          if (latestPair.outRecord) {
            checkoutTime = formatTime(latestPair.outRecord.time);
          }
          
          // Kiểm tra trạng thái duyệt
          isFullyApproved = hasCheckin && hasCheckout;
          isPartiallyApproved = (hasCheckin && !hasCheckout) || (!hasCheckin && hasCheckout);

          // Kiểm tra trạng thái nháp theo cặp mới nhất
          isCheckinDraft = !!latestPair.inRecord && (latestPair.inRecord as any).custom_status === 'Draft';
          isCheckoutDraft = !!latestPair.outRecord && (latestPair.outRecord as any).custom_status === 'Draft';
        }
      }
      
      dayStatuses.push({
        date: dateKey,
        dayNumber: day,
        isToday,
        isPast,
        isFuture,
        hasCheckin,
        hasCheckout,
        isFullyApproved,
        isPartiallyApproved,
        isCheckinDraft,
        isCheckoutDraft,
        checkinTime,
        checkoutTime
      });
    }
    
    return dayStatuses;
  }, [records]);

  // Tạo lịch tháng với các ngày được sắp xếp đúng vị trí theo múi giờ Việt Nam
  const getCalendarDays = () => {
    // Lấy thời gian hiện tại theo múi giờ Việt Nam (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
    
    const year = vietnamTime.getUTCFullYear();
    const month = vietnamTime.getUTCMonth();
    
    // Ngày đầu tiên của tháng theo múi giờ Việt Nam
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    
    // Ngày trong tuần của ngày đầu tiên (0 = CN, 1 = T2, ...)
    const firstDayOfWeek = firstDay.getUTCDay();
    
    // Số ngày trong tháng
    const daysInMonth = lastDay.getUTCDate();
    
    const calendarDays = [];
    
    // Thêm các ngày trống ở đầu tháng
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Thêm các ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dateKey = date.toISOString().split('T')[0];
      
      // Lấy ngày hôm nay theo múi giờ Việt Nam
      const todayVietnam = new Date(vietnamTime.getTime());
      todayVietnam.setUTCHours(0, 0, 0, 0);
      const todayKey = todayVietnam.toISOString().split('T')[0];
      
      const isToday = dateKey === todayKey;
      const isPast = dateKey < todayKey;
      const isFuture = dateKey > todayKey;
      
      // Tìm dữ liệu chấm công cho ngày này
      const dayData = dayStatuses.find(d => d.date === dateKey);
      
      if (dayData) {
        calendarDays.push(dayData);
      } else {
        // Tạo dữ liệu mặc định cho ngày không có chấm công
        calendarDays.push({
          date: dateKey,
          dayNumber: day,
          isToday,
          isPast,
          isFuture,
          hasCheckin: false,
          hasCheckout: false,
          isFullyApproved: false,
          isPartiallyApproved: false,
          isCheckinDraft: false,
          isCheckoutDraft: false,
          checkinTime: '',
          checkoutTime: ''
        });
      }
    }
    
    return calendarDays;
  };

  if (!statistics) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Chưa có dữ liệu để thống kê</Text>
      </View>
    );
  }

  const displayTotalHours = useMemo(() => {
    const hours = statistics.totalHours;
    if (hours >= 100) return Math.round(hours).toString();
    return hours.toFixed(1).replace(/\.0$/, '');
  }, [statistics.totalHours]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê chấm công tháng</Text>
      </View>

      {/* Tổng quan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng quan</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCardBasic, styles.cardBlue]}>
            <View style={[styles.accentBar, styles.accentBlue]} />
            <Text style={styles.statValue}>{dayStatuses.length}</Text>
            <Text style={styles.statLabel}>Tổng ngày</Text>
          </View>
          <View style={[styles.statCardBasic, styles.cardGreen]}>
            <View style={[styles.accentBar, styles.accentGreen]} />
            <Text style={styles.statValue}>{statistics.checkedInDays}</Text>
            <Text style={styles.statLabel}>Ngày có chấm công</Text>
          </View>
          <View style={[styles.statCardBasic, styles.cardOrange]}>
            <View style={[styles.accentBar, styles.accentOrange]} />
            <Text style={styles.statValue}>{displayTotalHours}h</Text>
            <Text style={styles.statLabel}>Tổng giờ</Text>
          </View>
          <View style={[styles.statCardBasic, styles.cardPurple]}>
            <View style={[styles.accentBar, styles.accentPurple]} />
            <Text style={styles.statValue}>{statistics.averageHoursPerDay.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>TB giờ/ngày</Text>
          </View>
        </View>
      </View>

      {/* Lịch chấm công */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch chấm công tháng</Text>
        
        {/* Header lịch với tên tháng */}
        <View style={styles.calendarHeader}>
          <Text style={styles.monthYearText}>{monthYearText}</Text>
        </View>
        
        {/* Header các ngày trong tuần */}
        <View style={styles.weekdayHeader}>
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
            <Text key={index} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>
        
        {/* Lưới lịch */}
        <View style={styles.calendarGrid}>
          {getCalendarDays().map((day, index) => (
            <View key={index} style={styles.calendarDayContainer}>
              {day ? (
                <View style={[
                  styles.calendarDay,
                  day.isToday && styles.todayCalendarDay,
                  day.isFullyApproved && styles.fullyApprovedDay,
                  day.isPartiallyApproved && styles.partiallyApprovedDay,
                  day.isPast && !day.hasCheckin && !day.hasCheckout && styles.missedDay,
                  day.isFuture && styles.futureDay
                ]}>
                  <Text style={[
                    styles.calendarDayNumber,
                    day.isToday && styles.todayText,
                    day.isFullyApproved && styles.approvedText,
                    day.isPartiallyApproved && styles.partiallyApprovedText,
                    day.isPast && !day.hasCheckin && !day.hasCheckout && styles.missedText,
                    day.isFuture && styles.futureText
                  ]}>
                    {day.dayNumber}
                  </Text>
                  
                  
                  {/* Indicator theo nửa ca của cặp mới nhất: cam nhạt (nháp), đỏ (chưa chấm), xanh (đã chấm) */}
                  {!day.isFuture && (
                    <View style={styles.partialIndicator}>
                      <View style={[
                        styles.halfIndicator,
                        styles.leftHalf,
                        day.isCheckinDraft ? styles.draftHalf : (day.hasCheckin ? styles.approvedHalf : styles.missedHalf)
                      ]} />
                      <View style={[
                        styles.halfIndicator,
                        styles.rightHalf,
                        day.isCheckoutDraft ? styles.draftHalf : (day.hasCheckout ? styles.approvedHalf : styles.missedHalf)
                      ]} />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyDay} />
              )}
            </View>
          ))}
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.fullyApprovedDay]} />
            <Text style={styles.legendText}>Đã chấm công đầy đủ</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.missedDay]} />
            <Text style={styles.legendText}>Chưa chấm công</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.partiallyApprovedDay]} />
            <Text style={styles.legendText}>Chưa đến ngày</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.draftHalf]} />
            <Text style={styles.legendText}>Nháp</Text>
          </View>

        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: ss(16),
  },
  header: {
    marginBottom: ss(20),
  },
  title: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: ss(16),
    marginBottom: ss(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: ss(12),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCardBasic: {
    width: '48%',
    borderRadius: 12,
    padding: ss(16),
    marginBottom: ss(12),
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ss(4),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardBlue: {
    borderColor: '#cfe8ff',
  },
  cardGreen: {
    borderColor: '#cfead6',
  },
  cardOrange: {
    borderColor: '#ffe3c7',
  },
  cardPurple: {
    borderColor: '#e2d6ff',
  },
  accentBlue: {
    backgroundColor: '#3b82f6',
  },
  accentGreen: {
    backgroundColor: '#22c55e',
  },
  accentOrange: {
    backgroundColor: '#f59e0b',
  },
  accentPurple: {
    backgroundColor: '#8b5cf6',
  },
  statCard3D: {
    // deprecated
  },
  statValue: {
    fontSize: fs(36),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: ss(6),
    // no text shadow for basic style
  },
  statLabel: {
    fontSize: fs(13),
    color: '#666666',
    textAlign: 'center',
    fontWeight: '600',
    opacity: 1,
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: ss(16),
  },
  monthYearText: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: '#333',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: ss(8),
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: fs(16), // Tăng font size cho header ngày
    fontWeight: 'bold',
    color: '#666',
    paddingVertical: ss(12), // Tăng padding
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  calendarDayContainer: {
    width: '14.28%', // 100% / 7 ngày
    aspectRatio: 1.2, // Tăng chiều cao một chút
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    minHeight: ss(60), // Chiều cao tối thiểu
  },
  calendarDay: {
    flex: 1,
    padding: ss(6), // Tăng padding
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
    position: 'relative',
  },
  emptyDay: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  todayCalendarDay: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  fullyApprovedDay: {
    backgroundColor: '#D2ECD2',
  },
  partiallyApprovedDay: {
    backgroundColor: '#E0E0E0', // Màu nền đậm hơn một chút
    position: 'relative',
    overflow: 'hidden',
  },
  missedDay: {
    backgroundColor: '#FFCDD2',
  },
  futureDay: {
    backgroundColor: '#ffffff',
  },
  calendarDayNumber: {
    fontSize: fs(18), // Tăng font size
    fontWeight: 'bold',
    color: '#000',
    zIndex: 10, // Đảm bảo text hiển thị trên background
  },
  todayText: {
    color: '#000',
    fontSize: fs(20), // Tăng font size cho hôm nay
  },
  approvedText: {
    color: '#000',
    zIndex: 10,
  },
  partiallyApprovedText: {
    color: '#000', // Luôn đen
    zIndex: 10,
  },
  missedText: {
    color: '#000',
    zIndex: 10,
  },
  futureText: {
    color: '#000',
    zIndex: 10,
  },
  partialIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  halfIndicator: {
    flex: 1,
    height: '100%',
  },
  leftHalf: {
    backgroundColor: '#bdbdbd',
  },
  rightHalf: {
    backgroundColor: '#bdbdbd',
  },
  approvedHalf: {
    backgroundColor: '#A5D6A7', // Xanh đậm hơn một chút
  },
  missedHalf: {
    backgroundColor: '#EF9A9A', // Đỏ đậm hơn một chút
  },
  draftHalf: {
    backgroundColor: '#FFD9B0', // Cam nhạt cho nửa ca ở trạng thái nháp
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16,
  },
});

export default AttendanceStatistics;
