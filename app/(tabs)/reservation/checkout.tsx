import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function CheckoutScreen() {
  const orderNumber = `MIN-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successText}>Your minibus seat has been reserved</Text>
      </View>
      
      <View style={styles.receiptContainer}>
        <Text style={styles.receiptTitle}>Receipt</Text>
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Order Number:</Text>
          <Text style={styles.receiptValue}>{orderNumber}</Text>
        </View>
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Date:</Text>
          <Text style={styles.receiptValue}>{currentDate}</Text>
        </View>
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Payment Method:</Text>
          <Text style={styles.receiptValue}>Stripe Test Card</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Minibus Fare:</Text>
          <Text style={styles.receiptValue}>$15.00</Text>
        </View>
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Booking Fee:</Text>
          <Text style={styles.receiptValue}>$2.00</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.receiptRow}>
          <Text style={[styles.receiptLabel, styles.totalLabel]}>Total:</Text>
          <Text style={[styles.receiptValue, styles.totalValue]}>$17.00</Text>
        </View>
      </View>
      
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          This is a demo receipt. No actual payment was processed.
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('../../profile/mytrips')}
      >
        <Text style={styles.buttonText}>View My Trips</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('../schedule')}
      >
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    width: 80,
    height: 80,
    borderRadius: 40,
    textAlign: 'center',
    lineHeight: 80,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666',
  },
  receiptContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FAFAFA',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  receiptLabel: {
    fontSize: 16,
    color: '#666',
  },
  receiptValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
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
  button: {
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  secondaryButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});