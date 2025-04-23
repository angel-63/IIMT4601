import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Dimensions, Pressable, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE } from '@/app/config-api';

type Route = {
  route_id: string;
  name: string;
  start: string;
  end: string;
};

type RoutePickerProps = {
  onSelect?: (routeId: string) => void;
  context: 'reservation' | 'routeDetail';
};

const screenWidth = Dimensions.get('screen').width;

const RoutePicker = ({ onSelect }: RoutePickerProps) => {
  const navigation = useNavigation();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSelect = (route: Route) => {
    onSelect?.(route.route_id);
    setSelectedRoute(route);
    setDropdownVisible(false);
    console.log(`selected new route: ${route.name}, id: ${route.route_id}`);
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const baseUrl = await API_BASE;
        const response = await fetch(`${baseUrl}/routes`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const fetchedRoutes = data.map((item: any) => ({
          route_id: item.route_id,
          name: item.route_name,
          start: item.start,
          end: item.end,
        }));
        setRoutes(fetchedRoutes);
      } catch (error) {
        console.error('API Error:', error);
        Alert.alert('Error', 'Failed to load routes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginLeft: 25 }}>
          <Ionicons name="arrow-back-circle-sharp" color="#FF4141" size={25} />
        </Pressable>
        <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {selectedRoute ? (
              <>
                {/* <Text style={styles.buttonText}>{selectedRoute.start}</Text>
                <FontAwesome name="arrows-h" color="#000" size={20} />
                <Text style={styles.buttonText}>{selectedRoute.end}</Text> */}
                <Text style={styles.buttonText}>{selectedRoute.start} → {selectedRoute.end}</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Select Route</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {isDropdownVisible && !isLoading && (
        <View style={styles.dropdown}>
          <FlatList
            data={routes}
            keyExtractor={(item) => item.route_id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.optionText}>{item.start}</Text>
                  {/* <FontAwesome name="arrows-h" color="#000" size={20} /> */}
                  <FontAwesome name="arrow-right" color="#000" size={14} />
                  <Text style={styles.optionText}>{item.end}</Text>
                  {/* <Text style={styles.buttonText}>{item.start} → {item.end}</Text> */}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    position: 'relative',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: screenWidth - 25,
    alignItems: 'center',
    backgroundColor: 'white',
    right: 25,
    zIndex: -1,
  },
  buttonText: {
    textAlign: 'center',
    // alignItems: 'center',
    // justifyContent: 'center',
    color: '#333',
    fontWeight: 'bold',
    // width: 100,
    // marginHorizontal: '3%',
  },
  dropdown: {
    width: screenWidth + 25,
    position: 'absolute',
    top: 20,
    right: '1%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    marginTop: '3%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    paddingVertical: 10,
    width: screenWidth * 1.1,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    left: '-2%',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '3%',
    width: 100,
  },
});

export default RoutePicker;