import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Alert, Pressable, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_BASE } from '@/config-api';
import { addMinutes, format, isToday } from 'date-fns';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';

export default function ReservationHistory() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { userId } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [routeDetails, setRouteDetails] = useState({}); // Store route_id -> { start, end }

  const fetchReservations = async () => {
    try {
      const baseUrl = await API_BASE;

      // Get current time in HKT, convert to UTC
      const now = new Date();
      now.setUTCHours(now.getUTCHours());
      console.log(`nowUTC.toISOString(): ${now.toISOString()}`)
      console.log(userId);

      const response = await axios.get(`${baseUrl}/reservations`, {
        params: {
          user_id: userId,
          reservation_status: 'Reserved',
          date_gte: now.toISOString(), // e.g., "2025-04-24T07:00:00.000Z"
        },
      });

      const reservations = response.data.reservations;

      // Fetch route details for each unique route_id
      const uniqueRouteIds = [...new Set(reservations.map((item) => item.route_id))];
      const routePromises = uniqueRouteIds.map((routeId) =>
        axios.get(`${baseUrl}/routes/${routeId}`).catch((error) => {
          console.error(`Error fetching route ${routeId}:`, error);
          return { data: null }; // Handle route not found
        })
      );
      const routeResponses = await Promise.all(routePromises);
      const routeDetailsMap = routeResponses.reduce((acc, response) => {
        if (response.data) {
          const route = response.data;
          acc[route.route_id] = { start: route.start, end: route.end, fare: route.fare };
        }
        return acc;
      }, {});
      setRouteDetails(routeDetailsMap);
    //   console.log(routeDetails.route_id.start);

      // Group reservations by "Today" or "Later"
      const grouped = reservations.reduce(
        (acc, item) => {
          const dateHKT = new Date(item.date);
          dateHKT.setUTCHours(dateHKT.getUTCHours());
          const dateKey = isToday(dateHKT) ? 'Today' : 'Later';
          console.log(`dateHKT: ${dateHKT}, dateKey: ${dateKey}`)
          let group = acc.find((g) => g.title === dateKey);
          if (!group) {
            group = { title: dateKey, data: [] };
            acc.push(group);
          }
          group.data.push(item);
          return acc;
        },
        [
          { title: 'Today', data: [] },
          { title: 'Later', data: [] },
        ]
      );

        // Filter non-empty groups, sort Today first
        const filteredGroups = grouped.filter((group) => group.data.length > 0);
        filteredGroups.sort((a, b) => (a.title === 'Today' ? -1 : 1));

        // Sort items within groups (earliest first)
        filteredGroups.forEach((group) => {
        group.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        // Flatten into [header, item, item, ...]
        const flatData = filteredGroups.reduce((acc, group) => {
        acc.push({ type: 'header', title: group.title });
        acc.push(...group.data.map((item) => ({ type: 'item', ...item })));
        return acc;
        }, []);

      setData(flatData);
    } catch (error: unknown) {
        if (error.response?.status === 404){
            return
        } else{
            console.error('Error fetching reservations:', error);
            let message = 'Failed to fetch reservations';
            if (axios.isAxiosError(error) && error.response) {
              message = error.response.data.message || `Server error: ${error.response.status}`;
              Alert.alert('Error', message);
            }
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [navigation]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderReservation = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }

    const dateHKT = new Date(item.date);
    dateHKT.setUTCHours(dateHKT.getUTCHours());
    const endDateHKT = addMinutes(dateHKT, 15);
    const formattedDate = `${format(dateHKT, 'd MMM HH:mm')} - ${format(endDateHKT, 'HH:mm')}`;
    const route = routeDetails[item.route_id] || { start: 'Unknown', end: 'Unknown', fare:0 };

    return (
      <View style={styles.reservationItem}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[styles.reservationText, { fontWeight: 'bold' }]}>{route.start}</Text>
            <Text style={[styles.reservationText, { fontWeight: 'bold',  marginHorizontal: '5%' }]}>→</Text>
            <Text style={[styles.reservationText, { fontWeight: 'bold' }]}>{route.end}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: '3%'}}>
            <Text style={styles.reservationText}>{formattedDate}</Text>
            <Text style={styles.reservationText}>HK${route.fare*item.seat}</Text>
        </View>
        <Text style={styles.reservationText}>{item.seat} Seats</Text>
        <TouchableOpacity onPress={() => toggleExpand(item._id)}>
          <Ionicons
            name={expandedIds.has(item._id) ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#aaa"
            style={{alignSelf:'flex-end', paddingBottom: '3%'}}
          />
        </TouchableOpacity>
        {expandedIds.has(item._id) && (
          <View style={{borderTopColor:'#ccc', borderTopWidth: 1, paddingTop: '5%'}}>
            <Text style={[styles.reservationText, {fontWeight:'bold'}]}>Pick-up:</Text>
            <Text style={[styles.reservationText, { marginBottom: '3%' }]}>{item.pickup_location}</Text>
            <Text style={[styles.reservationText, {fontWeight:'bold'}]}>Drop-off:</Text>
            <Text style={styles.reservationText}>{item.dropoff_location}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reservation History</Text>
      {loading ? (
        <Text style={{paddingVertical: 10}}>Loading...</Text>
      ) : data.length === 0 ? (
        <Text style={{paddingVertical: 10}} >No reservations found.</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderReservation}
          keyExtractor={(item) => (item.type === 'header' ? item.title : item._id)}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <Pressable
        style={styles.reservationButton}
        onPress={() => router.push({
            pathname: '/reservation/two',
            params: {resetForm: 'true'}
        })}
      >
        <Text style={styles.reservationButtonText}>+ New Reservation</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  reservationItem: {
    padding: '5%',
    borderRadius: 10,
    backgroundColor: '#F6F6F6',
    marginVertical: '3%',
    marginHorizontal: 15,
  },
  reservationText: {
    fontSize: 14,
    marginBottom: 5,
  },
  reservationButton: {
    backgroundColor: '#FF4141',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  reservationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContainer: {
    paddingBottom: 20,
  },
});