/**
 Contributors
 Kevin Song: 2 hours
 Emma Reid: 2 hours
 Rachel Huiqi: 2.5 hours
 */

import Footer from "@/components/Footer";
import { db } from "@/firebaseConfig";
import { useRoute } from "@react-navigation/native";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RidePost from "../components/RidePost";
import ContactCard from "../components/contactCard";

type RideData = {
  creator: string;
  destination: string;
  date: Timestamp;
  time: Timestamp;
  rsvpedUsers: string[];
  currPpl: number;
  maxPpl: number;
};

type UserData = {
  name: string;
  phone: string;
  email: string;
  gender: string;
};

const unknownUser: UserData = {
  name: "Unknown User",
  gender: "Unknown",
  phone: "1234567890",
  email: "Unknown",
};

export default function RSVP() {
  const [rideData, setRideData] = useState<RideData | null>(null);
  const [rideCreator, setRideCreator] = useState<string | null>(null);
  const [rsvpedUsers, setRsvpedUsers] = useState<UserData[]>([unknownUser]);

  // Get ride ID from route params
  const route = useRoute();
  let { rideId } = route.params as { rideId: string };

  // TODO: delete this eventually, it's just so you can still click on the RSVP button from the index page
  if (!rideId) {
    console.warn("Deprecated: Accessing RSVP page from index.");
    rideId = "DHbTvTZQQugk83PjwYup";
  }

  useEffect(() => {
    const fetchRideData = async () => {
      const rideDoc = doc(db, "rides", rideId);
      const rideData = await getDoc(rideDoc);
      if (rideData.exists()) {
        const ride = rideData.data();
        setRideData({
          creator: ride.creator,
          destination: ride.destination,
          date: ride.date,
          time: ride.time,
          currPpl: ride.currPpl,
          maxPpl: ride.maxPpl,
          rsvpedUsers: ride.ppl,
        });
      } else {
        console.error("Ride data not found");
      }
    };
    fetchRideData();
  }, [rideId]);

  useEffect(() => {
    const fetchRsvpedUsers = async (rsvpedUserIds: string[]) => {
      if (!rideData) return;

      const rsvpedUsers = await Promise.all(
        rsvpedUserIds.map(async (userId) => {
          if (!userId || userId === "") return unknownUser;
          const userData = await getDoc(doc(db, "users", userId));
          if (!userData.exists()) return unknownUser;

          const user = userData.data();
          const { name, gender = "Not set", phone = "Not set", email } = user;

          return {
            name,
            gender,
            phone,
            email,
          };
        })
      );
      setRsvpedUsers(rsvpedUsers);
    };
    fetchRsvpedUsers(rideData?.rsvpedUsers || []);
  }, [rideData]);

  useEffect(() => {
    const fetchRideCreator = async () => {
      if (!rideData) return;
      const userId = doc(db, "users", rideData.creator);
      const userData = await getDoc(userId);
      if (userData.exists()) {
        setRideCreator(userData.data().name);
      }
    };
    fetchRideCreator();
  }, [rideData]);

  // Show loading indicator while ride data or ride creator are not loaded
  if (!rideData || !rideCreator) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#181818",
        paddingTop: 50,
        paddingBottom: 100,
        paddingHorizontal: 10,
      }}
    >
      <Text style={styles.title}>Ride Details</Text>
      <ScrollView style={{ flex: 1 }}>
        <View>
          <RidePost
            rideId={rideId}
            name={rideCreator}
            destination={rideData.destination}
            departureDate={rideData.date.toDate()}
            departureTime={rideData.time.toDate()}
            currentPeople={rideData.currPpl}
            maxPeople={rideData.maxPpl}
          />
        </View>
        {/* TODO: replace with dynamic data */}
        {rsvpedUsers.map((user, index) => (
          <ContactCard
            key={index}
            firstName={user.name}
            lastName={""}
            phone={user.phone}
            email={user.email}
          />
        ))}
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#181818",
  },
});
