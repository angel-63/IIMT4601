import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { API_BASE } from '../../../config-api';
import { useAuth } from '../../../context/auth';
import axios from 'axios';

interface Route {
  route_id: string;
  name: string;
  from: string;
  fromLocation: string;
  to: string;
  toLocation: string;
  fare?: {
    full: string;
    discounted?: string;
    discountDescription?: string;
  };
  serviceTime?: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  duration?: string;
  nextArrival?: string;
}

const BACKEND_URL = 'http://localhost:3001';

export default function ScheduleScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [expandedRoute, setExpandedRoute] = useState('');
  const [bookmarkLoading, setBookmarkLoading] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const navigation = useNavigation();
  const { user, userId, fetchUserData } = useAuth();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const baseUrl = await API_BASE;
        const response = await fetch(`${baseUrl}/routes`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const fetchedRoutes: Route[] = data.map((item: any) => ({
          route_id: item.route_id,
          name: item.route_name,
          from: item.start,
          to: item.end,
          fare: item.fare,
          nextArrival: findNextArrival(item.stops[0]?.arrival_times || []),
        }));
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
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    setBookmarkLoading((prev) => ({ ...prev, [routeId]: true }));
    try {
      await axios.post(`${BACKEND_URL}/user/${userId}/bookmark`, { routeId });
      await fetchUserData();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark.');
    } finally {
      setBookmarkLoading((prev) => ({ ...prev, [routeId]: false }));
    }
  };

  const findNextArrival = (arrivalTimes: string[]): (string | null) => {
    if (!arrivalTimes || arrivalTimes.length === 0) return 'N/A';

    const now = new Date();
    let nextArrivalTime: string | null = null;
    let minDiff = Infinity;

    for (const time of arrivalTimes) {
      try {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const arrival = new Date();
        arrival.setHours(hours, minutes, seconds || 0, 0);

        if (arrival < now) {
          return null;
        }

        const diffMinutes = (arrival.getTime() - now.getTime()) / 1000 / 60;
        if (diffMinutes >= 0 && diffMinutes < minDiff) {
          minDiff = diffMinutes;
          nextArrivalTime = time;
        }
      } catch (error) {
        console.error('Invalid time format:', time, error);
      }
    }

    return nextArrivalTime || 'N/A';
  };

  const getMinutesToArrival = (arrivalTime: string): string | null => {
    try {
      const [hours, minutes, seconds] = arrivalTime.split(':').map(Number);
      const now = new Date();
      const arrival = new Date();
      arrival.setHours(hours, minutes, seconds, 0);

      if (arrival < now) {
        return null;
      }

      const diffMinutes = Math.round((arrival.getTime() - now.getTime()) / 1000 / 60);
      if (diffMinutes <= 0) return 'Arrived';
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Invalid arrival time format:', arrivalTime, error);
      return 'N/A';
    }
  };

  const renderRouteItem = (route: Route, index: string | number) => {
    const isExpanded = expandedRoute === `${route.from} ↔ ${route.to}`;
    const routeKey = `${route.from} ↔ ${route.to}`;
    const timeDisplay = getMinutesToArrival(route.nextArrival || 'N/A');
    const isBookmarked = user?.bookmarked?.includes(route.route_id) || false;

    const handleRoutePress = () => {
      router.push({
        pathname: '../routeInfo/routeDetail',
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
              <Text style={styles.routeName}>{route.from} ↔ {route.to}</Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setExpandedRoute(isExpanded ? '' : routeKey)}
              >
                <Ionicons name="information-circle-outline" size={22} color="#aaa" />
              </TouchableOpacity>
            </View>
            <View style={styles.routeSubInfo}>
              <Text style={styles.routeLocation}>{route.fromLocation || 'N/A'}</Text>
              <Text style={styles.routeDuration}>{route.duration || 'N/A'} mins</Text>
              <Text style={styles.routeLocation}>{route.toLocation || 'N/A'}</Text>
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
            {timeDisplay && timeDisplay !== 'N/A' && timeDisplay !== 'Arrived' ? (
              <>
                <Text style={styles.arrivalTime}>{timeDisplay}</Text>
                <Text style={styles.arrivalLabel}>mins</Text>
                <Text style={styles.arrivalNote}>till next arrival</Text>
              </>
            ) : (
              <View>
              <Text style={[styles.arrivalTime, {textAlign:'center'}]}>
                {timeDisplay === 'Arrived' ? 'Arrived' : '-'}
              </Text>
              <Text style={styles.arrivalLabel}></Text>
              <Text style={styles.arrivalNote}></Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedInfo}>
            {route.serviceTime && (
              <View style={styles.serviceTimeRow}>
                <View style={styles.serviceTimeCol}>
                  <Text style={styles.serviceTimeLabel}>Service Time:</Text>
                  <Text style={styles.serviceTimeValue}>Mon - Fri</Text>
                  <Text style={styles.serviceTimeValue}>Sat</Text>
                  <Text style={styles.serviceTimeValue}>Sun & Public Holiday</Text>
                </View>
                <View style={styles.serviceTimeCol}>
                  <Text style={styles.serviceTimeLabel}></Text>
                  <Text style={styles.serviceTimeValue}>{route.serviceTime.weekday}</Text>
                  <Text style={styles.serviceTimeValue}>{route.serviceTime.saturday}</Text>
                  <Text style={styles.serviceTimeValue}>{route.serviceTime.sunday}</Text>
                </View>
              </View>
            )}
            {route.fare && (
              <View style={styles.fareInfo}>
                <Text style={styles.fareLabel}>Fare:</Text>
                <Text style={styles.fareValue}>Full Fare</Text>
                <Text style={styles.fareAmount}>{route.fare}</Text>
                {route.fare.discounted && (
                  <>
                    <Text style={styles.fareNote}>{route.fare.discountDescription}</Text>
                    <Text style={styles.fareAmount}>{route.fare.discounted}</Text>
                  </>
                )}
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
          <View style={styles.logo}></View>
          <Text style={styles.logoText}>LOGO</Text>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="white" />
          <Text style={styles.locationText}>Tung Choi St., Mong Kok</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {routes.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Journey</Text>
            </View>
            {renderRouteItem(routes[0], 'recent')}
          </>
        )}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Routes</Text>
        </View>
        {routes.map((route, index) => renderRouteItem(route, index))}
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
    width: 24,
    height: 24,
    backgroundColor: '#ddd',
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
  },
  routeSubInfo: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  routeLocation: {
    fontSize: 12,
    color: '#666',
  },
  routeDuration: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
  },
  arrivalInfo: {
    alignItems: 'center',
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
  serviceTimeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  serviceTimeCol: {
    flex: 1,
  },
  serviceTimeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceTimeValue: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  fareInfo: {
    marginTop: 8,
  },
  fareLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fareValue: {
    fontSize: 12,
    color: '#666',
  },
  fareAmount: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  fareNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});