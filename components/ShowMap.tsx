import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Callout, Polyline, Region } from 'react-native-maps';
import { LatLng, Marker, UrlTile, AnimatedRegion, Animated } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';

interface MapProps {
    stops: Stop[];
    initialRegion?: Region;
    initialSelectedId?: string;
}

interface Stop {
    latitude: number;
    longitude: number;
    name: string;
    stop_id: string;
}  

// // Hard-coded data
// const defaultStops: Stop[] = [
// {
//     latitude: 22.32,
//     longitude: 114.17,
//     name: "Tung Choi St",
//     stop_id: "STOP_001"
// },
// {
//     latitude: 22.345,
//     longitude: 114.19,
//     name: "Stop 2",
//     stop_id: "STOP_002"
// },
// {
//     latitude: 22.346, 
//     longitude: 114.193,
//     name: "Stop 3",
//     stop_id: "STOP_003"
// }
// ]

const ShowMap = ( { stops ,
     initialRegion = {latitude: stops[0]?.latitude, // || stop nearest to gps location
        longitude: stops[0]?.longitude,  // || stop nearest to gps location
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
        },
      initialSelectedId = stops[0].stop_id }: MapProps) => {
    // Track selected stopID for display update
    // const [selectedStopId, setSelectedStopId] = useState('');
    const [selectedStopId, setSelectedStopId] = useState(initialSelectedId);
    const [routeCoords, setRouteCoordinates] =  useState<Array<{ latitude: number; longitude: number }>>([]); // coords to draw polyline
    const [isLoadingRoute, setIsLoadingRoute] = useState(true);
    const mapRef = useRef<MapView>(null);
    // console.log("selectedStopId: ", {selectedStopId})

    // Update map region according to selected stopID
    // const [region, setRegion] = useState<Region>(initialRegion || {
    //     latitude: stops[0]?.latitude,   // || stop nearest to gps location
    //     longitude: stops[0]?.longitude,  // || stop nearest to gps location
    //     latitudeDelta: 0.008,
    //     longitudeDelta: 0.008,
    // });

    const markerRef = useRef<Marker>(null)


    // Fetch route between stops using OSRM (Single API call to handle multiple waypoints)
    const fetchRoute = async () => {
        try {
            setIsLoadingRoute(true);
            
            // 1. Convert all stops to "lon,lat" strings
            const coordinates = stops
                .map(stop => `${stop.longitude},${stop.latitude}`)
                .join(';');
        
            // 2. Single API request for full route
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
            );

            const data = await response.json();
            // console.log(`Response: ${JSON.stringify(data)}`)
        
            // 3. Extract coordinates from response
            const routeCoords = data.routes[0].geometry.coordinates.map(coordinate => ({
                latitude: coordinate[1],
                longitude: coordinate[0]
            }));
            // console.log(`Route polyline coords: ${JSON.stringify(routeCoords)}`)
        
            setRouteCoordinates(routeCoords);

        } catch (error) {
        console.error('Routing error:', error);
        } finally {
            setIsLoadingRoute(false);
        }
    };

    // Initial callout
    useEffect(() => {
        // Show callout after a small delay when component mounts
        const timer = setTimeout(() => {
            if (markerRef.current) {
                markerRef.current.showCallout();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Fetch route coordinates to draw polyline
    useEffect(() => {
        fetchRoute();
    }, [stops]);

    // API to get route info
    // useEffect(() => {
        
    // })
    
    
    return (
    <View style={styles.container}>
        {!isLoadingRoute? (
            <MapView 
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                zoomEnabled={true}
            >
                {/* add OSM to tile layer */}
                <UrlTile
                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {stops.map((stop) => (

                    <Marker
                        key={stop.stop_id}
                        ref={stop.stop_id === selectedStopId ? markerRef : null}
                        coordinate={{
                            latitude: stop.latitude, 
                            longitude: stop.longitude
                        }}
                        title={stop.name}
                        // can change selected bus stop by pressing the pin
                        onPress={() => {
                            // animateToRegion(newRegion, 1000);
                            setSelectedStopId(stop.stop_id);
                            // setRegion({
                            mapRef.current?.animateToRegion({
                                longitude: stop.longitude,
                                latitude: stop.latitude,
                                latitudeDelta: 0.008,
                                longitudeDelta: 0.008,
                            });
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
                        strokeColors={[
                        'rgb(48,101,246)'
                        ]}
                        strokeWidth={4}
                        lineCap='round'
                    />
                )}
            </MapView>
        ):(
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#3065F6" />
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default ShowMap;