import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const LocationPicker = ({ value, onChange,}: LocationPickerProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '../stops',
    //   params: { 
    //     onSelect: (selectedValue: string) => onChange(selectedValue),
    //     type: label.toLowerCase()
    //   }
    });
  };

  return (
    <View>
      <Pressable 
        onPress={handlePress}
        style={({ pressed }) => [
          styles.locationButton,
          { opacity: pressed ? 0.5 : 1 }
        ]}
      >
        <Text style={styles.buttonText}>{value || "Stops"}</Text>
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
        borderRadius: 8
    },
    buttonText:{
        textAlign:'center',
        justifyContent: 'center',
        alignContent: 'center',
    }
})

export default LocationPicker;