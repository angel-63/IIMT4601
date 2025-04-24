import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface LocationPickerProps {
  value: string;
  label: string;
  routeId?: string;
  disabled?: boolean;
}

const LocationPicker = ({ value, label, routeId, disabled }: LocationPickerProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (disabled) return;
    router.push({
      pathname: '/reservation/routeStops',
      params: { label: label, 
        route_id: routeId },
    });
  };

  return (
    <View>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.locationButton,
          { opacity: pressed && !disabled ? 0.5 : disabled ? 0.5 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>{value || 'Stops'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
    locationButton:{
        backgroundColor: "#FFA5A5",
        textAlign:'center',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
    },
    buttonText:{
        textAlign:'center',
        justifyContent: 'center',
        alignContent: 'center',
        fontSize: 12, 
        maxWidth: 222,
    }
})

export default LocationPicker;