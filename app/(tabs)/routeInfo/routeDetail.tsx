// RouteDetail.tsx
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import MapView, { Polyline, Region, Marker, UrlTile } from 'react-native-maps';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { API_BASE } from '@/app/config-api';

const { width, height } = Dimensions.get('window');

type RouteStop = {
  stop_id: string;
  order: string;
  arrival_times: string[];
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
};

export default function RouteDetailScreen() {
  const [activeTab, setActiveTab] = useState('arrivalSchedule');
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<CombinedStop[]>([]);
  const [expandedStop, setExpandedStop] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [routeCoords, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false); // Track map readiness
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<Marker>(null);

  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const routeId = params.route_id as string;
  const routeName = params.route_name as string;


  useEffect(() => {
      navigation.setOptions({
        headerTitle: routeName || 'Route Details',
      });
    }, [navigation, routeName]);

  console.log('RouteDetail params:', { routeId, routeName });

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
              name: stopDetail.name || 'Unknown Stop',
              latitude: stopDetail.latitude || 0,
              longitude: stopDetail.longitude || 0,
              order: index + 1,
              arrival_times: routeStop.arrival_times || [],
            };
          })
          .filter((s): s is CombinedStop => s !== null);

        setRoute(routeData);
        setStops(combinedStops.filter((s) => s.latitude !== 0 && s.longitude !== 0));
        setSelectedStopId(combinedStops[0]?.stop_id || null);
        setExpandedStop(combinedStops[0]?.stop_id || null);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (routeId) fetchData();
  }, [routeId]);

  // Fetch route coordinates when stops change
  useEffect(() => {
    if (stops.length > 0) {
      fetchRoute();
    }
  }, [stops]);

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
    console.log('Toggling stop:', stopId);
    setExpandedStop(expandedStop === stopId ? null : stopId);
    setSelectedStopId(stopId);
  };

  // Utility function to calculate minutes to arrival
  const getMinutesToArrival = (arrivalTime: string): string => {
    try {
      const [hours, minutes, seconds] = arrivalTime.split(':').map(Number);
      const now = new Date();
      const arrival = new Date();
      arrival.setHours(hours, minutes, seconds, 0);

      if (arrival < now) {
        arrival.setDate(arrival.getDate() + 1);
      }

      const diffMinutes = Math.round((arrival.getTime() - now.getTime()) / 1000 / 60);
      if (diffMinutes <= 0) return 'Arrived';
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Invalid arrival time format:', arrivalTime, error);
      return 'N/A';
    }
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
              {stop.arrival_times.length > 0 ? (
                stop.arrival_times.map((arrivalTime, i) => (
                  <View key={`${stop.stop_id}-${i}`} style={styles.arrivalItem}>
                    <View style={styles.busIconContainer}>
                      <MaterialIcons name="directions-bus" size={18} color="#666" />
                      <Text style={styles.routeNumber}>{route?.name}</Text>
                    </View>
                    <Text style={styles.arrivalTime}>{getMinutesToArrival(arrivalTime)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.arrivalTime}>No arrival times available</Text>
              )}
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
    [expandedStop, route, toggleStopExpansion]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#e05d44" style={styles.loading} />
        ) : stops.length > 0 ? (
          !isLoadingRoute ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: stops[0].latitude,
                longitude: stops[0].longitude,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
              }}
              zoomEnabled={true}
              onMapReady={() => setIsMapReady(true)} // Set map as ready
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
            </MapView>
          ) : (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3065F6" />
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
    backgroundColor: '#e05d44',
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
    fontSize: 14,
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
});