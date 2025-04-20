import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import DateTimePicker, { DateTimePickerEvent, TimePickerOptions } from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface TimePickerProps{
  selectedTime: string;
  onTimeChange: (selectedTime: string) => void;
}

const TimePicker = ({selectedTime, onTimeChange}: TimePickerProps) =>{
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