import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated, 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import MapView, { Polyline, Region, Marker, UrlTile } from 'react-native-maps';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { API_BASE } from '@/config-api';

const { width, height } = Dimensions.get('window');

type RouteStop = {
  stop_id: string;
  order: string;
  arrival_times: string[];
  shift_ids: string[];
};

type Route = {
  route_id: string;
  name: string;
  start: string;
  end: string;
  stops: RouteStop[];
};

type CombinedStop = {
  stop_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  arrival_times: string[];
  shift_ids: string[];
};

type Shift = {
  busNumber: string;
  nextStation: string;
  availableSeats: number;
};

export default function RouteDetailScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const routeId = params.route_id as string;
  const routeName = params.route_name as string;
  const stop_id = params.stop_id as string;
  const stop_name = params.stop_name as string;
  const stop_latitude = params.stop_latitude as string;
  const stop_longitude = params.stop_longitude as string;
  const user_latitude = params.user_latitude as string;
  const user_longitude = params.user_longitude as string;

  const [activeTab, setActiveTab] = useState('arrivalSchedule');
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<CombinedStop[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [expandedStop, setExpandedStop] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(stop_id);
  const [routeCoords, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [initialCoords, setInitialCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const markerRef = useRef<Marker>(null);
  const [stopPositions, setStopPositions] = useState<{ [key: string]: number }>({});
  const pulseAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    navigation.setOptions({
      headerTitle: routeName || 'Route Details',
    });
  }, [navigation, routeName]);

  // Parse initial coordinates from params
  useEffect(() => {
    try {
      const lat = parseFloat(stop_latitude);
      const lon = parseFloat(stop_longitude);
      if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
        setInitialCoords({ latitude: lat, longitude: lon });
      } else {
        console.warn('Invalid coordinates from params:', { stop_latitude, stop_longitude });
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
    }
  }, [stop_latitude, stop_longitude]);

  // Fetch shifts for live tracker
  const fetchShifts = async () => {
    try {
      setLoadingShifts(true);
      const baseUrl = await API_BASE;
      const response = await fetch(`${baseUrl}/shifts/${routeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }
      const data = await response.json();
      const validShifts = (data.shifts || []).filter((shift: Shift) => shift.nextStation !== 'Unknown');
      setShifts(validShifts);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      // Alert.alert('Error', 'Failed to load live tracker data');
    } finally {
      setLoadingShifts(false);
    }
  };

  // Fetch shifts for real time sesat capacity
  const fetchShiftbyId = async (shiftId: string) => {
    try {
      const baseUrl = await API_BASE;
      const response = await fetch(`${baseUrl}/shift/${shiftId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch shift details for ${shiftId}`);
      }
      const data = await response.json();
      console.log(data)
      return {
        available_seats: data.available_seats,
        shiftId,
      }
    } catch (error) {
      console.error('Error fetching shift:', error);
      Alert.alert('Error', 'Failed to load live tracker data');
    };
  }

  // Fetch route between stops using OSRM
  const fetchRoute = async () => {
    try {
      setIsLoadingRoute(true);
      const coordinates = stops
        .map(stop => `${stop.longitude},${stop.latitude}`)
        .join(';');
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      const routeCoords = data.routes[0].geometry.coordinates.map(coordinate => ({
        latitude: coordinate[1],
        longitude: coordinate[0],
      }));
      setRouteCoordinates(routeCoords);
    } catch (error) {
      console.error('Routing error:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Fetch a single stop by stop_id
  const fetchStopById = async (stopId: string): Promise<CombinedStop | null> => {
    try {
      const baseUrl = await API_BASE;
      const response = await fetch(`${baseUrl}/stops/${stopId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stop ${stopId}`);
      }
      const stopData: CombinedStop = await response.json();
      return stopData;
    } catch (error) {
      console.error(`Error fetching stop ${stopId}:`, error);
      return null;
    }
  };

  // Fetch route and stop data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = await API_BASE;

        // Fetch route details
        const routeResponse = await fetch(`${baseUrl}/routes/${routeId}`);
        if (!routeResponse.ok) throw new Error('Failed to fetch route');
        const routeData: Route = await routeResponse.json();

        // Get stop IDs
        const stopIds = routeData.stops.map((s) => s.stop_id);

        // Fetch stop details
        const stopsData: CombinedStop[] = [];
        for (const stopId of stopIds) {
          const stop = await fetchStopById(stopId);
          if (stop) {
            stopsData.push(stop);
          }
        }

        // Map stops to include name, coordinates, and route-specific data
        const combinedStops: CombinedStop[] = routeData.stops
          .map((routeStop, index) => {
            const stopDetail = stopsData.find((s) => s.stop_id === routeStop.stop_id);
            if (!stopDetail) return null;
            return {
              stop_id: routeStop.stop_id,
              latitude: stopDetail.latitude || 0,
              longitude: stopDetail.longitude || 0,
              order: index + 1,
              arrival_times: routeStop.arrival_times || [],
              shift_ids: routeStop.shift_ids || [],
              name: stopDetail.name,
            };
          })
          .filter((s): s is CombinedStop => s !== null);

        setRoute(routeData);
        setStops(combinedStops.filter((s) => s.latitude !== 0 && s.longitude !== 0));
        setSelectedStopId(stop_id || null);
        setExpandedStop(stop_id || null);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (routeId) {
      fetchData();
      // fetchShifts();
    };
  }, [routeId]);

  // Fetch route coordinates when stops change
  useEffect(() => {
    if (stops.length > 0) {
      fetchRoute();
    }
  }, [stops]);

  // Fetch shifts when activeTab changes to liveRouteTracker
  useEffect(() => {
    if (activeTab === 'liveRouteTracker' && routeId) {
      fetchShifts();
    }
  }, [activeTab, routeId]);

  /*
    // Get stop IDs
  const stopIds = routeData.stops.map((s) => s.stop_id);

  useEffect(() => {
    const shiftSeats: Shift[] = [];
    if (activeTab === 'arrivalSchedule' && routeId) {
      for (const shift_id of shift_ids){
        const shift = await fetchShifts(shift_id);
        if (shift_id){
          shiftSeats.push(shift_id)
        }
      }
    }
  }, [activeTab, routeId]);
  */

  // Synchronize map region and callout when selectedStopId changes
  useEffect(() => {
    if (selectedStopId && isMapReady) {
      const selectedStop = stops.find((stop) => stop.stop_id === selectedStopId);
      if (selectedStop && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: selectedStop.latitude,
            longitude: selectedStop.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          },
          500
        );
        setTimeout(() => {
          if (markerRef.current) {
            markerRef.current.showCallout();
          }
        }, 500);
      }
    }
  }, [selectedStopId, stops, isMapReady]);

  // Show callout when selectedStopId changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.showCallout();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedStopId]);

  const toggleStopExpansion = (stopId: string) => {
    setExpandedStop(expandedStop === stopId ? null : stopId);
    setSelectedStopId(stopId);
  };

  // Move map to user position
  const moveToUserPosition = useCallback(() => {
    try {
      const lat = parseFloat(user_latitude);
      const lon = parseFloat(user_longitude);
      if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0 && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lon,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          },
          500
        );
      } else {
        console.warn('Invalid user coordinates:', { user_latitude, user_longitude });
        Alert.alert('Error', 'Unable to locate your position');
      }
    } catch (error) {
      console.error('Error moving to user position:', error);
      Alert.alert('Error', 'Failed to move to your position');
    }
  }, [user_latitude, user_longitude]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Utility function to calculate minutes to arrival
  const getMinutesToArrival = (arrivalTime: string): any => {
    try {
      const [hours, minutes, seconds] = arrivalTime.split(':').map(Number);
      const now = new Date();
      const arrival = new Date(now);
      arrival.setHours(hours, minutes, seconds, 0);

      if (arrival < now) {
        return '-';
      }

      const diffMinutes = Math.round((arrival.getTime() - now.getTime()) / 1000 / 60);
      if(isNaN(diffMinutes)) return '-';
      if (diffMinutes == 0) {
        return 'Arrived';
      }
      return {
        diffMinutes, 
        suffix: `min${diffMinutes !== 1 ? 's' : ''}`
    };
    } catch (error) {
      console.error('Invalid arrival time format:', arrivalTime, error);
      return '-';
    }
  };

  const ArrivalTimes = ({ stop }: { stop: CombinedStop }) => {
    const [seatsData, setSeatsData] = useState<Record<string, { available_seats: number }>>({});
    const [loadingSeats, setLoadingSeats] = useState(true);
  
    useEffect(() => {
      const fetchSeats = async () => {
        setLoadingSeats(true);
        const seats = await Promise.all(
          stop.shift_ids.map(async (shiftId) => {
            const shiftData = await fetchShiftbyId(shiftId);
            return { shift_id: shiftId, ...shiftData };
          })
        );
        setSeatsData(
          seats.reduce((acc, { shift_id, available_seats }) => {
            if (available_seats !== undefined) {
              acc[shift_id] = { available_seats };
            }
            return acc;
          }, {} as Record<string, { available_seats: number }>)
        );
        setLoadingSeats(false);
      };
      if (stop.shift_ids.length > 0) {
        fetchSeats();
      } else {
        setLoadingSeats(false);
      }
    }, [stop.shift_ids]);
  
    if (loadingSeats) {
      return <ActivityIndicator size="small" color="#e05d44" />;
    }
  
    if (stop.arrival_times.length === 0) {
      return (
        <View style={styles.arrivalItem}>
          <Text style={{ fontSize: 12 }}>No arrival times</Text>
        </View>
      );
    }
  
    const futureArrivals = stop.arrival_times
      .map((arrivalTime, i) => {
        const minutesDisplay = getMinutesToArrival(arrivalTime);
        if (minutesDisplay === '-') return null;
  
        const shiftId = stop.shift_ids[i];
        const shiftData = seatsData[shiftId] ?? { available_seats: 0 };
  
        return {
          key: `${stop.stop_id}-${i}`,
          minutes: minutesDisplay.diffMinutes,
          suffix: minutesDisplay.suffix,
          seats: shiftData.available_seats,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  
    if (futureArrivals.length === 0) {
      return (
        <View style={styles.arrivalItem}>
          <Text style={{ fontSize: 12 }}>No upcoming arrivals</Text>
        </View>
      );
    }
  
    return futureArrivals.map((arrival) => (
      <View key={arrival.key} style={styles.arrivalItem}>
        <View style={styles.busIconContainer}>
          <MaterialIcons name="directions-bus" size={20} 
          color={(arrival.seats <= 8 && arrival.seats >4) ? '#F5AC38' : arrival.seats <= 4 ? '#FF4141' : '#39C977'} />
          <Text style={{ fontSize: 12, color: (arrival.seats <= 8 && arrival.seats >4)  ? '#F5AC38' : arrival.seats <= 4 ? '#FF4141' : '#39C977' }}>{arrival.seats}</Text>
        </View>
        <Text style={styles.arrivalTime}>{arrival.minutes}</Text>
        <Text style={{ fontSize: 12, marginHorizontal: 3 }}>{arrival.suffix}</Text>
      </View>
    ));
  };
  
  const renderStopItem = useCallback(
    (stop: CombinedStop, index: number) => (
      <TouchableOpacity
        key={stop.stop_id}
        style={styles.stopItem}
        onPress={() => toggleStopExpansion(stop.stop_id)}
        activeOpacity={0.8}
      >
        <View style={styles.stopNumberContainer}>
          <Text style={styles.stopNumber}>{stop.order}</Text>
        </View>
        <View style={styles.stopDetails}>
          <Text style={styles.stopName}>{stop.name}</Text>
          {expandedStop === stop.stop_id && (
            <View style={styles.arrivalContainer}>
              <ArrivalTimes stop={stop} />
            </View>
          )}
        </View>
        <View style={styles.stopAction}>
          <MaterialIcons
            name={expandedStop === stop.stop_id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color="#aaa"
          />
        </View>
      </TouchableOpacity>
    ),
    [expandedStop, toggleStopExpansion]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#e05d44" style={styles.loading} />
        ) : stops.length > 0 ? (
          !isLoadingRoute ? (
            <>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: initialCoords?.latitude,
                longitude: initialCoords?.longitude,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
              }}
              zoomEnabled={true}
              onMapReady={() => setIsMapReady(true)}
            >
              <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {stops.map((stop) => (
                <Marker
                  key={stop.stop_id}
                  ref={stop.stop_id === selectedStopId ? markerRef : null}
                  coordinate={{
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                  }}
                  title={stop.name}
                  onPress={() => {
                    setSelectedStopId(stop.stop_id);
                    setExpandedStop(stop.stop_id);
                    mapRef.current?.animateToRegion(
                      {
                        longitude: stop.longitude,
                        latitude: stop.latitude,
                        latitudeDelta: 0.008,
                        longitudeDelta: 0.008,
                      },
                      500
                    );
                  }}
                >
                  <View style={styles.marker}>
                    <FontAwesome
                      name="map-marker"
                      size={40}
                      color={selectedStopId === stop.stop_id ? '#FF4141' : '#FFC414'}
                    />
                  </View>
                </Marker>
              ))}
              {routeCoords.length > 0 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColors={['rgb(48,101,246)']}
                  strokeWidth={4}
                  lineCap="round"
                />
              )}
              <Marker
                  coordinate={{
                    latitude: parseFloat(user_latitude),
                    longitude: parseFloat(user_longitude),
                  }}
                >
                  <View style={styles.userMarker}>
                    <View style={styles.userMarkerOuter} />
                    <Animated.View
                      style={[
                        styles.userMarkerInner,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    />
                  </View>
              </Marker>
            </MapView>
            <TouchableOpacity
              style={styles.userLocationButton}
              onPress={moveToUserPosition}
              activeOpacity={0.7}
            >
              <Ionicons name="locate" size={24} color="#fff" />
            </TouchableOpacity>
            </>
          ) : (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FF4444" />
            </View>
          )
        ) : (
          <Text style={styles.noDataText}>No stops available to display on map</Text>
        )}
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
      <ScrollView style={styles.scheduleContainer}>
        {activeTab === 'arrivalSchedule' ? (
          <View style={styles.stopList}>
            {stops.length > 0 ? (
              stops.map(renderStopItem)
            ) : (
              <Text style={styles.noDataText}>No stops available</Text>
            )}
          </View>
        ) : (
          <View style={styles.liveTracker}>
            <Text style={styles.liveTrackerHeader}>Live Bus Locations</Text>
            {loadingShifts ? (
              <ActivityIndicator size="large" color="#e05d44" />
            ) : shifts.length > 0 ? (
              <View style={styles.busStatusContainer}>
                {shifts.map((shift, index) => (
                  <View key={index} style={styles.busStatusItem}>
                    <View style={styles.busIcon}>
                      <MaterialIcons name="directions-bus" size={24} color="white" />
                    </View>
                    <View style={styles.busInfo}>
                      <Text style={styles.busNumber}>{shift.busNumber}</Text>
                      <Text style={styles.busStatus}>Next station: {shift.nextStation}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No live bus data available</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  mapContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loading: {
    position: 'absolute',
    top: height * 0.25,
    alignSelf: 'center',
    zIndex: 10,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
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
    borderBottomColor: '#FF4444',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  stopList: {
    padding: 15,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stopNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stopNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
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
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 5,
  },
  stopAction: {
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
    backgroundColor: '#FF4444',
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
  userLocationButton: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    backgroundColor: '#FF4444',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  userMarkerInner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 7,
    backgroundColor: '#4285F4',
  },
});