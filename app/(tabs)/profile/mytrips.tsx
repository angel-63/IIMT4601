import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE } from '@/config-api';
import { addMinutes, format, isToday, isFuture } from 'date-fns';
import { useAuth } from '../../../context/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';

type RootStackParamList = {
  'two': {
    route_id?: string;
    time?: string;
    seat?: string;
    pickUp?: string;
    dropOff?: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StopDetail {
  location: string;
  time?: string;
}

interface TripItemProps {
  id: string;
  from: string;
  to: string;
  date: string;
  price: string;
  status: 'Reserved' | 'Completed' | 'Cancelled';
  stops: StopDetail[];
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  routeId: string;
  time: string;
  seat: number;
  pickUp: string;
  dropOff: string;
}

const TripItem: React.FC<TripItemProps> = ({
  id,
  from,
  to,
  date,
  price,
  status,
  stops,
  expanded,
  onToggleExpand,
  routeId,
  time,
  seat,
  pickUp,
  dropOff,
}) => {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp>();
  const getStatusColor = () => {
    switch (status) {
      case 'Reserved':
        return '#F4C430';
      case 'Completed':
        return '#64C8C8';
      case 'Cancelled':
        return '#808080';
    }
  };

  const handleBookAgain = () => {
    router.push({
      pathname: '/(tabs)/reservation/two',
      params: {
        route_id: routeId,
        time,
        seat: seat.toString(),
        pickUp,
        dropOff,
      },
    });
  };

  return (
    <View style={styles.tripCard}>
      <TouchableOpacity
        style={styles.tripCardContent}
        onPress={() => onToggleExpand(id)}
        activeOpacity={0.7}
      >
        <View style={styles.tripMainInfo}>
          <View style={styles.locations}>
            <Text style={styles.locationText}>{from}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.locationText}>{to}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        
        <View style={styles.tripDetails}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.priceText}>{price}</Text>
        </View>
        
        {expanded && (
          <View style={styles.expandedDetails}>
            {stops.map((stop, index) => (
              <View key={index} style={styles.stopRow}>
                <View style={styles.stopIconContainer}>
                  {index === 0 ? (
                    <View style={styles.triangleIcon} />
                  ) : (
                    <View style={styles.squareIcon} />
                  )}
                </View>
                <Text style={styles.stopLocation}>{stop.location}</Text>
                {index === 0 && stop.time && (
                  <Text style={styles.stopTime}>{stop.time}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.expandIconContainer}>
          <Text style={[styles.expandIconText, expanded && styles.expandIconRotated]}>
            {expanded ? "▼" : "▲"}
          </Text>
          <TouchableOpacity
                style={styles.bookAgainButton}
                onPress={handleBookAgain}
                activeOpacity={0.7}
              >
                <Text style={styles.bookAgainText}>Book Again</Text>
            </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const MyTripsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [expandedTrips, setExpandedTrips] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [routeDetails, setRouteDetails] = useState<{ [key: string]: { start: string; end: string; fare: number } }>({});
  const { userId } = useAuth();

  const fetchReservations = async () => {
    try {
      const baseUrl = await API_BASE;

      // Fetch reservations
      const response = await axios.get(`${baseUrl}/reservations`, {
        params: {
          user_id: userId,
        },
      });

      const reservations = response.data.reservations;

      // Fetch route details for each unique route_id
      const uniqueRouteIds = [...new Set(reservations.map((item: any) => item.route_id))];
      const routePromises = uniqueRouteIds.map((routeId: string) =>
        axios.get(`${baseUrl}/routes/${routeId}`).catch((error) => {
          console.error(`Error fetching route ${routeId}:`, error);
          return { data: null };
        })
      );
      const routeResponses = await Promise.all(routePromises);
      const routeDetailsMap = routeResponses.reduce((acc: any, response) => {
        if (response.data) {
          const route = response.data;
          acc[route.route_id] = { start: route.start, end: route.end, fare: route.fare };
        }
        return acc;
      }, {});
      setRouteDetails(routeDetailsMap);

      // Group reservations by "Later", "Today", or "Earlier"
      const grouped = reservations.reduce(
        (acc: any, item: any) => {
          const dateHKT = new Date(item.date);
          dateHKT.setUTCHours(dateHKT.getUTCHours());
          let dateKey: string;
          if (isFuture(dateHKT)) {
            dateKey = 'Later';
          } else if (isToday(dateHKT)) {
            dateKey = 'Today';
          } else {
            dateKey = 'Earlier';
          }
          let group = acc.find((g: any) => g.title === dateKey);
          if (!group) {
            group = { title: dateKey, data: [] };
            acc.push(group);
          }
          group.data.push(item);
          return acc;
        },
        [
          { title: 'Later', data: [] },
          { title: 'Today', data: [] },
          { title: 'Earlier', data: [] },
        ]
      );

      // Filter non-empty groups and sort: Later, Today, Earlier
      const filteredGroups = grouped.filter((group: any) => group.data.length > 0);
      filteredGroups.sort((a: any, b: any) => {
        if (a.title === 'Later') return -1;
        if (b.title === 'Later') return 1;
        if (a.title === 'Today') return -1;
        if (b.title === 'Today') return 1;
        return 0;
      });

      // Sort items within groups (newest first)
      filteredGroups.forEach((group: any) => {
        group.data.sort((a: any, b: any) => new Date(b.date) - new Date(a.date));
      });

      // Flatten into [header, item, item, ...]
      const flatData = filteredGroups.reduce((acc: any, group: any) => {
        acc.push({ type: 'header', title: group.title });
        acc.push(
          ...group.data.map((item: any) => ({
            type: 'item',
            ...item,
          }))
        );
        return acc;
      }, []);

      setData(flatData);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      let message = 'Failed to fetch reservations';
      if (axios.isAxiosError(error) && error.response) {
        message = error.response.data.message || `Server error: ${error.response.status}`;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const toggleExpand = (tripId: string) => {
    setExpandedTrips((prev) =>
      prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]
    );
  };

  const renderTripItem = (item: any) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    const route = routeDetails[item.route_id] || { start: 'Unknown', end: 'Unknown', fare: 0 };
    const dateHKT = new Date(item.date);
    dateHKT.setUTCHours(dateHKT.getUTCHours());
    const formattedDate = format(dateHKT, 'dd MMM HH:mm');
    const formattedTime = format(dateHKT, 'HH:mm');
    const price = `HK$${item.seat * route.fare}`;
    const status = item.reservation_status as 'Reserved' | 'Completed' | 'Cancelled';
    const stops = [
      { location: item.pickup_location || 'Unknown', time: formattedTime },
      { location: item.dropoff_location || 'Unknown' },
    ];

    return (
      <TripItem
        id={item._id}
        from={route.start}
        to={route.end}
        date={formattedDate}
        price={price}
        status={status}
        stops={stops}
        expanded={expandedTrips.includes(item._id)}
        onToggleExpand={toggleExpand}
        routeId={item.route_id}
        time={formattedTime}
        seat={item.seat}
        pickUp={item.pickup_location}
        dropOff={item.dropoff_location}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={{ padding: 16 }}>Loading...</Text>
        ) : data.length === 0 ? (
          <Text style={{ padding: 16 }}>No reservations found.</Text>
        ) : (
          data.map((item, index) => <View key={index}>{renderTripItem(item)}</View>)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tripCardContent: {
    padding: 16,
  },
  tripMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locations: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  expandedDetails: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopIconContainer: {
    width: 20,
    alignItems: 'center',
  },
  triangleIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#999',
  },
  squareIcon: {
    width: 12,
    height: 12,
    backgroundColor: '#999',
  },
  stopLocation: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  stopTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  expandIconContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  expandIconText: {
    fontSize: 16,
    color: '#999',
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  bookAgainButton: {
    backgroundColor: '#FF4141',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  bookAgainText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MyTripsScreen;