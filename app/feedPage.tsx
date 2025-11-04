/**
 Contributors
 Emma Reid: 3 hours
 Kevin Song: 1 hour
 Rachel Huiqi: 3 hours
 */

import Footer from "@/components/Footer";
import { RidesContext } from "@/contexts/RidesContext";
import { db } from "@/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import SingleRidePost from "../components/SingleRidePost";
import { RideData, UserData } from "./rsvp";

export default function FeedPage() {
  const { rides, setRides } = useContext(RidesContext);
  const [loading, setLoading] = useState(true);

  // fetch rides from db and set in context
  useEffect(() => {
    const fetchRides = async () => {
      if (rides.length > 0) {
        setLoading(false);
        return;
      }

      try {
        const ridesSnapshot = await getDocs(collection(db, "rides"));
        const ridesData: RideData[] = [];

        for (const rideDoc of ridesSnapshot.docs) {
          const ride = rideDoc.data() as RideData;

          // Get the user document for the ride
          let userData: UserData | null = null;

          // TODO validate entries either here or in create ride
          // TODO only display rides whose time is not < curr time (keep them sorted somehow?)
          if (ride.creator) {
            try {
              const userSnap = await getDoc(doc(db, "users", ride.creator));
              if (userSnap.exists()) {
                userData = userSnap.data() as UserData;
              } else {
                console.warn(`User doc not found for creator ID`, ride.creator);
              }
            } catch (err) {
              console.error(`Error fetching user ${ride.creator}:`, err);
            }
          } else {
            console.warn("Ride is missing a creator field.");
          }

          if (rideDoc.id === undefined) {
            return;
          }

          ridesData.push({
            id: rideDoc.id,
            creator: userData?.name || "Inactive Account",
            destination: ride.destination || "Unknown Destination",
            date: ride.date,
            currPpl: ride.currPpl,
            maxPpl: ride.maxPpl,
            time: ride.time,
            ppl: ride.ppl,
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
  }, [setRides, rides.length]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#181818" }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
      >
        {rides.map((ride) => {
          return <SingleRidePost key={ride.id} rideId={ride.id} />;
        })}
      </ScrollView>
      <Footer />
    </View>
  );
}
