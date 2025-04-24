import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Redirect, Tabs, useLocalSearchParams } from 'expo-router';
import { Pressable, Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import RoutePicker from '@/components/RoutePicker';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/auth';
import { useRouter } from 'expo-router';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { route_name } = useLocalSearchParams<{ route_name: string }>(); // Access route_name param

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <TabBarIcon name="bus" color={color} />,
        }}
      />

      <Tabs.Screen
        name="reservation/two"
        options={{
          title: 'Reservation',
          headerTitle: () => (
            <RoutePicker
              onSelect={(routeId) => navigation.setParams({ selectedRouteId: routeId })}
            />
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerTitleContainerStyle: {
            left: Platform.OS === 'ios' ? 0 : 16,
            right: Platform.OS === 'ios' ? 0 : 16,
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: false, // Always hide the tab navigator's header for Profile tab
        }}
      />

      <Tabs.Screen
        name="reservation/confirmReservation"
        options={{
          href: null,
          title: 'Confirm Reservation',
        }}
      />

      <Tabs.Screen
        name="reservation/paymentSuccess"
        options={{
          href: null,
          title: 'Payment Success',
        }}
      />

      <Tabs.Screen
        name="routeInfo/routeDetail"
        options={{
          href: null,
          title: 'Reservation',
          tabBarIcon: ({ color }) => <TabBarIcon name="bus" color={color} />,
        }}
      />
    </Tabs>
  );
}