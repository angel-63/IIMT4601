import { StyleSheet, Pressable, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import CalendarPicker from '@/components/CalendarPicker';
import TimePicker from '@/components/TimePicker';
import SeatCounter from '@/components/SeatCounter';
import LocationPicker from '@/components/LocationPicker';
import RoutePicker from '@/components/RoutePicker';
import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../context/auth';

type TwoParams = {
  selectedStop?: string;
  label?: string;
  route_id?: string;
  time?: string;
  seat?: string;
  pickUp?: string;
  dropOff?: string;
};

type ReservationParamList = {
  '(tabs)/reservation/two': TwoParams;
  '(tabs)/reservation/routeStops': { route_id: string; label: string; pickUp?: string };
  '(tabs)/reservation/confirmReservation': {
    route_id: string;
    date: string;
    time: string;
    seat: number;
    pickUp: string;
    dropOff: string;
  };
  '(tabs)/payment': undefined;
};

type NavigationProp = NativeStackNavigationProp<ReservationParamList>;

export default function TabTwoScreen() {
  const params = useLocalSearchParams<TwoParams>();
  const router = useRouter();
  const navigation = useNavigation<NavigationProp>();
  const { userId, user, fetchUserData } = useAuth();

  const [form, setForm] = useState({
    route_id: '',
    date: '',
    time: '',
    seat: 1,
    pickUp: 'Stops',
    dropOff: 'Stops',
  });
  const [loading, setLoading] = useState(false);
  const isFirstMount = useRef(true);

  // Fetch user data when component mounts or regains focus
  useEffect(() => {
    const fetchData = async () => {
      if (userId && !user) {
        setLoading(true);
        await fetchUserData();
        setLoading(false);
      }
    };

    fetchData();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchData(); // Refresh user data when screen is focused
    });

    return unsubscribe;
  }, [userId, navigation, user, fetchUserData]);

  // Prefill Book-Again fields
  useEffect(() => {
    if (isFirstMount.current) {
      const { route_id: rId, time: t, seat: s, pickUp: pu, dropOff: doff } = params;
      if (rId || t || s || pu || doff) {
        setForm(prev => ({
          ...prev,
          route_id: rId ?? prev.route_id,
          time: t ?? prev.time,
          seat: s ? parseInt(s, 10) : prev.seat,
          pickUp: pu ?? prev.pickUp,
          dropOff: doff ?? prev.dropOff,
        }));
      }
      isFirstMount.current = false;
    }
  }, [params]);

  // Handle updated navigation parameters for stop pickers
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const { selectedStop, label } = params as { selectedStop?: string; label?: string };
      if (selectedStop && label) {
        setForm(prev => {
          if (label === 'Pick-up' && prev.pickUp !== selectedStop) {
            return { ...prev, pickUp: selectedStop };
          }
          if (label === 'Drop-off' && prev.dropOff !== selectedStop) {
            return { ...prev, dropOff: selectedStop };
          }
          return prev;
        });
      }
    });
    return unsubscribe;
  }, [navigation, params]);

  // Update header with RoutePicker
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <RoutePicker
          onSelect={(routeId) =>
            setForm(prev => ({
              ...prev,
              route_id: routeId,
              pickUp: 'Stops', // Reset pickUp when route changes
              dropOff: 'Stops', // Reset dropOff when route changes
            }))
          }
          selectedRoute={form.route_id}
        />
      ),
    });
  }, [navigation, form.route_id]);

  const validateForm = () => {
    if (!form.route_id) {
      Alert.alert('Error', 'Please select a route.');
      return false;
    }
    if (!form.date) {
      Alert.alert('Error', 'Please select a date.');
      return false;
    }
    if (!form.time) {
      Alert.alert('Error', 'Please select a time.');
      return false;
    }
    if (!form.pickUp || form.pickUp === 'Stops') {
      Alert.alert('Error', 'Please select a pick-up location.');
      return false;
    }
    if (!form.dropOff || form.dropOff === 'Stops') {
      Alert.alert('Error', 'Please select a drop-off location.');
      return false;
    }
    return true;
  };

  const confirmReservation = () => {
    if (!validateForm()) return;

    const cardInfo = user?.cardInfo;
    if (!cardInfo || Object.keys(cardInfo).length === 0) {
      Alert.alert(
        'Payment Information Required',
        'Please add your card information to proceed with the reservation.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add Card Info',
            onPress: () => {
              router.push('/(tabs)/profile/payment');
            },
            style: 'default',
          },
        ]
      );
      return;
    }

    router.push({
      pathname: '/reservation/confirmReservation',
      params: {
        route_id: form.route_id,
        date: form.date,
        time: form.time,
        seat: form.seat,
        pickUp: form.pickUp,
        dropOff: form.dropOff,
      },
    });
  };

  return (
    <View style={[styles.container, { flexDirection: 'column' }]}>
      <View style={{ flex: 11, borderBottomColor: '#A9A9A9', borderBottomWidth: 1 }}>
        <CalendarPicker
          selectedDate={form.date}
          onDateChange={date => setForm(prev => ({ ...prev, date }))}
        />
      </View>

      <View style={[styles.row, { flex: 1 }]}>
        <Text style={styles.colname}>Time</Text>
        <TimePicker
          selectedTime={form.time}
          selectedDate={form.date}
          onTimeChange={time => setForm(prev => ({ ...prev, time }))}
        />
      </View>

      <View style={[styles.row, { flex: 1 }]}>
        <Text style={styles.colname}>Number of Seat</Text>
        <SeatCounter
          value={form.seat}
          onValueChange={seat => setForm(prev => ({ ...prev, seat }))}
        />
      </View>

      <View style={[styles.row, { flex: 1 }]}>
        <Text style={styles.colname}>Pick-up Location</Text>
        <LocationPicker
          value={form.pickUp}
          label="Pick-up"
          routeId={form.route_id}
          disabled={!form.route_id}
        />
      </View>

      <View style={[styles.row, { flex: 1 }]}>
        <Text style={styles.colname}>Drop-off Location</Text>
        <LocationPicker
          value={form.dropOff}
          label="Drop-off"
          routeId={form.route_id}
          disabled={!form.route_id}
          pickUp={form.pickUp}
        />
      </View>

      <View style={[styles.buttonContainer, { flex: 1 }]}>
        <Pressable
          style={({ pressed }) => [styles.payButton, { opacity: pressed || loading ? 0.5 : 1 }]}
          onPress={confirmReservation}
          disabled={loading}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {loading ? 'Loading...' : 'Proceed'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: 'row',
    borderBottomColor: '#A9A9A9',
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  colname: { fontWeight: 'bold', fontSize: 14 },
  buttonContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  payButton: {
    backgroundColor: '#FF4141',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    width: 120,
    padding: 10,
    borderRadius: 10,
  },
});