/**
 Contributors
 Emma Reid: 3 hours
 */

import { db } from "@/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import RidePost from "../components/RidePost";

export default function RidesPage() {
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
          let userData: any = {};

          // TODO validate entries either here or in create ride
          // TODO only display rides whose time is not < curr time (keep them sorted somehow?)
          if (ride.creator) {
            try {
              const userRef = doc(db, "users", ride.creator);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                userData = userSnap.data();
              } else {
                console.warn(
                  `User doc not found for creator ID: ${ride.creator}`,
                );
              }
            } catch (err) {
              console.error(`Error fetching user ${ride.creator}:`, err);
            }
          } else {
            console.warn("Ride is missing a creator field.");
          }

          ridesData.push({
            id: rideDoc.id,
            firstName: userData.name || "Inactive Account",
            destination: ride.destination,
            departureDate: ride.time ? new Date(ride.time) : new Date(),
            departureTime: ride.time ? new Date(ride.time) : new Date(),
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
    <ScrollView
      style={{ padding: 16, backgroundColor: "#181818", paddingVertical: 50 }}
    >
      {rides.map((ride) => (
        <RidePost
          key={ride.id}
          firstName={ride.firstName}
          lastName=""
          destination={ride.destination}
          departureDate={ride.departureDate}
          departureTime={ride.departureTime}
          currentPeople={ride.currentPeople}
          maxPeople={ride.maxPeople}
        />
      ))}
    </ScrollView>
  );
}
