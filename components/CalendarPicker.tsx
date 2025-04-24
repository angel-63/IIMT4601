import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface CalendarPickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const CalendarPicker = ({selectedDate, onDateChange}: CalendarPickerProps) => {
  // manage selected date
  // const [date, onDateChange] = useState('');

  interface DateStatus{
    selected:boolean;
  }
  const today = new Date();
  // today.setUTCHours(today.getUTCHours() +8);  // HKT = UTC+8
  today.setUTCHours(today.getUTCHours());
  console.log(`today: ${today}`);
  const enabledDates: { [key: string]: DateStatus } = {};
  // const tmr = new Date(today.getDate()+1);
  // const tmrString = tmr.toISOString().split('T')[0];
  
  // allow to choose only today and tmr
  // const enabledDates={
  //   [todayString]: {disabled: false},
  //   [tmrString]: {disabled: false},
    
  // }

  // calendar: enabled dates for today + next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setUTCHours(today.getUTCHours() + i*24);
    console.log(`date b4 +8: ${date}`);
    // date.setUTCHours(today.getUTCHours() + 8);
    // console.log(`after b4 +8: ${date}`);
    const dateString = date.toLocaleDateString('en-CA');
    console.log(dateString)
    enabledDates[dateString] = { 
      disabled: false,
      selected: selectedDate === dateString
    };
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Travel Date: </Text>
        <Text style={styles.selectedDate}>{selectedDate || 'No date selected'}</Text>
      </View>
      <Calendar
        disabledByDefault = {true}
        hideArrows = {true}
        disableMonthChange = {true}
        markedDates = {enabledDates}
        onDayPress={(day) => {
          const dayString = day.dateString;
          if (dayString in enabledDates){
            onDateChange(dayString);
            console.log(`chosen date: ${dayString}`)
          }
        }}

        theme={{
          // Customized theme for consistent design
          selectedDayBackgroundColor: '#E2EFFF',
          selectedDayTextColor: '#3678F6',
          todayTextColor: '#3678F6',
          textDisabledColor: '#ccc',
          arrowColor: '#3678F6',
          indicatorColor: '#CA2929',
          // Ensure consistent styles for both platforms
          'stylesheet.calendar.header': {
            header:{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              marginTop: '2%',
              alignItems: 'center',
            },
            week: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: '5%'
            },
          },
        }}
        style={styles.calendar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '5%',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems:'center',
    marginLeft: '3%',
    marginVertical: '1%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    // textAlign: 'left',
  },
  calendar: {
    borderColor: 'black',
    // top: "-6%"
  },
  selectedDate: {
    // marginTop: '5%',
    marginLeft: '1%',
    fontSize: 14,
    fontWeight: '600',
    // textAlign: 'left',
    zIndex: 1,
  },
});


export default CalendarPicker;