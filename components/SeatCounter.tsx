import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, TextInput, KeyboardAvoidingView } from 'react-native';
// import CounterInput from 'react-native-counter-input';

interface SeatCounterProps {
    value: number;
    min?: number;
    max?: number;
    onValueChange: (value: number) => void;
  }

const SeatCounter = ({value, min=1, max=19, onValueChange}: SeatCounterProps) => {
    const adjust = (amount: number) => 
      onValueChange(Math.max(min, Math.min(max, value + amount)));
  
    const onChangeNumber = (text: string) => {
      const num = parseInt(text, 10);
      if (!isNaN(num)) onValueChange(Math.max(min, Math.min(max, num)));
    };

    return(

        // !! need to fix keyboard view !! now blocking to shwo seat number
            <KeyboardAvoidingView behavior='padding'>
                <View style={{flexDirection:'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Pressable 
                    onPress={() => adjust(-1)}
                    style={({pressed}) => [styles.counterButton, styles.minusButton, {backgroundColor: value==min ? '#B9B9B9': '#FFA5A5'}, {opacity: pressed ? 0.5 : 1}]}>
                        <Text style={[{color:'black'}, styles.buttonText]}>-</Text>
                    </Pressable>

                    {/* <Text style={styles.seatValue}>{seat}</Text> */}


                    <TextInput
                    style={[styles.seatValue]}
                    value={String(value)}
                    onChangeText={onChangeNumber}
                    // onFocus={() => setIsFocused(true)}
                    // onBlur={handleBlur}
                    // keyboardType='numeric'
                    maxLength={2}
                    selectTextOnFocus
                    returnKeyType='done'
                    editable={false}
                    />

                    <Pressable 
                    onPress={() => adjust(1)}
                    style={({pressed}) => [styles.counterButton, styles.addButton, {backgroundColor: value==max ? '#B9B9B9': '#FF4141'}, {opacity: pressed ? 0.5 : 1}]}>
                        <Text style={[{color:'white'}, styles.buttonText]}>+</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>

    );
};

const styles = StyleSheet.create({
    // seatCounter:{
    //     shadowOpacity: 0,
    //     height: 20,
    //     width: 120,
    //     fontWeight: '100'
    // },
    counterButton:{
        // paddingVertical: 12,
        // paddingHorizontal: 7,
        textAlign:'center',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    minusButton:{
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    addButton:{
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    buttonText:{
        textAlign:'center',
        justifyContent: 'center',
        alignContent: 'center',
    },
    seatValue:{
        borderTopColor: '#A9A9A9',
        borderBottomColor: '#A9A9A9',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        textAlign:'center',
        justifyContent: 'center',
        alignContent: 'center',
        padding: 10,
        width: 40
    }
});

export default SeatCounter;