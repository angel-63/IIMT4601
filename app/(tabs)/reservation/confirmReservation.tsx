import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_BASE } from '@/config-api';
import axios from 'axios';

type Route = {
  start: string;
  end: string;
  fare: Number;
};

export default function ConfirmReservation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log('Received params:', params);
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const data = await getRouteStartEnd();
        setRouteData({ start: data.start, end: data.end, fare: data.fare });
      } catch {
        setRouteData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoute();
  }, [params.route_id]);

  const handleConfirm = async () => { 
    try { 
      const baseUrl = await API_BASE;
      const response = await axios.post(`${baseUrl}/reservations`, {
        route_id: params.route_id,
        date: params.date,
        time: params.time,
        seat: Number(params.seat),
        pickUp: params.pickUp,
        dropOff: params.dropOff,
      });

      if (response.status === 201) {
        router.push({
          pathname: '/reservation/paymentSuccess',
          params: {
            reservation_id: response.data._id, // Adjust based on API response
            start: routeData ? `${routeData.start}` : 'Unknown',
            end: routeData ? `${routeData.end}` : 'Unknown',
            date: params.date,
            time: params.time,
            amount: Number(params.seat) * Number(routeData ? `${routeData.fare}` : 0)
          }
        });
      }
    } catch (error: unknown) {
      console.error('Error creating reservation:', error);
      const message = error instanceof Error? error.message: 'Unknown error occurred';
      Alert.alert('Error', message);
    }
  };


  const getRouteStartEnd = async () => {
    try {
      const routeId = params.route_id;
      const baseUrl = await API_BASE;
      const response = await axios.get(`${baseUrl}/routes/${routeId}`);
      // console.log(response.data.start);
      // console.log(response.data.end);
      console.log(response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching route:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', message);
      throw new Error(message);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.header}>Reservation Details</Text>

        <View style={styles.row}>
          <Text style={styles.colname}>
            Route
          </Text>
          <Text style={styles.colval}>
            {isLoading ? 'Loading...' : routeData ? 
            `${routeData.start} → ${routeData.end}` : 'Unknown'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.colname}>
            Travel Date
          </Text>
          <Text style={styles.colval}>
            {params.date}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.colname}>
            Time
          </Text>
          <Text style={styles.colval}>
            {params.time}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.colname}>
            Number of Seats
          </Text>
          <Text style={styles.colval}>
            {params.seat}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.colname}>
            Pick-up Location
          </Text>
          <Text style={styles.colval}>
            {params.pickUp}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.colname}>
            Drop-Off Location
          </Text>
          <Text style={styles.colval}>
            {params.dropOff}
          </Text>
        </View>
        <Pressable style={({pressed}) => [styles.confirmButton, {opacity: pressed ? 0.5 : 1}]}>
                  <Text onPress={handleConfirm}
                  style={{color:'white', textAlign:'center'}}>Confirm Details</Text></Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3%',
    backgroundColor: '#FFFFFF'
  },
  container:{
    borderRadius: 20,
    shadowOffset:{  width: 0,  height: 8,  },
    shadowRadius: 32,
    shadowColor: '#666666',
    shadowOpacity: 0.16,
    backgroundColor: '#FFF',
    width: '95%',
    paddingTop: '14%',
    paddingBottom: '6%',
    paddingHorizontal: '3%',
  },
  header:{
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: '12%',
    fontSize: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    paddingVertical: '3%',
  },
  colname:{
    fontWeight:'bold',
    width: '43%'
  },
  colval:{
    textAlign: 'right',
    width: '57%'
  },
  confirmButton:{
    fontSize: 10,
    backgroundColor: '#FF4141',
    justifyContent: 'center',
    alignSelf:'center',
    width: '95%',
    marginTop: '20%',
    padding: '3%',
    borderRadius: 8
  }
})