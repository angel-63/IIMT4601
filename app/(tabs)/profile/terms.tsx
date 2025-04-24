import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';

const TermsAndConditions = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By using the Red Minibus app, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
        </Text>

        <Text style={styles.sectionTitle}>2. Service Description</Text>
        <Text style={styles.paragraph}>
          The Red Minibus app provides information about minibus routes, schedules, and fares operated by Chiu Luen Public Light Bus Co. Ltd. We strive to provide accurate information but do not guarantee its completeness or accuracy.
        </Text>

        <Text style={styles.sectionTitle}>3. User Conduct</Text>
        <Text style={styles.paragraph}>
          You agree to use the app for lawful purposes only and not to:
          - Attempt to reverse engineer or modify the app
          - Use the app to transmit harmful content
          - Interfere with the app's functionality
        </Text>

        <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content in the app, including text, graphics, and logos, is property of Chiu Luen Public Light Bus Co. Ltd. and protected by copyright laws.
        </Text>

        <Text style={styles.sectionTitle}>5. Privacy</Text>
        <Text style={styles.paragraph}>
          Your use of the app is subject to our Privacy Policy, which governs the collection and use of your personal information.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          Chiu Luen Public Light Bus Co. Ltd. shall not be liable for any damages arising from the use or inability to use the app, including inaccuracies in route or schedule information.
        </Text>

        <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>8. Governing Law</Text>
        <Text style={styles.paragraph}>
          These terms are governed by the laws of Hong Kong Special Administrative Region.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact</Text>
        <Text style={styles.paragraph}>
          For questions about these terms, contact us at support@redminibus.hk.
        </Text>
      </ScrollView>
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
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 12,
  },
});

export default TermsAndConditions;