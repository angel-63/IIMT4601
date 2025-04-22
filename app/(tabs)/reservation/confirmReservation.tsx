import React from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ConfirmReservation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log('Received params:', params);

  const proceedPayment = () => {
    router.push({
      pathname: '/reservation/paymentSuccess',
      params: params
    });
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
            {/* {params.route} */}
            placeholder
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
            {params.seats}
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
                  <Text onPress={proceedPayment}
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
    width: '50%'
  },
  colval:{
    textAlign: 'right',
    width: '50%'
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
