import React, { useState } from 'react';
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

interface StopDetail {
  location: string;
  time: string;
}

interface TripItemProps {
  id: string;
  from: string;
  to: string;
  date: string;
  distance: string;
  duration: string;
  price: string;
  status: 'Reserved' | 'Completed' | 'Cancelled';
  stops: StopDetail[];
  expanded: boolean;
  onToggleExpand: (id: string) => void;
}

const TripItem: React.FC<TripItemProps> = ({
  id,
  from,
  to,
  date,
  distance,
  duration,
  price,
  status,
  stops,
  expanded,
  onToggleExpand,
}) => {
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
            <Text style={styles.arrow}>↔</Text>
            <Text style={styles.locationText}>{to}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        
        <Text style={styles.dateText}>{date}</Text>
        <View style={styles.tripDetails}>
          <Text style={styles.detailsText}>{distance} · {duration}</Text>
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
                <Text style={styles.stopTime}>{stop.time}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.expandIconContainer}>
          <Text style={[styles.expandIconText, expanded && styles.expandIconRotated]}>
            {expanded ? "▼" : "▲"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const MyTripsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedTrips, setExpandedTrips] = useState<string[]>(['today']);

  const toggleExpand = (tripId: string) => {
    setExpandedTrips(prev => 
      prev.includes(tripId)
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.content}>
        {/* Today Section */}
        <Text style={styles.sectionTitle}>Today</Text>
        <TripItem
          id="today"
          from="Mong Kok"
          to="Kowloon Bay"
          date="04 Apr 19:20"
          distance="5.2 km"
          duration="13 min"
          price="HK$20.00"
          status="Reserved"
          stops={[
            { location: "Mong Kok Rd", time: "19:20" },
            { location: "Lam Hing St.", time: "19:33" }
          ]}
          expanded={expandedTrips.includes('today')}
          onToggleExpand={toggleExpand}
        />

        {/* Past 3 days Section */}
        <Text style={styles.sectionTitle}>Past 3 days</Text>
        <TripItem
          id="past1"
          from="Mong Kok"
          to="Kowloon Bay"
          date="03 Apr 19:20"
          distance="5.2 km"
          duration="17 min"
          price="HK$20.00"
          status="Completed"
          stops={[
            { location: "Mong Kok Rd", time: "19:20" },
            { location: "Lam Hing St.", time: "19:37" }
          ]}
          expanded={expandedTrips.includes('past1')}
          onToggleExpand={toggleExpand}
        />
        <TripItem
          id="past2"
          from="Mong Kok"
          to="Kowloon Bay"
          date="02 Apr 18:49"
          distance="5.2 km"
          duration="15 min"
          price="HK$20.00"
          status="Cancelled"
          stops={[
            { location: "Mong Kok Rd", time: "18:49" },
            { location: "Lam Hing St.", time: "19:04" }
          ]}
          expanded={expandedTrips.includes('past2')}
          onToggleExpand={toggleExpand}
        />

        {/* Earlier Section */}
        <Text style={styles.sectionTitle}>Earlier</Text>
        <TripItem
          id="earlier1"
          from="Kwun Tong"
          to="Lok Ma Chau"
          date="17 Apr 09:21"
          distance="49.8 km"
          duration="1 hr 9 min"
          price="HK$25.00"
          status="Completed"
          stops={[
            { location: "Kwun Tong MTR", time: "09:21" },
            { location: "Lok Ma Chau Station", time: "10:30" }
          ]}
          expanded={expandedTrips.includes('earlier1')}
          onToggleExpand={toggleExpand}
        />
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#CC3333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
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
    marginTop: 8,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailsText: {
    color: '#666',
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
  receiptButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  receiptText: {
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#CC3333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  activeNavItem: {
    backgroundColor: '#AA2222',
  },
  navIcon: {
    fontSize: 24,
  },
  navText: {
    color: '#FFF',
    marginTop: 5,
  },
});

export default MyTripsScreen;