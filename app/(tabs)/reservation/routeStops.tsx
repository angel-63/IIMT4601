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
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  'two': {
    selectedStop?: string;
    label?: string;
    route_id?: string;
    pickUp?: string;
  };
  '(tabs)/reservation/routeStops': {
    route_id: string;
    label: string;
    pickUp?: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Params = {
  route_id: string;
  label: string;
  pickUp?: string;
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
  const navigation = useNavigation<NavigationProp>();
  const params = useLocalSearchParams<Params>();
  const { route_id, label, pickUp } = params;

  const handleStopSelect = (stop: Stop) => {
    navigation.navigate('two', {
      selectedStop: stop.name,
      label,
      route_id,
      pickUp,
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Select ${label} Stop`,
      headerLeft: () => (
        <Pressable
          onPress={() =>
            navigation.navigate('two', {
              selectedStop: 'Stops',
              label,
              route_id,
              pickUp,
            })
          }
          style={{ marginLeft: 15 }}
        >
          <Ionicons
            name="arrow-back-circle-sharp"
            color="#FF4444"
            size={25}
          />
        </Pressable>
      ),
    });
  }, [navigation, label, route_id, pickUp]);

  useEffect(() => {
    const fetchStops = async () => {
      setLoading(true);
      try {
        const baseUrl = await API_BASE;
        const routeRes = await fetch(`${baseUrl}/routes/${route_id}`);
        if (!routeRes.ok) throw new Error('Failed to fetch route');
        const routeData = await routeRes.json();
        const stopIds: string[] = routeData.stops.map((s: any) => s.stop_id);

        const stopsData: Stop[] = [];
        for (const id of stopIds) {
          const resp = await fetch(`${baseUrl}/stops/${id}`);
          if (resp.ok) {
            const stopData: Stop = await resp.json();
            stopsData.push(stopData);
          }
        }

        setStops(stopsData);
      } catch (error) {
        console.error(error);
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStops();
  }, [route_id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#FF4444"
          style={styles.loading}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.stopList}>
        {stops.length > 0 ? (
          stops.map((stop, idx) => {
            const pickUpIndex = pickUp
              ? stops.findIndex((s) => s.name === pickUp)
              : -1;
            const isDisabled =
              label === 'Drop-off' &&
              pickUpIndex >= 0 &&
              idx <= pickUpIndex;

            return (
              <TouchableOpacity
                key={stop.stop_id}
                onPress={() => handleStopSelect(stop)}
                disabled={isDisabled}
                style={[
                  styles.stopItem,
                  isDisabled && styles.disabledStop,
                ]}
              >
                <View style={styles.stopNumberContainer}>
                  <Text
                    style={[
                      styles.stopNumber,
                      isDisabled && styles.disabledText,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </View>
                <View style={styles.stopDetails}>
                  <Text
                    style={[
                      styles.stopName,
                      isDisabled && styles.disabledText,
                    ]}
                  >
                    {stop.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No stops available</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stopList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  stopNumberContainer: {
    width:  30,
    height:  30,
    borderRadius:  15,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    fontSize:  16,
  },
  noDataText: {
    textAlign: 'center',
    marginTop:  20,
    color: '#666',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledStop: {
    backgroundColor: '#f0f0f0',
  },
  disabledText: {
    color: '#999',
  },
});
