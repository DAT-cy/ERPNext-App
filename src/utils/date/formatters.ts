/**
 * Format date to string with Vietnamese locale
 * @param dateString Date string in format YYYY-MM-DD
 * @param isHalfDay Optional flag to append "(nửa ngày)" to result
 * @returns Formatted date string in Vietnamese locale (DD/MM/YYYY)
 */
export const formatDisplayDate = (dateString: string, isHalfDay: boolean = false): string => {
  if (!dateString) return '';
  
  try {
    // Create date object from string - handle YYYY-MM-DD format
    const date = new Date(dateString);
    
    // Validate date object
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Format using Vietnamese locale
    const formattedDate = date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    
    console.log(`Formatted date: ${dateString} → ${formattedDate} ${isHalfDay ? '(half day)' : ''}`);
    return isHalfDay ? `${formattedDate} (nửa ngày)` : formattedDate;
  } catch (error) {
    console.error('❌ Error formatting date:', error, dateString);
    return dateString;
  }
};

/**
 * Get array of dates in a month, with nulls for days before the first day of the month
 * @param year Year
 * @param month Month (0-11)
 * @returns Array of dates or nulls (for padding)
 */
export const getDaysInMonth = (year: number, month: number): (Date | null)[] => {
  const days: (Date | null)[] = [];
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Add padding for days before the first day of the month
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days in the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};

/**
 * Get current date as DD/MM/YYYY (Vietnamese locale style)
 */
export const formatCurrentDateDisplay = (): string => {
  const now = new Date();
  return now.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Get current time as HH:mm:ss (24h)
 */
export const formatCurrentTimeHMS = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('vi-VN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};