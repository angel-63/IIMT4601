import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { API_BASE } from '../../../config-api';
import { useAuth } from '../../../context/auth';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface Route {
  route_id: string;
  name: string;
  from: string;
  fromLocation: string;
  to: string;
  toLocation: string;
  fare?: string;
  duration?: string;
  nextArrival?: string;
}

// const BACKEND_URL = 'http://localhost:3001';
const BACKEND_URL = API_BASE;

export default function ScheduleScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [expandedRoute, setExpandedRoute] = useState('');
  const [bookmarkLoading, setBookmarkLoading] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const navigation = useNavigation();
  const { user, userId, fetchUserData } = useAuth();

  const fetchStopById = async (stopId: string): Promise<Route | null> => {
    try {
      const baseUrl = await API_BASE;
      const response = await fetch(`${baseUrl}/stops/${stopId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stop ${stopId}`);
      }
      const stopData: Route = await response.json();
      console.log(`stopData: ${JSON.stringify(stopData)}`)
      return stopData;
    } catch (error) {
      console.error(`Error fetching stop ${stopId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const baseUrl = await API_BASE;
        const response = await fetch(`${baseUrl}/routes`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const fetchedRoutes: Route[] = await Promise.all(
          data.map(async (item: any) => {
          // Extract first and last stop_id from stops array
            const stops = item.stops || [];
            const firstStopId = stops[0]?.stop_id;
            const lastStopId = stops[stops.length - 1]?.stop_id;

          // Fetch stop details for fromLocation and toLocation
          const firstStop = firstStopId ? await fetchStopById(firstStopId) : null;
          const lastStop = lastStopId ? await fetchStopById(lastStopId) : null;

            return {
              route_id: item.route_id,
              name: item.route_name,
              from: item.start,
              fromLocation: firstStop?.name || '-',
              to: item.end,
              toLocation: lastStop?.name || '-',
              fare: item.fare?.toString(),
              nextArrival: findNextArrival(stops[0]?.arrival_times || []),
            };
          })
        );

        setRoutes(fetchedRoutes);
      } catch (error) {
        console.error('API Error:', error);
      Alert.alert('Error', 'Failed to load routes');
      }
    };
    fetchRoutes();
  }, []);

  const toggleBookmark = async (routeId: string) => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please log in again.', [{ text: 'Close' }]);
      return;
    }

    setBookmarkLoading((prev) => ({ ...prev, [routeId]: true }));
    try {
      await axios.post(`${BACKEND_URL}/user/${userId}/bookmark`, { routeId });
      await fetchUserData();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark.', [{ text: 'Close' }]);
    } finally {
      setBookmarkLoading((prev) => ({ ...prev, [routeId]: false }));
    }
  };

  const sortedRoutes = React.useMemo(() => {
    if (!user?.bookmarked?.length) return routes;
    const bookmarked = routes.filter(r => user.bookmarked.includes(r.route_id));
    const others = routes.filter(r => !user.bookmarked.includes(r.route_id));
    return [...bookmarked, ...others];
  }, [routes, user?.bookmarked]);

  const findNextArrival = (arrivalTimes: string[]): string | null => {
    if (!arrivalTimes || arrivalTimes.length === 0) return '-';

    const now = new Date();
    let nextArrivalTime: string | null = null;
    let minDiff = Infinity;

    for (const time of arrivalTimes) {
      try {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const arrival = new Date();
        arrival.setHours(hours, minutes, seconds || 0, 0);

        if (arrival < now) return null;

        const diffMinutes = (arrival.getTime() - now.getTime()) / 1000 / 60;
        if (isNaN(diffMinutes)) return '-';
        if (diffMinutes >= 0 && diffMinutes < minDiff) {
          minDiff = diffMinutes;
          nextArrivalTime = time;
        }
      } catch (error) {
        console.error('Invalid time format:', time, error);
      }
    }

    return nextArrivalTime || '-';
  };

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
      if (isNaN(diffMinutes)) return '-';
      if (diffMinutes <= 0 && diffMinutes > -1) {
        return 'Arrived';
      }
      return {
        diffMinutes,
        suffix: `min${diffMinutes !== 1 ? 's' : ''}`,
      };
    } catch (error) {
      console.error('Invalid arrival time format:', error);
      return '-';
    }
  };

  const renderRouteItem = (route: Route, index: string | number) => {
    const isExpanded = expandedRoute === `${route.from} → ${route.to}`;
    const routeKey = `${route.from} → ${route.to}`;
    const { diffMinutes, suffix } = getMinutesToArrival(route.nextArrival || '-');
    const isBookmarked = user?.bookmarked?.includes(route.route_id) || false;

    const handleRoutePress = () => {
      router.push({
        pathname: '../schedule/routeDetail',
        params: {
          route_id: route.route_id,
          route_name: `${route.from} → ${route.to}`,
        },
      });

      console.log(`Navigating to routeDetail with params:`, {
        route_id: route.route_id,
        route_name: `${route.from} ↔ ${route.to}`,
      });
    };

    return (
      <View key={index} style={styles.routeCard}>
        <TouchableOpacity style={styles.routeHeader} onPress={handleRoutePress}>
          <View style={styles.routeInfo}>
            <View style={styles.routeMainInfo}>
              <View style={styles.locationColumn}>
                <Text style={styles.routeName}>{route.from}</Text>
                <Text style={styles.routeLocation}>{route.fromLocation || '-'}</Text>
              </View>
              <View>
                <Text style={styles.routeArrow}>→</Text>
              </View>
              <View style={styles.locationColumn}>
                <Text style={styles.routeName}>{route.to}</Text>
                <Text style={styles.routeLocation}>{route.toLocation || '-'}</Text>
              </View>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setExpandedRoute(isExpanded ? '' : routeKey)}
              >
                <MaterialIcons name="paid" size={22} color="#aaa" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.arrivalInfo}>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => toggleBookmark(route.route_id)}
              disabled={bookmarkLoading[route.route_id]}
            >
              {bookmarkLoading[route.route_id] ? (
                <ActivityIndicator size="small" color="#FF4444" />
              ) : isBookmarked ? (
                <MaterialIcons name="bookmark" size={24} color="#FF4444" />
              ) : (
                <MaterialIcons name="bookmark-border" size={24} color="#aaa" />
              )}
            </TouchableOpacity>
            {diffMinutes && diffMinutes !== '-' && diffMinutes !== 'Arrived' ? (
              <>
                <Text style={styles.arrivalTime}>{diffMinutes}</Text>
                <Text style={styles.arrivalLabel}>{suffix}</Text>
                <Text style={styles.arrivalNote}>till next arrival</Text>
              </>
            ) : (
              <View>
                <Text style={[styles.arrivalTime, { textAlign: 'center' }]}>
                  {diffMinutes === 'Arrived' ? 'Arrived' : '-'}
                </Text>
                <Text style={styles.arrivalLabel}></Text>
                <Text style={styles.arrivalNote}></Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedInfo}>
            {route.fare && (
              <View style={[styles.fareInfo, { flexDirection: 'row', alignContent: 'center' }]}>
                <Text style={styles.fareLabel}>Fare: </Text>
                <Text style={styles.fareAmount}>{route.fare}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/app-icon-redvan.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Chiu Luen Minibus</Text>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="white" />
          <Text style={styles.locationText}>Tung Choi St., Mong Kok</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Routes</Text>
        </View>
        {sortedRoutes.map((route, index) => renderRouteItem(route, index))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 8,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  routeHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoButton: {
    marginLeft: 4,
    marginTop: '-5%',
  },
  routeSubInfo: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 20,
  },
  routeLocation: {
    fontSize: 11,
    color: '#666',
    width: 100,
    justifyContent: 'flex-start',
  },
  routeDuration: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
  },
  arrivalInfo: {
    alignItems: 'center',
    width: 100,
  },
  bookmarkButton: {
    marginBottom: 2,
  },
  arrivalTime: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  arrivalLabel: {
    fontSize: 12,
    color: '#666',
  },
  arrivalNote: {
    fontSize: 10,
    color: '#666',
  },
  expandedInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
  },
  fareInfo: {
    marginTop: 8,
  },
  fareLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fareAmount: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginLeft: '1%',
  },
  fareNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  routeArrow: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  locationColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
});