import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function ProfileLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          headerShown: true, // Enable header for the index screen
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }}
      />
      <Stack.Screen
        name="mytrips"
        options={{
          title: 'My Trips',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="editprofile"
        options={{
          title: 'Edit Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          title: 'Help & Support',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Payment',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: 'Terms & Conditions',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="policies"
        options={{
          title: 'Policies',
          headerShown: true,
        }}
      />
    </Stack>
  );
}