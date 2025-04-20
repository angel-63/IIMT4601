import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import RoutePicker from '@/components/RoutePicker';
import { useNavigation } from '@react-navigation/native';

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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      
      <Tabs.Screen
        name="reservation/two"
        options={{
          // title: 'Reservation',
          headerTitle: () => <RoutePicker
            onSelect={(routeId) => navigation.setParams({ selectedRouteId: routeId })}
            />,
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerTitleContainerStyle: {
            left: Platform.OS === 'ios' ? 0 : 16,
            right: Platform.OS === 'ios' ? 0 : 16,
          },
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
          title: 'Schedule',
          tabBarIcon: ({ color }) => <TabBarIcon name="bus" color={color} />,
        }}
      />

    </Tabs>
  );
}
