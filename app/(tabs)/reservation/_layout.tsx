import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function ReservationLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Reservation',
          headerShown: true, // Enable header for the index screen
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="(tabs)/reservation/two"
        options={{
          title: 'Reservation',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="confirmReservation"
        options={{
          title: 'Confirmation',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal'
        }}
      />
      <Stack.Screen
        name="paymentSucess"
        options={{
          title: 'Payment Successful',
          headerShown: true,
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="(tabs)/reservation/routeStops"
        options={{
          title: 'Select Stop',
          headerShown: true,
        }}
      />
    </Stack>
  );
}