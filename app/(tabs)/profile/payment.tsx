import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../../context/auth'; // Adjust path as needed

const BACKEND_URL = 'http://localhost:3001';
const MINIBUS_ARRIVAL_TIME = new Date('2025-04-23T07:00:00');

export default function CardRegistrationScreen() {
  const [number, setNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCardRegistered, setIsCardRegistered] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const { userId, fetchUserData } = useAuth();

  // Fetch existing card info on mount
  useEffect(() => {
    const fetchCardInfo = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${BACKEND_URL}/user/${userId}`);
        const userData = response.data.user;
        if (userData.cardInfo) {
          const { number: storedNumber, expiryDate: storedExpiryDate, cardholderName: storedCardholderName } = userData.cardInfo;
          setNumber(storedNumber ? `**** **** **** ${storedNumber.slice(-4)}` : '');
          setExpiryDate(storedExpiryDate || '');
          setCardholderName(storedCardholderName || '');
          setIsCardRegistered(true);
        }
      } catch (error) {
        console.error('Error fetching card info:', error);
        Alert.alert('Error', 'Failed to load card info.');
      }
    };
    fetchCardInfo();
  }, [userId]);

  const validateLuhn = (cardNum: string) => {
    const digits = cardNum.replace(/\D/g, '').split('').map(Number);
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const mockVerifyCard = async (details: {
    number: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }) => {
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      setTimeout(() => {
        const isValidLuhn = validateLuhn(details.number);
        if (!isValidLuhn) {
          resolve({ success: false, message: 'Invalid card number (Luhn check failed)' });
          return;
        }

        const [month, year] = details.expiryDate.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (
          year < currentYear ||
          (year === currentYear && month < currentMonth) ||
          month > 12
        ) {
          resolve({ success: false, message: 'Card is expired or invalid expiry date' });
          return;
        }

        if (!/^\d{3}$/.test(details.cvv)) {
          resolve({ success: false, message: 'Invalid CVV' });
          return;
        }

        resolve({ success: true, message: 'Card verified successfully' });
      }, 2000);
    });
  };

  const mockEncryptCardDetails = (details: {
    number: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }) => {
    const data = JSON.stringify(details);
    const encoded = btoa(data);
    console.log('Mock encrypted card details:', encoded);
    return encoded;
  };

  const validateCardDetails = () => {
    const cardNumberRegex = /^\d{16}$/;
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3}$/;
    const nameRegex = /^[a-zA-Z\s]{2,}$/;

    const cleanedNumber = number.replace(/\s/g, '');
    if (!cardNumberRegex.test(cleanedNumber)) {
      Alert.alert('Error', 'Card number must be 16 digits.');
      return false;
    }
    if (!expiryDateRegex.test(expiryDate)) {
      Alert.alert('Error', 'Expiry date must be in MM/YY format.');
      return false;
    }
    if (!cvvRegex.test(cvv)) {
      Alert.alert('Error', 'CVV must be 3 digits.');
      return false;
    }
    if (!nameRegex.test(cardholderName)) {
      Alert.alert('Error', 'Cardholder name must be at least 2 characters.');
      return false;
    }
    return true;
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const formatted = digits
      .match(/.{1,4}/g)
      ?.join(' ')
      .substring(0, 19) || '';
    setNumber(formatted);
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 3) {
      setExpiryDate(`${digits.substring(0, 2)}/${digits.substring(2, 4)}`);
    } else {
      setExpiryDate(digits);
    }
  };

  const handleRegisterCard = async () => {
    if (!validateCardDetails()) return;

    setIsSubmitting(true);

    const cardInfo = { number: number.replace(/\s/g, ''), expiryDate, cvv, cardholderName };
    const verificationResult = await mockVerifyCard(cardInfo);

    if (!verificationResult.success) {
      setIsSubmitting(false);
      Alert.alert('Verification Failed', verificationResult.message);
      return;
    }

    try {
      const encryptedDetails = mockEncryptCardDetails(cardInfo);
      await axios.post(`${BACKEND_URL}/user/${userId}/payment`, { cardInfo });
      await fetchUserData();
      setIsCardRegistered(true);
      setIsEditing(false); // Exit edit mode after saving
      setIsSubmitting(false);
      Alert.alert(
        'Success',
        `Card ${isEditing ? 'updated' : 'registered'} successfully. Payment will be scheduled 15 minutes before minibus arrival.`
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error updating card info:', error);
      Alert.alert('Error', 'Failed to update card info on the server.');
    }
  };

  const handleEditCard = () => {
    // Clear fields to allow entering new card details
    setNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setIsEditing(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: !isSubmitting && (!isCardRegistered || isEditing) ? '#fff' : '#e0e0e0' },
          ]}
          value={number}
          onChangeText={formatCardNumber}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={19}
          editable={!isSubmitting && (!isCardRegistered || isEditing)}
        />

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Expiry Date (MM/YY)</Text>
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                { backgroundColor: !isSubmitting && (!isCardRegistered || isEditing) ? '#fff' : '#e0e0e0' },
              ]}
              value={expiryDate}
              onChangeText={formatExpiryDate}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
              editable={!isSubmitting && (!isCardRegistered || isEditing)}
            />
          </View>

          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                { backgroundColor: !isSubmitting && (!isCardRegistered || isEditing) ? '#fff' : '#e0e0e0' },
              ]}
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 3))}
              placeholder="123"
              keyboardType="numeric"
              maxLength={3}
              editable={!isSubmitting && (!isCardRegistered || isEditing)}
              secureTextEntry
            />
          </View>
        </View>

        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: !isSubmitting && (!isCardRegistered || isEditing) ? '#fff' : '#e0e0e0' },
          ]}
          value={cardholderName}
          onChangeText={setCardholderName}
          placeholder="John Doe"
          editable={!isSubmitting && (!isCardRegistered || isEditing)}
        />
      </View>

      {isCardRegistered && !isEditing ? (
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleEditCard}
        >
          <Text style={styles.editButtonText}>Update Card Information</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.registerButton, isSubmitting && styles.registerButtonDisabled]}
          onPress={handleRegisterCard}
          disabled={isSubmitting}
        >
          <Text style={styles.registerButtonText}>
            {isSubmitting ? 'Verifying...' : isEditing ? 'Save Changes' : 'Register Card'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          This is a demonstration app. No actual payment will be processed.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff', // Default background
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  halfInput: {
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#FF8888',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successText: {
    fontSize: 16,
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});