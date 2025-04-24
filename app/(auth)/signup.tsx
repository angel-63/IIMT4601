import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/auth';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { handlePhoneInput, validatePhoneNumber } from '../../components/phoneNumberHandler';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!name || !phone) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }
    if (!validatePhoneNumber(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number (e.g., +852 1234 5678, +1 (123) 456-7890).');
      return;
    }
    try {
      await signUp(email, password, name, phone);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create account');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create an account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="User Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number (e.g., +852 1234 5678)"
        value={phone}
        onChangeText={(text) => handlePhoneInput(text, setPhone)}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By creating an account or signing you agree to our{' '}
        <Text style={styles.termsLink}>Terms and Conditions</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#E53935',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  termsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  termsLink: {
    color: '#E53935',
    textDecorationLine: 'underline',
  },
});