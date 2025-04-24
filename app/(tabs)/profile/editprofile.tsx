import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/auth';
import axios from 'axios';
import { handlePhoneInput, validatePhoneNumber } from '../../../components/phoneNumberHandler';

const BACKEND_URL = 'http://localhost:3001'; // Use localhost since frontend and backend are on the same machine

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, userId, fetchUserData } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  // Validate email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate passwords
  const isValidPassword = (password: string) => {
    return password.length >= 8 || password.length === 0; // Allow empty new password
  };

  // Verify old password
  const verifyOldPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/login`, {
        email: user?.email,
        password,
      });
      return response.data.success;
    } catch (error) {
      console.error('Error verifying old password:', error);
      return false;
    }
  };

  // Handle save
  const handleSave = useCallback(async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (!validatePhoneNumber(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number (e.g., +852 1234 5678, +1 (123) 456-7890).');
      return;
    }
    if (newPassword && !oldPassword) {
      Alert.alert('Error', 'Please enter your old password to change your password.');
      return;
    }
    if (!isValidPassword(newPassword)) {
      Alert.alert('Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword && oldPassword) {
      const isOldPasswordValid = await verifyOldPassword(oldPassword);
      if (!isOldPasswordValid) {
        Alert.alert('Error', 'Old password is incorrect.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const updateData: any = { name, email, phone };
      if (newPassword) {
        updateData.password = newPassword;
      }

      const response = await axios.put(`${BACKEND_URL}/user/${userId}`, updateData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      // Refresh user data in AuthContext
      await fetchUserData();

      Alert.alert('Success', 'Changes saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [name, email, phone, oldPassword, newPassword, userId, fetchUserData, navigation, user]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(text) => handlePhoneInput(text, setPhone)}
                placeholder="+852 1234 5678 or +1 (123) 456-7890"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Old Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter old password"
                secureTextEntry={!showOldPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowOldPassword(!showOldPassword)}
              >
                <Ionicons
                  name={showOldPassword ? 'eye-off' : 'eye'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password (optional)</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E0E0E0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  saveButton: {
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#FF8888',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;