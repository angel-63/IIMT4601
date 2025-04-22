import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Dimensions, Pressable, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Route = {
    id: string;
    name: string;
};

type RoutePickerProps = {
    onSelect?: (routeId: string) => void; // pass only route_id
};

const screenWidth = Dimensions.get('screen').width;
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
const API_BASE = 'http://192.168.1.78:3001'; // Use backend port

const RoutePicker = ({ onSelect }: RoutePickerProps) => {
    // const routes: Route[] = [
    //     { id: '1', name: 'Route A' },
    //     { id: '2', name: 'Route B' },
    //     { id: '3', name: 'Route C' },
    // ];

    const navigation = useNavigation();
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const routesRef = useRef<Route[]>([]); // Persistent storage

    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
      };
    
    const handleSelect = (route: Route) => {
        onSelect?.(route.id);
        setSelectedRoute(route);
        setDropdownVisible(false);
        console.log(`selected new route: ${route.name}, id: ${route.id}`)
    };

    useEffect(() => {
        const fetchRoutes = async () => {
          try {
            const response = await fetch(`${API_BASE}/route`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            routesRef.current = data.map((item: any) => ({
              id: item.route_id,
              name: item.route_name
            }));
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
                <Pressable onPress={() => navigation.goBack()} style={{marginLeft: 25}}>
                    <Ionicons 
                        name="arrow-back-circle-sharp" 
                        color="#FF4141" 
                        size={25} 
                    />
                </Pressable>     
                <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
                    {/* <FontAwesome name="arrows-h" color="#000" size={24} /> */}
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Loading routes...' : 
                        selectedRoute?.name || "Select Route"}
                    </Text>
                </TouchableOpacity>     
            </View>
            
            {isDropdownVisible && !isLoading && (
                <View style={styles.dropdown}>
                <FlatList>
                    <TouchableOpacity>
                            <Text style={styles.optionText}>
                                Mong Kok 
                                <FontAwesome name="arrows-h" color="#000" size={24} />
                                 Kowloon Bay
                            </Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                            <Text style={styles.optionText}>
                                Mong Kok 
                                <FontAwesome name="arrows-h" color="#000" size={24} />
                                 Kwun Tong
                            </Text>
                    </TouchableOpacity>
                </FlatList>
                {/* <FlatList
                    data={routesRef.current}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.option}
                        onPress={() => handleSelect(item)}
                    >
                        <Text style={styles.optionText}>{item.name}</Text>
                    </TouchableOpacity>
                    )}
                /> */}
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
    header:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button:{
        width: screenWidth - 25,
        alignItems: 'center',
        backgroundColor: 'white',
        right: 25,
        zIndex: -1
    },
    buttonText: {
        textAlign: "center",
        color: '#333',
        fontWeight: 'bold',
    },
    dropdown: {
        width: screenWidth + 25,
        position: 'absolute',
        top: 20,
        right: '1%',
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
        marginTop: '3%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    option: {
        paddingVertical: 10,
        width: screenWidth * 1.1,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        alignItems: 'center',
        justifyContent: 'center',
        left: '-2%',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
});

export default RoutePicker;