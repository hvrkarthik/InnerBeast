export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().split('T')[0];
  }
};

export const formatDisplayDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting display date:', error);
    return 'Invalid Date';
  }
};

export const formatTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }
    return dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

export const getWeekDates = (date: Date = new Date()) => {
  try {
    const currentDate = new Date(date);
    const startOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  } catch (error) {
    console.error('Error getting week dates:', error);
    return [new Date()];
  }
};

export const isDateToday = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

export const getDaysInStreak = (dates: string[]): number => {
  try {
    if (!dates || dates.length === 0) return 0;
    
    const sortedDates = dates
      .filter(date => date && typeof date === 'string')
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (sortedDates.length === 0) return 0;
    
    const today = formatDate(new Date());
    let streak = 0;
    let currentDate = new Date();
    
    for (const dateStr of sortedDates) {
      const checkDate = formatDate(currentDate);
      if (dateStr === checkDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};