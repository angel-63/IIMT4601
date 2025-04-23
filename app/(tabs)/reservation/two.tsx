import { StyleSheet, Pressable } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import CalendarPicker from '@/components/CalendarPicker';
import TimePicker from '@/components/TimePicker';
import SeatCounter from '@/components/SeatCounter';
import LocationPicker from '@/components/LocationPicker';
// import RoutePicker from '@/components/RoutePicker';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function TabTwoScreen() {
  // const [dropOff, setDropOff] = useState('')
  // const [pickUp, setPickUp] = useState('')
  // const [seatCount, setSeatCount] = useState(1);
  const params = useLocalSearchParams();
  const API_BASE = 'http://192.168.1.78:3001'; // Use backend port

  const [form, setForm] = useState({
    route: params.selectedRouteId ? String(params.selectedRouteId) : '',
    date: '',
    time: '',
    seats: 1,
    pickUp: '',
    dropOff: ''
  });
  
  const router = useRouter();

  const confirmReservation = () => {
    router.push({
      pathname: '/reservation/confirmReservation',
      params: form
    });
  //   useEffect(() => {
      
  //   const response = await post(
  //     `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
  // );
  // })
  };

  return (
    <View style={[styles.container, {flexDirection: 'column'}]}>
      {/* <View>
        <RoutePicker
        selectedRoute={form.(route.id)}
        onSelect={(route) => setForm({...form, (route.id)})}/>
      </View> */}

      <View style={{flex: 11, borderBottomColor: '#A9A9A9', borderBottomWidth: 1}}>
        <CalendarPicker
        selectedDate={form.date}
        onDateChange={(date) => setForm({...form, date})}
        />
      </View>
      
      <View style={[styles.row, {flex:1}]}>
        <Text style={styles.colname}>
            Time
        </Text>
        <TimePicker
        selectedTime={form.time}
        onTimeChange={(time) => setForm({...form, time})}
        />
      </View>

      <View style={[styles.row, {flex:1}]}>
        <Text style={styles.colname}>
          Number of Seat
        </Text>
        <SeatCounter 
        value={form.seats}
        onValueChange={(seats) => setForm({...form, seats})}
        />
      </View>

      <View style={[styles.row, {flex:1}]}>
        <Text style={styles.colname}>
          Pick-up Location
        </Text>
        
        <LocationPicker 
        value={form.pickUp}
        onChange={(pickUp) => setForm({...form, pickUp})}
        label="Pick-up"
        />
      </View>

      <View style={[styles.row, {flex:1}]}>
        <Text style={styles.colname}>
          Drop-off Location
        </Text>

        <LocationPicker 
        value={form.dropOff}
        onChange={(dropOff) => setForm({...form, dropOff})}
        label="Drop-off"
        />
      </View>

      <View style={[styles.buttonContainer, {flex:1}]}>
        <Pressable style={({pressed}) => [styles.payButton, {opacity: pressed ? 0.5 : 1}]}>
          <Text onPress={confirmReservation}
          style={{color:'white', textAlign:'center'}}>Proceed to Payment</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: -1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  row: {
    flexDirection: 'row',
    borderBottomColor: '#A9A9A9',
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  colname:{
    fontWeight:'bold'
  },
  buttonContainer:{
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  payButton:{
    fontSize: 10,
    backgroundColor: '#FF4141',
    justifyContent: 'center',
    alignSelf:'flex-end',
    width: 160,
    padding: 10,
    borderRadius: 10
  }
});
