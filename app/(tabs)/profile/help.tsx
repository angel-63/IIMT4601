import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { router, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const HelpScreen = () => {
  const router = useRouter();
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const handleContactPress = () => {
    Linking.openURL('mailto:vanwongg@connect.hku.hk');
  };

  const handleCallPress = () => {
    Linking.openURL('tel:+85212345678');
  };

  const handleTermsPress = () => {
    router.push('../../profile/terms');
  };

  const handlePoliciesPress = () => {
    router.push('../../profile/policies');
  };

  const toggleAboutExpanded = () => {
    setAboutExpanded(!aboutExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.helpItem} onPress={handleContactPress}>
          <Text style={styles.helpItemText}>Contact Us via Email</Text>
          <Text style={styles.helpItemSubtext}>vanwongg@connect.hku.hk</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpItem} onPress={handleCallPress}>
          <Text style={styles.helpItemText}>Call Customer Service</Text>
          <Text style={styles.helpItemSubtext}>+852 1234 5678</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>About</Text>
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.helpItem} onPress={handleTermsPress}>
          <Text style={styles.helpItemText}>Terms & Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpItem} onPress={handlePoliciesPress}>
          <Text style={styles.helpItemText}>Policies</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sectionTitleContainer} onPress={toggleAboutExpanded}>
          <Text style={styles.sectionTitle}>About Chiu Luen Minibus App</Text>
          <Ionicons
            name={aboutExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666"
            style={styles.expandIcon}
          />
        </TouchableOpacity>
        {aboutExpanded && (
          <Text style={styles.aboutText}>
            The Chiu Luen Minibus App is designed to enhance your travel experience with Chiu Luen Public Light Bus Company Limited, a long-standing operator of non-franchised minibus routes in Hong Kong since 1997. This app allows you to reserve for seats, update your profile, and access real-time information about routes primarily serving areas like Mong Kok, Kwun Tong, and To Kwa Wan. For support, contact us via the app or visit our Help and Support page for assistance with your commuting needs.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  helpItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  helpItemText: {
    fontSize: 16,
  },
  helpItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandIcon: {
    marginRight: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
});

export default HelpScreen;