import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ShowMap from '@/components/ShowMap';

const { width, height } = Dimensions.get('window');

export default function RouteDetailScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('arrivalSchedule');
  
  // Update stations to match Stop interface
  const stations = [
    { 
      stop_id: '1', 
      name: 'Sincere Podium', 
      latitude: 22.31977, 
      longitude: 114.16932 
    },
    { 
      stop_id: '2', 
      name: 'Kowloon Hospital', 
      latitude: 22.32563, 
      longitude: 114.17691 
    },
    { 
      stop_id: '3', 
      name: 'HK Eye Hospital', 
      latitude: 22.33102, 
      longitude: 114.18253 
    },
    { 
      stop_id: '4', 
      name: 'Evangel Hospital, Forfar Road', 
      latitude: 22.33521, 
      longitude: 114.18632 
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.mapContainer}>
        <ShowMap 
          stops={stations}
          initialRegion={{
            latitude: stations[0].latitude,
            longitude: stations[0].longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
        />
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'arrivalSchedule' && styles.activeTab]} 
            onPress={() => setActiveTab('arrivalSchedule')}
          >
            <Text style={styles.tabText}>Arrival Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'liveRouteTracker' && styles.activeTab]} 
            onPress={() => setActiveTab('liveRouteTracker')}
          >
            <Text style={styles.tabText}>Live Route Tracker</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Keep the rest of your ScrollView content unchanged */}
      <ScrollView style={styles.scheduleContainer}>
        {activeTab === 'arrivalSchedule' ? (
            <View style={styles.stationList}>
                <View style={styles.stationItem}>
                <View style={styles.stationNumberContainer}>
                    <Text style={styles.stationNumber}>1</Text>
                </View>
                <View style={styles.stationDetails}>
                    <Text style={styles.stationName}>Sincere Podium</Text>
                    <View style={styles.arrivalContainer}>
                    <View style={styles.arrivalItem}>
                        <View style={styles.busIconContainer}>
                        <MaterialIcons name="directions-bus" size={18} color="#666" />
                        <Text style={styles.routeNumber}>7</Text>
                        </View>
                        <Text style={styles.arrivalTime}>6 mins</Text>
                        <Text style={styles.routeCode}>(NH5094)</Text>
                    </View>
                    <View style={styles.arrivalItem}>
                        <View style={styles.busIconContainer}>
                        <MaterialIcons name="directions-bus" size={18} color="#666" />
                        <Text style={styles.routeNumber}>12</Text>
                        </View>
                        <Text style={styles.arrivalTime}>23 mins</Text>
                        <Text style={styles.routeCode}>(WF4525)</Text>
                    </View>
                    </View>
                </View>
                <View style={styles.stationAction}>
                    <MaterialIcons name="keyboard-arrow-up" size={24} color="#aaa" />
                </View>
                </View>

                <View style={styles.stationItem}>
                <View style={styles.stationNumberContainer}>
                    <Text style={styles.stationNumber}>2</Text>
                </View>
                <View style={styles.stationDetails}>
                    <Text style={styles.stationName}>Kowloon Hospital</Text>
                </View>
                <View style={styles.stationAction}>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color="#aaa" />
                </View>
                </View>

                <View style={styles.stationItem}>
                <View style={styles.stationNumberContainer}>
                    <Text style={styles.stationNumber}>3</Text>
                </View>
                <View style={styles.stationDetails}>
                    <Text style={styles.stationName}>HK Eye Hospital</Text>
                </View>
                <View style={styles.stationAction}>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color="#aaa" />
                </View>
                </View>

                <View style={styles.stationItem}>
                <View style={styles.stationNumberContainer}>
                    <Text style={styles.stationNumber}>4</Text>
                </View>
                <View style={styles.stationDetails}>
                    <Text style={styles.stationName}>Evangel Hospital, Forfar Road</Text>
                </View>
                <View style={styles.stationAction}>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color="#aaa" />
                </View>
                </View>
            </View>
            ) : (
            <View style={styles.liveTracker}>
                <Text style={styles.liveTrackerHeader}>Live Bus Locations</Text>
                <View style={styles.busStatusContainer}>
                <View style={styles.busStatusItem}>
                    <View style={styles.busIcon}>
                    <MaterialIcons name="directions-bus" size={24} color="white" />
                    </View>
                    <View style={styles.busInfo}>
                    <Text style={styles.busNumber}>NH5094</Text>
                    <Text style={styles.busStatus}>2 mins from Sincere Podium</Text>
                    </View>
                </View>
                
                <View style={styles.busStatusItem}>
                    <View style={styles.busIcon}>
                    <MaterialIcons name="directions-bus" size={24} color="white" />
                    </View>
                    <View style={styles.busInfo}>
                    <Text style={styles.busNumber}>WF4525</Text>
                    <Text style={styles.busStatus}>8 mins from Kowloon Hospital</Text>
                    </View>
                </View>
                </View>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Update styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  mapContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  tabsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#e05d44',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  stationList: {
    padding: 15,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stationNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e05d44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stationNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  stationDetails: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  arrivalContainer: {
    marginTop: 5,
  },
  arrivalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  busIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
  },
  routeNumber: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  arrivalTime: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  routeCode: {
    fontSize: 12,
    color: '#666',
  },
  stationAction: {
    padding: 5,
  },
  liveTracker: {
    padding: 15,
  },
  liveTrackerHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  busStatusContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  busStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  busIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e05d44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  busInfo: {
    flex: 1,
  },
  busNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  busStatus: {
    fontSize: 13,
    color: '#666',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#e05d44',
    height: 60,
  },
  bottomTabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
});