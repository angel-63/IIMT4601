import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import DateTimePicker, { DateTimePickerEvent, TimePickerOptions } from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface TimePickerProps{
  selectedTime: string;
  selectedDate: string;
  onTimeChange: (selectedTime: string) => void;
}

const TimePicker = ({selectedTime, selectedDate, onTimeChange}: TimePickerProps) =>{
  // const [time, setTime] = useState('');
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirm = (time: Date) => {
    const hkgTime = time.toLocaleTimeString('en-HK', {
      timeZone: 'Asia/Hong_Kong',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    onTimeChange(hkgTime);
    // console.log("A time has been picked: ", hkgTime);
    // onTimeChange(time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    hideDatePicker();
  };

  // Calculate minimum time (now + 30 minutes)
  const getMinimumTime = () => {
    if (!selectedDate) return undefined;

    const today = new Date();
    today.setUTCHours(today.getUTCHours());
    // console.log(`today: ${today}`);
    const todayString = today.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    // console.log(`selectedDate: ${selectedDate}`);
    // console.log(`todayString: ${todayString}`);
    const isToday = selectedDate === todayString;

    if (isToday) {
      const minTime = new Date();
      minTime.setMinutes(minTime.getMinutes() + 30);

      const minutes = minTime.getMinutes();
      // console.log(`minutes: ${minutes}`)
      
      const roundedMinutes = Math.ceil(minutes / 15) * 15;
      // console.log(`roundedMinutes: ${roundedMinutes}`)
      minTime.setMinutes(roundedMinutes);
      
      minTime.setSeconds(0); // reset seconds to 0
      // console.log(`minutes: ${minutes}`)
      // console.log(`minTime: ${minTime}`)
      return minTime;
    }
  }

  return (
    <View style={styles.buttonStyle}>
      <Pressable onPress={showTimePicker}>
        {({ pressed }) => (
        <View style={[styles.chooseTime, {opacity: pressed ? 0.5 : 1}]}>
          <Text>{selectedTime || "Select Time"}</Text>
          <Image source={require('../assets/images/clock.png')} style={styles.clock} />
        </View>
        )}
      </Pressable>
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        display='spinner'
        minuteInterval={15}
        minimumDate={getMinimumTime()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    borderColor: 'rgb(166,166,166)',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
  },
  date: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
  },
  clock: {
    width: 16,
    height: 16,
    marginLeft: 6,
    justifyContent: 'center',
  },
  chooseTime:{
    flexDirection: 'row',
    alignItems: 'center',
  }
});


export default TimePicker;