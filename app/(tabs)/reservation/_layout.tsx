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
        }}
      />
      <Stack.Screen
        name="two"
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
        }}
      />
      <Stack.Screen
        name="paymentSucess"
        options={{
          title: 'Payment Successful',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="routeStops"
        options={{
          title: 'Select Stop',
          headerShown: true,
        }}
      />
    </Stack>
  );
}