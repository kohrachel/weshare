/**
 Contributors
 Kevin Song: 2 hours
 Emma Reid: 2 hours
 Rachel Huiqi: 4 hours
 */

import Footer from "@/components/Footer";
import { RidesContext } from "@/contexts/RidesContext";
import { db } from "@/firebaseConfig";
import { useRoute } from "@react-navigation/native";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SingleRidePost from "../components/SingleRidePost";
import ContactCard from "../components/contactCard";

export type UserGenderType = "Male" | "Female" | "Other" | "Not set";

export type RideData = {
  id: string;
  creator: string;
  destination: string;
  date: Timestamp;
  time: Timestamp;
  currPpl: number;
  maxPpl: number;
  ppl: string[];
  gender: "Male" | "Female" | "Co-ed";
  meetLoc: string;
  luggage: boolean;
};

export type UserData = {
  name: string;
  phone: string;
  email: string;
  gender: UserGenderType;
};

const unknownUser: UserData = {
  name: "Unknown User",
  gender: "Not set",
  phone: "Unknown",
  email: "Unknown",
};

export default function RsvpRidePage() {
  const { setRides } = useContext(RidesContext);

  const [rideData, setRideData] = useState<RideData | null>(null);
  const [rsvpedUsers, setRsvpedUsers] = useState<UserData[]>([unknownUser]);

  const rideCreator = useMemo(() => rideData?.creator, [rideData]);

  // Get ride ID from route params
  const route = useRoute();
  let { rideId } = route.params as { rideId: string };

  // TODO: delete this eventually, it's just so you can still click on the RSVP button from the index page
  if (!rideId) {
    rideId = "DHbTvTZQQugk83PjwYup";
  }

  useEffect(() => {
    const fetchRideData = async () => {
      const rideDoc = doc(db, "rides", rideId);
      const rideData = await getDoc(rideDoc);

      if (!rideData.exists()) return;

      const ride = rideData.data() as RideData;

      const newRideData: RideData = {
        id: rideId,
        creator: ride.creator,
        destination: ride.destination,
        date: ride.date,
        time: ride.time,
        currPpl: ride.currPpl,
        maxPpl: ride.maxPpl,
        ppl: ride.ppl,
        gender: ride.gender,
        meetLoc: ride.meetLoc,
        luggage: ride.luggage,
      };

      setRideData(newRideData);
      setRides((prevRides) =>
        prevRides.map((ride) => (ride.id === rideId ? newRideData : ride)),
      );
    };
    fetchRideData();
  }, [rideId, setRides]);

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
        }),
      );
      setRsvpedUsers(rsvpedUsers);
    };
    fetchRsvpedUsers(rideData?.ppl || []);
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
    <View style={styles.container}>
      <SingleRidePost rideId={rideId} />
      <Text style={styles.subtitle}>
        In this ride:{" "}
        {rsvpedUsers.length !== 1
          ? `${rsvpedUsers.length} people`
          : `${rsvpedUsers.length} person`}
      </Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* TODO: replace with dynamic data */}
        {rsvpedUsers.map((user, index) => (
          <ContactCard
            key={index}
            name={user.name}
            phoneNum={user.phone}
            email={user.email}
            gender={user.gender}
          />
        ))}
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    paddingTop: 70,
    paddingBottom: 100,
    paddingHorizontal: 30,
  },
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
  subtitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#e7e7e7",
    paddingBottom: 10,
    paddingTop: 15,
    textAlign: "left",
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    gap: 16,
    flexDirection: "column",
  },
});
