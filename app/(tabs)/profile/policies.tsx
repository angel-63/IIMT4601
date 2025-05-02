import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';

const Policies = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Policies</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Reservation Policies</Text>
        <Text style={styles.subSectionTitle}>1. Definitions</Text>
        <Text style={styles.paragraph}>
          {"\u2022"} <Text style={styles.boldText}>Reservation</Text>: A booking made through the app for a specific route, date, time, seat, pick-up location, and drop-off location.{"\n"}
          {"\u2022"} <Text style={styles.boldText}>Desired Period</Text>: The preferred 15-minute time slot selected by the user when making a reservation.{"\n"}
          {"\u2022"} <Text style={styles.boldText}>Assigned Shift</Text>: The confirmed departure time for your reservation, which may be slightly later than the desired period due to scheduling.{"\n"}
          {"\u2022"} <Text style={styles.boldText}>Pick-up Station</Text>: The designated location where you board the minibus for your reserved trip.{"\n"}
          {"\u2022"} <Text style={styles.boldText}>Drop-off Station</Text>: The designated location where you disembark at the end of your reserved trip.{"\n"}
          {"\u2022"} <Text style={styles.boldText}>Reservation Available Time</Text>: The window during which reservations can be made, starting 30 minutes from the current time and extending up to 7 days in the future.
        </Text>

        <Text style={styles.subSectionTitle}>2. Reservation Rules</Text>
        <Text style={styles.paragraph}>
          1. <Text style={styles.boldText}>Reservation Time Slot</Text>:{"\n"}
          {"   \u2022"} Each reservation is based on a 15-minute desired period selected by the user.{"\n"}
          {"   \u2022"} Example: If you choose a desired period of 10:00 AM, your reservation will be scheduled within or close to the 10:00–10:15 AM window.{"\n"}
          {"\n"}
          2. <Text style={styles.boldText}>Assigned Shift Timing</Text>:{"\n"}
          {"   \u2022"} Your assigned shift may be slightly later than your desired period due to operational scheduling.{"\n"}
          {"   \u2022"} Example: A 10:00 AM desired period may result in an assigned shift of 10:05 AM or 10:20 AM, depending on availability.{"\n"}
          {"   \u2022"} You will be notified of the assigned shift time upon reservation confirmation.{"\n"}
          {"\n"}
          3. <Text style={styles.boldText}>Cancellation Policy</Text>:{"\n"}
          {"   \u2022"} Reservations can be canceled free of charge up to 15 minutes before the assigned shift’s arrival time at the pick-up station.{"\n"}
          {"   \u2022"} After this 15-minute window (i.e., once the assigned shift is 15 minutes or less away), cancellations are no longer permitted, and the full fare will be charged.{"\n"}
          {"   \u2022"} Example: If your assigned shift is 10:00 AM, you can cancel without penalty until 9:45 AM.{"\n"}
          {"\n"}
          4. <Text style={styles.boldText}>Automatic Payment</Text>:{"\n"}
          {"   \u2022"} Payment for the reservation is automatically processed 15 minutes before the assigned shift’s arrival time.{"\n"}
          {"   \u2022"} Ensure your payment method is valid and has sufficient funds to avoid reservation cancellation.{"\n"}
          {"   \u2022"} Example: For a 10:00 AM assigned shift, payment will be charged at 9:45 AM.{"\n"}
          {"\n"}
          5. <Text style={styles.boldText}>Reservation Availability</Text>:{"\n"}
          {"   \u2022"} Reservations can be made starting 30 minutes from the current time and up to 7 days in the future.{"\n"}
          {"   \u2022"} Example: At 12:00 PM on April 25, you can book a trip as early as 12:30 PM on April 25 or as late as 11:59 PM on May 2.
        </Text>

        <Text style={styles.subSectionTitle}>3. Additional Reservation Policies</Text>
        <Text style={styles.paragraph}>
          1. <Text style={styles.boldText}>No-Show Policy</Text>:{"\n"}
          {"   \u2022"} If you fail to arrive at the pick-up station by the assigned shift’s departure time, your reservation will be marked as a no-show, and no refunds will be issued.{"\n"}
          {"   \u2022"} To avoid no-show charges, cancel your reservation before the 15-minute cancellation window closes.{"\n"}
          {"\n"}
          2. <Text style={styles.boldText}>Modification Policy</Text>:{"\n"}
          {"   \u2022"} Reservations can be modified (e.g., changing the time, seat, or pick-up/drop-off locations) up to 15 minutes before the assigned shift’s arrival time, subject to availability.{"\n"}
          {"   \u2022"} Modifications may result in a fare adjustment based on the new reservation details.{"\n"}
          {"\n"}
          3. <Text style={styles.boldText}>Seat Allocation</Text>:{"\n"}
          {"   \u2022"} Seats are assigned on a first-come, first-served basis during the reservation process.{"\n"}
          {"   \u2022"} If your desired number of seats is unavailable, you will be prompted to select a different time or route.{"\n"}
          {"\n"}
          4. <Text style={styles.boldText}>Payment Failures</Text>:{"\n"}
          {"   \u2022"} If the automatic payment fails (e.g., due to insufficient funds or an invalid payment method), your reservation may be canceled, and you will be notified immediately.{"\n"}
          {"   \u2022"} To reinstate a canceled reservation, you must update your payment method and rebook, subject to availability.{"\n"}
          {"\n"}
          5. <Text style={styles.boldText}>Route and Stop Validation</Text>:{"\n"}
          {"   \u2022"} All pick-up and drop-off locations must be valid stops for the selected route.{"\n"}
          {"   \u2022"} The app will prevent reservations with incompatible pick-up or drop-off locations.{"\n"}
          {"\n"}
          6. <Text style={styles.boldText}>Refund Policy</Text>:{"\n"}
          {"   \u2022"} Refunds are issued only for cancellations made before the 15-minute cancellation window.{"\n"}
          {"   \u2022"} Refunds will be processed to the original payment method within 5–7 business days.{"\n"}
          {"   \u2022"} No refunds are provided for no-shows, late cancellations, or completed trips.{"\n"}
          {"\n"}
          7. <Text style={styles.boldText}>Service Disruptions</Text>:{"\n"}
          {"   \u2022"} In the event of unforeseen circumstances (e.g., weather, traffic, or operational issues), the assigned shift time or route may be adjusted.{"\n"}
          {"   \u2022"} You will be notified of any changes via the app, and options for rescheduling or cancellation will be provided if applicable.
        </Text>

        <Text style={styles.sectionTitle}>4. Contact</Text>
        <Text style={styles.paragraph}>
          For questions about these terms or reservation policies, contact us at support@chiuluen.hk.
        </Text>

        <Text style={styles.paragraph}>
          *Last Updated: April 25, 2025*
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
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 12,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default Policies;