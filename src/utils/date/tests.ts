/**
 * Utility functions for testing date handling
 */

/**
 * Test date formatting and parsing to help debug date issues
 * @param dateString A date string in ISO format (YYYY-MM-DD)
 */
export const testDateHandling = (dateString: string): void => {
  console.log('=== Date Testing Utilities ===');
  console.log(`Testing date: ${dateString}`);
  
  try {
    // 1. Create date from string
    const date = new Date(dateString);
    console.log('1. Parsed as Date object:', date.toString());
    
    // 2. Check if date is valid
    const isValid = !isNaN(date.getTime());
    console.log('2. Is valid date?', isValid);
    
    if (!isValid) {
      console.error('   ⚠️ Invalid date detected!');
      return;
    }
    
    // 3. Get ISO string (UTC)
    const isoString = date.toISOString();
    console.log('3. ISO string (UTC):', isoString);
    
    // 4. Extract date parts
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-indexed
    const day = date.getDate();
    console.log('4. Date components (local):', { year, month, day });
    
    // 5. Format as YYYY-MM-DD
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('5. Formatted as YYYY-MM-DD:', formattedDate);
    
    // 6. Compare with original
    const matches = formattedDate === dateString;
    console.log('6. Matches original input?', matches);
    if (!matches) {
      console.warn('   ⚠️ Formatted date does not match original input!');
    }
    
    // 7. Test Vietnamese locale formatting
    const viFormat = date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    console.log('7. Vietnamese format:', viFormat);
    
    console.log('=== End Date Testing ===');
  } catch (error) {
    console.error('Error during date testing:', error);
  }
};

/**
 * Helper to convert a formatted display date back to ISO format
 * @param displayDate Date string in format DD/MM/YYYY
 * @returns ISO date string YYYY-MM-DD
 */
export const parseDisplayDate = (displayDate: string): string => {
  if (!displayDate) return '';
  
  try {
    // Remove "(nửa ngày)" if present
    const cleanDate = displayDate.replace('(nửa ngày)', '').trim();
    
    // Split DD/MM/YYYY
    const parts = cleanDate.split('/');
    if (parts.length !== 3) {
      throw new Error(`Invalid display date format: ${displayDate}`);
    }
    
    // Rearrange to YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  } catch (error) {
    console.error('Error parsing display date:', error);
    return '';
  }
};