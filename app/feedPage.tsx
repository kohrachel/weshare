/**
 Contributors
 Emma Reid: 3 hours
 Kevin Song: 4 hours
 Rachel Huiqi: 3 hours
 */

import Footer from "@/components/Footer";
import Input from "@/components/Input";
import { db } from "@/firebaseConfig";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import RidePost from "../components/RidePost";

export default function FeedPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const ridesSnapshot = await getDocs(collection(db, "rides"));
        const ridesData: any[] = [];

        for (const rideDoc of ridesSnapshot.docs) {
          const ride = rideDoc.data();

          // Get the user document for the ride
          let userData: DocumentData = {};

          // TODO validate entries either here or in create ride
          // TODO only display rides whose time is not < curr time (keep them sorted somehow?)
          if (!ride.creator) console.warn("Ride is missing a creator field.");

          try {
            const userRef = doc(db, "users", ride.creator);
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()) {
              console.warn(
                `User doc not found for creator ID: ${ride.creator}`
              );
            }

            userData = userSnapshot.data() as DocumentData;
          } catch (err) {
            console.error(`Error fetching user ${ride.creator}:`, err);
          }

          ridesData.push({
            id: rideDoc.id,
            name: userData.name || "Inactive Account",
            destination: ride.destination || "Unknown Destination",
            departureDate: ride.date.toDate() ?? new Date(),
            departureTime: ride.time.toDate() ?? new Date(),
            currentPeople: ride.currPpl,
            maxPeople: ride.maxPpl,
          });
        }

        setRides(ridesData);
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    // TODO: fix styles for padding
    <View
      style={{
        flex: 1,
        backgroundColor: "#181818",
        paddingVertical: 50,
        paddingHorizontal: 20,
      }}
    >
      <Input defaultValue="Search rides by destination (e.g. BNA)" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
      >
        {rides.map((ride) => (
          <RidePost
            key={ride.id}
            name={ride.name}
            destination={ride.destination}
            departureDate={ride.departureDate}
            departureTime={ride.departureTime}
            currentPeople={ride.currentPeople}
            maxPeople={ride.maxPeople}
          />
        ))}
      </ScrollView>
      <Footer />
    </View>
  );
}
