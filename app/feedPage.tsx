/**
 Contributors
 Emma Reid: 3 hours
 Kevin Song: 7 hours
 Rachel Huiqi: 3 hours
 */

import Footer from "@/components/Footer";
import { RidesContext } from "@/contexts/RidesContext";
import { db } from "@/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import Input from "../components/Input";
import SingleRidePost from "../components/SingleRidePost";
import { RideData, UserData } from "./rsvp";

export default function FeedPage() {
  const { rides, setRides } = useContext(RidesContext);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // fetch rides from db and set in context
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const ridesSnapshot = await getDocs(collection(db, "rides"));
        const ridesData: RideData[] = [];

        for (const rideDoc of ridesSnapshot.docs) {
          const ride = rideDoc.data() as RideData;

          // Get the user document for the ride
          let userData: UserData | null = null;

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
            gender: ride.gender,
            meetLoc: ride.meetLoc,
          });
        }

        // Exclude past rides and sort chronologically
        const now = new Date();

        // Keep only rides whose departure date/time is in the future
        const upcomingRides = ridesData.filter((ride) => {
          const departure = new Date(
            ride.date.toDate().getFullYear(),
            ride.date.toDate().getMonth(),
            ride.date.toDate().getDate(),
            ride.time.toDate().getHours(),
            ride.time.toDate().getMinutes(),
          );
          return departure >= now;
        });

        // Sort upcoming rides by date and time (earliest first)
        upcomingRides.sort((a, b) => {
          const dateA = new Date(
            a.date.toDate().getFullYear(),
            a.date.toDate().getMonth(),
            a.date.toDate().getDate(),
            a.time.toDate().getHours(),
            a.time.toDate().getMinutes(),
          );
          const dateB = new Date(
            b.date.toDate().getFullYear(),
            b.date.toDate().getMonth(),
            b.date.toDate().getDate(),
            b.time.toDate().getHours(),
            b.time.toDate().getMinutes(),
          );

          return dateA.getTime() - dateB.getTime();
        });

        setRides(upcomingRides);
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [setRides, rides.length]);

  // Filtering logic
  const filteredRides = rides.filter((ride) => {
    const queryWords = searchQuery.toLowerCase().split(" ").filter(Boolean);

    return queryWords.every((word) => {
      const name = ride.creator?.toLowerCase() || "";
      const destination = ride.destination?.toLowerCase() || "";
      const formattedDate =
        ride.date?.toDate()?.toLocaleDateString().toLowerCase() || "";
      const formattedTime = ride.time
        ?.toDate()
        ?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        .toLowerCase();

      return (
        name.includes(word) ||
        destination.includes(word) ||
        formattedDate.includes(word) ||
        formattedTime.includes(word)
      );
    });
  });

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
        paddingHorizontal: 30,
        paddingTop: 50,
        paddingBottom: 50,
        width: "100%",
      }}
    >
      <Input
        defaultValue="Search rides by user name, destination, or date/time"
        value={searchQuery}
        setValue={setSearchQuery}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {rides.map((ride) => {
          return <SingleRidePost key={ride.id} rideId={ride.id} />;
        })}
      </ScrollView>
      <FloatingActionButton />
      <Footer />
    </View>
  );
}
