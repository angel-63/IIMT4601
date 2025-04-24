import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Pressable, Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import RoutePicker from '@/components/RoutePicker';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/auth';
import { setupNotifications } from '../../components/notificationHandler';

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
  const { isAuthenticated, userId } = useAuth();

  // Call hooks before any conditional logic
  useEffect(() => {
    if (userId) {
      setupNotifications(userId);
    }
  }, [userId]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    // Use setTimeout to ensure navigation happens after hooks
    setTimeout(() => {
      navigation.navigate('(auth)/login');
    }, 0);
    return null; // Return null to avoid rendering tabs
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <TabBarIcon name="bus" color={color} />,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="reservation"
        options={{
          title: 'Reservation',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}