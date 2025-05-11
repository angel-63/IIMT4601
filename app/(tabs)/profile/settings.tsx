import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import axios from 'axios';
import { useAuth } from '../../../context/auth';
import { API_BASE } from '@/config-api';

const LOCATION_PERMISSION_KEY = '@location_permission';
const BACKEND_URL = API_BASE;

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reservationReminder, setReservationReminder] = useState(true);
  const [reservedSeatReminder, setReservedSeatReminder] = useState(false);
  const [allocatedShiftReminder, setAllocatedShiftReminder] = useState(true);
  const [reservedSeatReminderBeforeMinutes, setReservedSeatReminderBeforeMinutes] = useState('15');
  const { userId, fetchUserData, locationAccessEnabled, setLocationAccessEnabled } = useAuth();

  // Fetch user settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${BACKEND_URL}/user/${userId}`);
        const userData = response.data.user;
        if (userData.settings) {
          setDarkMode(userData.settings.darkMode ?? false);
          setNotificationsEnabled(userData.settings.notificationsEnabled ?? true);
          setReservationReminder(userData.settings.reservationReminder ?? true);
          setReservedSeatReminder(userData.settings.reservedSeatReminder ?? false);
          setAllocatedShiftReminder(userData.settings.allocatedShiftReminder ?? true);
          setReservedSeatReminderBeforeMinutes(userData.settings.reservedSeatReminderBeforeMinutes?.toString() ?? '15');
          setLocationAccessEnabled(userData.settings.locationAccessEnabled ?? false); // Sync with context
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        Alert.alert('Error', 'Failed to load user settings.');
      }
    };
    fetchSettings();
  }, [userId, setLocationAccessEnabled]);

  // Update settings on the backend
  const updateSettings = async (updatedSettings: {
    darkMode: boolean;
    locationAccessEnabled: boolean;
    notificationsEnabled: boolean;
    reservationReminder: boolean;
    reservedSeatReminder: boolean;
    allocatedShiftReminder: boolean;
    reservedSeatReminderBeforeMinutes: number;
  }) => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/user/${userId}/settings`, { settings: updatedSettings });
      await fetchUserData(); // Refresh user data
      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, updatedSettings.locationAccessEnabled.toString());
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings on the server.');
    }
  };

  const handleDarkModeToggle = (newValue: boolean) => {
    setDarkMode(newValue);
    updateSettings({
      darkMode: newValue,
      locationAccessEnabled,
      notificationsEnabled,
      reservationReminder,
      reservedSeatReminder,
      allocatedShiftReminder,
      reservedSeatReminderBeforeMinutes: parseInt(reservedSeatReminderBeforeMinutes),
    });
  };

  const handleLocationPermissionToggle = async () => {
    const newValue = !locationAccessEnabled;
    setLocationAccessEnabled(newValue);

    try {
      if (newValue) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to enable location-based features.',
            [{ text: 'OK', onPress: () => setLocationAccessEnabled(false) }]
          );
          await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, 'false');
          setLocationAccessEnabled(false);
          return;
        }
      }
      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, newValue.toString());
      updateSettings({
        darkMode,
        locationAccessEnabled: newValue,
        notificationsEnabled,
        reservationReminder,
        reservedSeatReminder,
        allocatedShiftReminder,
        reservedSeatReminderBeforeMinutes: parseInt(reservedSeatReminderBeforeMinutes),
      });
    } catch (error) {
      console.error('Failed to update location permission:', error);
      setLocationAccessEnabled(false);
      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, 'false');
    }
  };

  const handleNotificationsToggle = (newValue: boolean) => {
    setNotificationsEnabled(newValue);
    updateSettings({
      darkMode,
      locationAccessEnabled,
      notificationsEnabled: newValue,
      reservationReminder,
      reservedSeatReminder,
      allocatedShiftReminder,
      reservedSeatReminderBeforeMinutes: parseInt(reservedSeatReminderBeforeMinutes),
    });
  };

  const handleReservationReminderToggle = (newValue: boolean) => {
    setReservationReminder(newValue);
    updateSettings({
      darkMode,
      locationAccessEnabled,
      notificationsEnabled,
      reservationReminder: newValue,
      reservedSeatReminder,
      allocatedShiftReminder,
      reservedSeatReminderBeforeMinutes: parseInt(reservedSeatReminderBeforeMinutes),
    });
  };

  const handleReservedSeatReminderToggle = (newValue: boolean) => {
    setReservedSeatReminder(newValue);
    updateSettings({
      darkMode,
      locationAccessEnabled,
      notificationsEnabled,
      reservationReminder,
      reservedSeatReminder: newValue,
      allocatedShiftReminder,
      reservedSeatReminderBeforeMinutes: parseInt(reservedSeatReminderBeforeMinutes),
    });
  };

  const handleAllocatedShiftReminderToggle = (newValue: boolean) => {
    setAllocatedShiftReminder(newValue);
    updateSettings({
      darkMode,
      locationAccessEnabled,
      notificationsEnabled,
      reservationReminder,
      reservedSeatReminder,
      allocatedShiftReminder: newValue,
      reservedSeatReminderBeforeMinutes: parseInt(reservedSeatReminderBeforeMinutes),
    });
  };

  const handleReminderMinutesChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    setReservedSeatReminderBeforeMinutes(numericValue);
    updateSettings({
      darkMode,
      locationAccessEnabled,
      notificationsEnabled,
      reservationReminder,
      reservedSeatReminder,
      allocatedShiftReminder,
      reservedSeatReminderBeforeMinutes: parseInt(numericValue) || 15,
    });
  };

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, darkMode ? styles.darkText : styles.lightText]}>Privacy</Text>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, darkMode ? styles.darkText : styles.lightText]}>Allow Location Access</Text>
          <Switch
            value={locationAccessEnabled}
            onValueChange={handleLocationPermissionToggle}
            trackColor={{ false: '#767577', true: '#FF4444' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, darkMode ? styles.darkText : styles.lightText]}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, darkMode ? styles.darkText : styles.lightText]}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#767577', true: '#FF4444' }}
          />
        </View>

        {notificationsEnabled && (
          <>
            <View style={styles.settingItem}>
              <Text style={[styles.settingText, darkMode ? styles.darkText : styles.lightText]}>Reservation Reminder (15 min before)</Text>
              <Switch
                value={reservationReminder}
                onValueChange={handleReservationReminderToggle}
                trackColor={{ false: '#767577', true: '#FF4444' }}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingText, darkMode ? styles.darkText : styles.lightText]}>Reserved Seat Reminder</Text>
              <Switch
                value={reservedSeatReminder}
                onValueChange={handleReservedSeatReminderToggle}
                trackColor={{ false: '#767577', true: '#FF4444' }}
              />
            </View>

            {reservedSeatReminder && (
              <View style={styles.minutesInputContainer}>
                <Text style={[styles.settingText, darkMode ? styles.darkText : styles.lightText]}>Notify me</Text>
                <TextInput
                  style={[styles.minutesInput, darkMode ? styles.darkInput : styles.lightInput]}
                  value={reservedSeatReminderBeforeMinutes}
                  onChangeText={handleReminderMinutesChange}
                  keyboardType="numeric"
                  placeholder="15"
                  maxLength={3}
                />
                <Text style={[styles.settingText, darkMode ? styles.darkText : styles.lightText]}>minutes before arrival</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    fontSize: 16,
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  minutesInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  minutesInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  lightInput: {
    borderColor: '#767577',
    backgroundColor: '#fff',
    color: '#000',
  },
  darkInput: {
    borderColor: '#555',
    backgroundColor: '#333',
    color: '#fff',
  },
});

export default SettingsScreen;