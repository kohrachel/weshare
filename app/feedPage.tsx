/**
 Contributors
 Emma Reid: 6 hours
 Kevin Song: 7 hours
 Rachel Huiqi: 4 hours
 */

import Footer from "@/components/Footer";
import { RidesContext } from "@/contexts/RidesContext";
import { db } from "@/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs, setDoc, arrayUnion } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, View, TouchableOpacity, Text } from "react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import Input from "../components/Input";
import SingleRidePost from "../components/SingleRidePost";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { RideDataType } from "./rsvp";

export default function FeedPage() {
  const { rides, setRides } = useContext(RidesContext);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searches, setSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
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

  const fetchInfo = async () => {
    try {
      const id = await SecureStore.getItemAsync("userid");
      const userDoc = await getDoc(doc(db, "users", id));
      setSearches(userDoc.data()?.searches || []);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // fetch rides from db and set in context
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const ridesSnapshot = await getDocs(collection(db, "rides"));
        const ridesData: RideDataType[] = [];

        for (const rideDoc of ridesSnapshot.docs) {
          const ride = rideDoc.data() as RideDataType;

          if (rideDoc.id === undefined) {
            return;
          }

          ridesData.push({
            id: rideDoc.id,
            creatorId: ride.creatorId,
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

  const onSave = async () => {
    let updatedSearches: string[];

    if (searches.includes(searchQuery)) {
      updatedSearches = searches.filter(s => s !== searchQuery);
    } else {
      updatedSearches = [...searches, searchQuery];
    }

    // Need searches and updatedSearches separate
    // because state is not updated fast enough
    setSearches(updatedSearches);

    try {
      const id = await SecureStore.getItemAsync("userid");
      const docRef = doc(db, "users", id);

      await setDoc(
        docRef,
        { searches: updatedSearches },
        { merge: true }
      );

      fetchInfo();
    } catch (error) {
      console.error("Error saving search: ", error);
      alert("Search not saved, please try again. " + error);
    }
  };

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

      return (
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
    <View
      style={{
        flex: 1,
        backgroundColor: "#181818",
        paddingVertical: 50,
        paddingHorizontal: 20,
      }}
    >

      {/* Search Row */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>

        {/* Search Input */}
        <View style={{ flex: 1 }}>
          <Input
            ref={searchInputRef}
            defaultValue="Search rides by destination, date/time, or creator"
            value={searchQuery}
            setValue={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Dropdown of saved searches */}
          {isFocused && searches?.length > 0 && (
            <View
              style={{
                backgroundColor: "#222",
                padding: 10,
                borderRadius: 8,
                marginTop: 4,
                elevation: 5,
              }}
            >
              {searches.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setSearchQuery(s);
                    setIsFocused(false);
                  }}
                  style={{
                    paddingVertical: 8,
                    borderBottomColor: "#333",
                    borderBottomWidth: i !== searches.length - 1 ? 1 : 0,
                  }}
                >
                  <Text style={{ color: "white" }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Heart button */}
        <TouchableOpacity
          onPress={onSave}
          style={{ marginLeft: 10, padding: 10, alignSelf: "flex-start" }}
        >
          <Ionicons name="heart" size={28} color="white" color="#529053" />
        </TouchableOpacity>
      </View>

      {/* Ride list */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 80,
          flexDirection: "column",
          gap: 16,
        }}
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
