/**
 Contributors
 Emma Reid: 3 hours
 Kevin Song: 7 hours
 Rachel Huiqi: 4 hours
 */

import Footer from "@/components/Footer";
import { RidesContext } from "@/contexts/RidesContext";
import { db } from "@/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, View } from "react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import Input from "../components/Input";
import SingleRidePost from "../components/SingleRidePost";
import { RideDataType, RideWithCreatorName } from "./rsvp";

export default function FeedPage() {
  const { rides, setRides } = useContext(RidesContext);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams();

  // Focus search input when navigating with focusSearch param
  useEffect(() => {
    if (params.focusSearch === "true") {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [params.focusSearch]);

  // fetch rides from db and set in context
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersLookup: { [userId: string]: string } = {};
        usersSnapshot.forEach((doc) => {
          usersLookup[doc.id] = doc.data().name || "Unknown";
        });

        const ridesSnapshot = await getDocs(collection(db, "rides"));
        const ridesData: RideWithCreatorName[] = [];

        for (const rideDoc of ridesSnapshot.docs) {
          const ride = rideDoc.data() as RideDataType;

          if (rideDoc.id === undefined) {
            return;
          }

          ridesData.push({
            id: rideDoc.id,
            creatorId: ride.creatorId,
            creatorName: usersLookup[ride.creatorId] || "Unknown user",
            destination: ride.destination || "Unknown Destination",
            departs: ride.departs,
            numRsvpedUsers: ride.numRsvpedUsers,
            maxPpl: ride.maxPpl,
            rsvpedUserIds: ride.rsvpedUserIds,
            gender: ride.gender,
            departsFrom: ride.departsFrom,
            hasLuggageSpace: ride.hasLuggageSpace,
            isRoundTrip: ride.isRoundTrip,
            returns: ride.returns,
          });
        }

        // Exclude past rides and sort chronologically
        const now = new Date();

        // Keep only rides whose departure date/time is in the future
        const upcomingRides = ridesData.filter((ride) => {
          return ride.departs.toDate() >= now;
        });

        // Sort upcoming rides by date and time (earliest first)
        upcomingRides.sort((a, b) => {
          return a.departs.toDate().getTime() - b.departs.toDate().getTime();
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
      const destination = ride.destination?.toLowerCase() || "";
      const formattedDate =
        ride.departs?.toDate()?.toLocaleDateString().toLowerCase() || "";
      const formattedTime =
        ride.departs
          ?.toDate()
          ?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          .toLowerCase() || "";
      const creatorName = ride.creatorName?.toLowerCase() || "";

      return (
        destination.includes(word) ||
        formattedDate.includes(word) ||
        formattedTime.includes(word) ||
        creatorName.includes(word)
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
        paddingVertical: 50,
        paddingHorizontal: 20,
      }}
    >
      <Input
        ref={searchInputRef}
        defaultValue="Search rides by destination, date/time, or creator"
        value={searchQuery}
        setValue={setSearchQuery}
        style={{ marginBottom: 16 }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 80,
          flexDirection: "column",
          gap: 16,
        }}
      >
        {filteredRides.map((ride) => {
          return <SingleRidePost key={ride.id} rideId={ride.id} />;
        })}
      </ScrollView>
      <FloatingActionButton />
      <Footer />
    </View>
  );
}
