/**
 Contributors
 Kevin Song: 2 hours
 Emma Reid: 2 hours
 Rachel Huiqi: 0.5 hours
 */

import Footer from "@/components/Footer";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import RidePost from "../components/RidePost";
import ContactCard from "../components/contactCard";

// Main screen
export default function RSVP() {
  // Get ride ID from route params
  const route = useRoute();
  const { rideId } = route.params as { rideId: string };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{
          backgroundColor: "#181818",
          paddingVertical: 50,
          paddingHorizontal: 10,
        }}
      >
        <Text style={styles.title}>Ride Details</Text>
        <View>
          <RidePost
            name="Kevin Song"
            destination="BNA Airport (United Airlines)"
            departureDate={new Date()}
            departureTime={new Date()}
            currentPeople={2}
            maxPeople={4}
          />

          <ContactCard
            firstName="Kevin"
            lastName="Song"
            phoneNum={1234567890}
            email="kevin.song@vanderbilt.edu"
          />
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#e7e7e7",
    paddingBottom: 20,
    paddingTop: 28,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    color: "#333",
  },
  buttonWrapper: {
    marginTop: 16,
    alignItems: "center",
    paddingHorizontal: 0,
  },
});
