import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';

interface StreakCalendarProps {
  checkinDates: string[];
  currentMonth?: Date;
}

export function StreakCalendar({ checkinDates, currentMonth = new Date() }: StreakCalendarProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isCheckedIn = (day: number | null) => {
    if (!day) return false;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return checkinDates.includes(dateStr);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card style={styles.container}>
      <Typography variant="h3" color="#F9FAFB" style={styles.title}>
        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Typography>
      
      {/* Week day headers */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map((weekDay, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Typography variant="caption" color="#9CA3AF">
              {weekDay}
            </Typography>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day && isCheckedIn(day) && styles.checkedInDay,
              day && isToday(day) && styles.todayDay,
            ]}
            disabled={!day}
          >
            {day && (
              <Typography
                variant="caption"
                color={
                  isCheckedIn(day) ? '#FFFFFF' :
                  isToday(day) ? '#6366F1' : '#F9FAFB'
                }
              >
                {day}
              </Typography>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 1,
  },
  checkedInDay: {
    backgroundColor: '#10B981',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#6366F1',
  },
});