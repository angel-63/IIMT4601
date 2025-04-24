import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../context/auth';
import Toast from 'react-native-simple-toast';

export default function CreateProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();
  const { completeSignUp } = useAuth();

  const handleConfirm = () => {
    if (!name.trim()) {
      // Show error for empty name
      return;
    }
    
    // Save profile information
    // You might want to call an API here to update the user profile
    
    // Complete the sign-up process, which will set isAuthenticated to true
    // and redirect to the main app
    completeSignUp();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create your profile</Text>

      <View style={styles.profileImageContainer}>
        <View style={styles.profileImage}>
          {/* Placeholder for profile image */}
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        placeholder="example@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/YYYY"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <Text style={styles.label}>Phone number</Text>
      <View style={styles.phoneInputContainer}>
        <TextInput
          style={styles.countryCode}
          value="+852"
          editable={false}
        />
        <TextInput
          style={styles.phoneInput}
          placeholder="XXXX XXXX"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#E53935',
    padding: 8,
    borderRadius: 15,
  },
  cameraIcon: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  countryCode: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    width: 80,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
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
});