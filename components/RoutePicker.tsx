import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE } from '@/config-api';

type Route = {
  route_id: string;
  name: string;
  start: string;
  end: string;
};

type RoutePickerProps = {
  onSelect?: (routeId: string) => void;
  selectedRoute?: string;
  context?: string;
};

const screenWidth = Dimensions.get('screen').width;

const RoutePicker = ({ onSelect, selectedRoute, context }: RoutePickerProps) => {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedRouteState, setSelectedRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const prevRouteRef = useRef<Route | null>(null); // Track the previous route

  const toggleModal = () => {
    console.log('Toggling modal, current state:', isModalVisible);
    setModalVisible(!isModalVisible);
  };

  const handleSelect = (route: Route) => {
    onSelect?.(route.route_id);
    setSelectedRoute(route);
    setModalVisible(false);
    console.log(`Selected route: ${route.name}, id: ${route.route_id}`);
  };

  // Fetch routes on mount
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const baseUrl = await API_BASE;
        console.log('Fetching routes from:', `${baseUrl}/routes`);
        const response = await fetch(`${baseUrl}/routes`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log('Routes fetched:', data);
        const fetchedRoutes = data.map((item: any) => ({
          route_id: item.route_id,
          name: item.route_name,
          start: item.start,
          end: item.end,
        }));
        setRoutes(fetchedRoutes);

        // Set initial selected route if provided
        if (selectedRoute) {
          const initialRoute = fetchedRoutes.find((r: Route) => r.route_id === selectedRoute);
          if (initialRoute) setSelectedRoute(initialRoute);
        }
      } catch (error) {
        console.error('API Error:', error);
        Alert.alert('Error', 'Failed to load routes. Please try again.', [
          { text: 'Retry', onPress: () => fetchRoutes() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  // Update selected route when the prop changes
  useEffect(() => {
    if (selectedRoute && routes.length > 0) {
      const matchingRoute = routes.find((r: Route) => r.route_id === selectedRoute);
      if (matchingRoute && matchingRoute.route_id !== selectedRouteState?.route_id) {
        prevRouteRef.current = selectedRouteState; // Store the previous route
        setSelectedRoute(matchingRoute);
      }
    }
  }, [selectedRoute, routes]);

  // Determine the route to display, avoiding "Select Route" during transitions
  const currentRoute = selectedRoute && routes.length > 0
    ? routes.find((r: Route) => r.route_id === selectedRoute)
    : null;
  const displayRoute = currentRoute || selectedRouteState || prevRouteRef.current;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {context === 'reservation' && (
          <Pressable
            onPress={() => router.push('/(tabs)/reservation')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back-circle-sharp" color="#FF4141" size={20} />
          </Pressable>
        )}
        <TouchableOpacity style={styles.button} onPress={toggleModal}>
          <View style={styles.buttonContent}>
            {displayRoute ? (
              <>
                <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
                  {displayRoute.start}
                </Text>
                <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>→</Text>
                <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
                  {displayRoute.end}
                </Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Select Route</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible && !isLoading}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Route</Text>
            <ScrollView style={styles.routeList}>
              {routes.map((item) => (
                <TouchableOpacity
                  key={item.route_id}
                  style={styles.option}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={styles.optionText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.start}
                    </Text>
                    <Text style={[styles.optionText, { fontWeight: 'bold' }]}>→</Text>
                    <Text
                      style={styles.optionText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.end}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth * 0.8,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 3,
    zIndex: 20,
    padding: 5,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 6,
    zIndex: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    paddingHorizontal: 3,
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    marginHorizontal: 1,
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.95,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 8 },
    elevation: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  routeList: {
    maxHeight: 300,
  },
  option: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginHorizontal: 3,
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default RoutePicker;