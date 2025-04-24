import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { API_BASE } from '@/config-api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type Route = {
    route_id: string;
    name: string;
    start: string;
    end: string;
    stops: { 
        stop_id: string; 
        order: string; 
        arrival_times: string[] 
    }[];
  };

type Stop = {
  stop_id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function RouteStopsScreen() {
    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const {route_id, label} = params as {route_id: string; label: string};

    const fetchStopById = async (stopId: string): Promise<Stop | null> => {
        try {
        const baseUrl = await API_BASE;
        const response = await fetch(`${baseUrl}/stops/${stopId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch stop ${stopId}`);
        }
        const stopData: Stop = await response.json();
        return stopData;
        } catch (error) {
        console.error(`Error fetching stop ${stopId}:`, error);
        return null;
        }
    };

    useEffect(() => {
        navigation.setOptions({
        headerTitle: `Select ${label} Stop`,
        headerLeft: () => (
            <Pressable onPress={() => navigation.navigate("reservation/two")} style={{ marginLeft: 15 }}>
            <Ionicons name="arrow-back-circle-sharp" color="#FF4141" size={25} />
            </Pressable>
        ),
        })
    }, [navigation, label]);


    useEffect(() => {
        const fetchStops = async () => {
        setLoading(true);
        try {
            const baseUrl = await API_BASE;

            // Fetch route details
            const routeResponse = await fetch(`${baseUrl}/routes/${route_id}`);
            if (!routeResponse.ok) throw new Error('Failed to fetch route');
            const routeData: Route = await routeResponse.json();

            // Get stop IDs
            const stopIds = routeData.stops.map((s) => s.stop_id);

            // Fetch stop details
            const stopsData: Stop[] = [];
            for (const stopId of stopIds) {
            const stop = await fetchStopById(stopId);
            if (stop) {
                stopsData.push(stop);
            }
            }
            
            setStops(stopsData);

        } catch (error) {
            console.error('Error fetching stops:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    fetchStops();
  }, [route_id]);

    // routeStops.tsx
    const handleStopSelect = (stop: Stop) => {
        console.log('Navigating with stop:', stop.name);
        navigation.navigate("reservation/two", { selectedStop: stop.name, label });
    };

    const renderStopItem = (stop: Stop, index: number) => (
        <TouchableOpacity
        key={stop.stop_id}
        style={styles.stopItem}
        onPress={() => handleStopSelect(stop)}
        activeOpacity={0.8}
        >
        <View style={styles.stopNumberContainer}>
            <Text style={styles.stopNumber}>{index + 1}</Text>
        </View>
        <View style={styles.stopDetails}>
            <Text style={styles.stopName}>{stop.name}</Text>
        </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
        {/* <View style={styles.header}>
            <Text style={styles.headerText}>Select {label} Stop</Text>
        </View> */}
        {loading ? (
            <ActivityIndicator size="large" color="#e05d44" style={styles.loading} />
        ) : (
            <ScrollView style={styles.stopList}>
            {stops.length > 0 ? (
                stops.map(renderStopItem)
            ) : (
                <Text style={styles.noDataText}>No stops available</Text>
            )}
            </ScrollView>
        )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
},
header: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
},
headerText: {
    fontSize: 18,
    fontWeight: 'bold',
},
stopList: {
    flex: 1,
    backgroundColor: 'white',
},
stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
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
},
stopAction: {
    padding: 5,
},
loading: {
    marginTop: 20,
},
noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
},
});