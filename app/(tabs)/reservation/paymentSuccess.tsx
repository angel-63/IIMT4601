import React from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
// import { Svg, Path } from 'react-native-svg';

export default function ReservationSuccessful() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  // const reservationDate = new Date().toLocaleDateString('en-US', { // reservationDate = today
  //   year: 'numeric',
  //   month: 'short',
  //   day: 'numeric'
  // });

  // const reservationTime = new Date().toLocaleTimeString('en-US', { // reservationTime = now
  //   hour: '2-digit', 
  //   minute: '2-digit',
  //   hour12: false
  // });


  const returnHome = () => {
    router.push('/(tabs)/reservation');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {/* <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path 
            d="M7 4v16M17 4v16M7 4c0 4 3 6 3 8s-3 4-3 8M17 4c0 4-3 6-3 8s3 4 3 8" 
            stroke="#E8EAED" 
            strokeWidth="2" 
            fill="none"
          />
        </Svg> */}
          <FontAwesome style={styles.tickIcon} name="check-circle" size={24} color="#23A26D" />
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Payment Success!</Text>
          <Text style={styles.message}>Your payment has been successfully done.</Text>
        </View>

        <View style={styles.paymentContainer}>
          <Text style={styles.colname}>
            Payment Amount
          </Text>
          <Text style={[styles.colval, {paddingTop: 10}]}>
            ${params.amount}.00
          </Text>
        </View>

        <View style={[{flexDirection:'row'}, {justifyContent:"space-evenly"}]}>
          <View style={styles.itemContainer}>
            <Text style={styles.colname}>
              Reservation ID
            </Text>
            <Text style={styles.colval}>
              {params.reservation_id}
            </Text>
          </View>
        
          <View style={styles.itemContainer}>
            <Text style={styles.colname}>
              Route
            </Text>
            <Text style={styles.colval}>
              {params.start} → {params.end}
            </Text>
          </View>
        </View>

        <View style={[{flexDirection:'row'}, {justifyContent:"space-evenly"}]}>
          <View style={styles.itemContainer}>
            <Text style={styles.colname}>
              Reservation Date
            </Text>
            <Text style={styles.colval}>
              {params.date}
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={styles.colname}>
              Reservation Time
            </Text>
            <Text style={styles.colval}>
              {params.time}
            </Text>
          </View>
        </View>

        <Pressable style={({pressed}) => [styles.confirmButton, {opacity: pressed ? 0.5 : 1}]}>
          <Text onPress={returnHome}
          style={{color:'white', textAlign:'center'}}>Return to homepage</Text>
        </Pressable>

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
    shadowOffset:{width: 0,  height: 8,},
    shadowRadius: 32,
    shadowColor: '#666666',
    shadowOpacity: 0.16,
    backgroundColor: '#FFF',
    width: '95%',
    paddingTop: '14%',
    paddingBottom: '6%',
    paddingHorizontal: '3%',
  },
  tickIcon:{
    position: 'absolute',
    top: '-5%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: '2%',
    // Shadow for iOS
    shadowColor: '#666666',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerContainer:{
    paddingBottom: '10%',
    alignSelf: 'center',
    borderBottomColor: '#E8EAED',
    borderBottomWidth: 1
  },
  header:{
    fontWeight: 'semibold',
    textAlign: 'center',
    fontSize: 20
  },
  message:{
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
    marginTop: '2%',
  },
  paymentContainer:{
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 12,
    paddingTop: '6%',
  },
  itemContainer: {
    flexDirection: 'column',
    textAlign: 'left',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    paddingVertical: '3%',
    borderColor: '#EDEDED',
    borderWidth: 1,
    borderRadius: 6,
    margin: '1%',
    width: '45%'
  },
  colname:{
    marginBottom: 10,
    fontSize: 12,
    color: '#707070',
  },
  colval:{
    fontWeight:'medium',
    fontSize: 13,
    color: '#121212'
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
