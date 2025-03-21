import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarPicker = () => {
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel Date</Text>
      <Calendar
        onDayPress={(day) => {
            setSelectedDate(day.dateString);
          }}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#3678F6' },
        }}
        theme={{
          // Customize the theme for consistent design
          calendarBackground: '#fff',
          textSectionTitleColor: '#000',
        //   selectedDayBackgroundColor: '#E2EFFF',
          selectedDayTextColor: '#fff',
          todayTextColor: '#3678F6',
          todayBackgroundColor: '#E2EFFF',
          dayTextColor: '#000',
          textDisabledColor: '#ccc',
          arrowColor: '#3678F6',
          monthTextColor: '#000',
          indicatorColor: '#CA2929',
          // Ensure consistent styles for both platforms
          'stylesheet.calendar.header': {
            week: {
              marginTop: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
          },
        }}
        style={styles.calendar} // Apply custom styles
      />
      <Text style={styles.selectedDate}>
        Selected Date: {selectedDate || 'No date selected'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
  },
  calendar: {
    // borderColor: 'black',
  },
  selectedDate: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CalendarPicker;