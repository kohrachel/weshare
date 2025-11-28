/**
 Contributors
 Emma Reid: 6 hours
 Kevin Song: 7 hours
 Rachel Huiqi: 4 hours
 */

import Footer from "@/components/Footer";
import { RidesContext } from "@/contexts/RidesContext";
import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import Input from "../components/Input";
import SingleRidePost from "../components/SingleRidePost";
import { RideDataType, RideWithCreatorName } from "./rsvp";

const debounce = (callback: (...args: any[]) => void, wait: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: any[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

export default function FeedPage() {
  const { rides, setRides } = useContext(RidesContext);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searches, setSearches] = useState<string[]>([]);
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

  // Debounce search input
  useEffect(() => {
    const debouncedSetSearch = debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, 300);

    debouncedSetSearch(searchQuery);

    return () => {
      // Cleanup will be handled by the debounce function
    };
  }, [searchQuery]);

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

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        for (const rideDoc of ridesSnapshot.docs) {
          const ride = rideDoc.data() as RideDataType;

          const rideDate = ride.departs.toDate();

          // 2. Check if the ride is older than 7 days
          if (rideDate < sevenDaysAgo) {
            try {
              // 3. Delete the document from Firestore
              await deleteDoc(doc(db, "rides", rideDoc.id));
              console.log(`Deleted expired ride: ${rideDoc.id}`);
            } catch (err) {
              console.error("Error deleting expired ride:", err);
            }
            // 4. Skip adding this ride to the local 'ridesData' array
            continue;
          }

          if (rideDoc.id === undefined) {
            return;
          }

          if (!ride.departs) continue;

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
        //const now = new Date();

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
    let updatedSearches: string[] = searches;

    if (searches.includes(searchQuery)) {
      updatedSearches = searches.filter((s) => s !== searchQuery);
    } else {
      if (searchQuery !== "") {
        updatedSearches = [...searches, searchQuery];
      }
    }

    // Need searches and updatedSearches separate
    // because state is not updated fast enough
    setSearches(updatedSearches);

    try {
      const id = await SecureStore.getItemAsync("userid");
      const docRef = doc(db, "users", id);

      await setDoc(docRef, { searches: updatedSearches }, { merge: true });

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
    <View
      style={{
        flex: 1,
        backgroundColor: "#181818",
        paddingVertical: 50,
        paddingHorizontal: 20,
      }}
    >
      {/* Search Row */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        {/* Search Input */}
        <View style={{ flex: 1 }}>
          <Input
            ref={searchInputRef}
            defaultValue="Search destination, date/time, or creator"
            value={searchQuery}
            setValue={setSearchQuery}
            onPress={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Dropdown of saved searches */}
          {isFocused && searches?.length > 0 && (
            <View
              style={{
                position: "absolute",
                top: 60, // distance from the top of the input wrapper
                left: 0,
                right: 0,
                backgroundColor: "#222",
                padding: 10,
                borderRadius: 8,
                elevation: 10,
                zIndex: 999,
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

        {/* Bookmark button */}
        <TouchableOpacity
          onPress={onSave}
          style={{ position: "absolute", right: 10 }}
        >
          <Ionicons
            name={
              debouncedSearchQuery && searches.includes(debouncedSearchQuery)
                ? "bookmark"
                : "bookmark-outline"
            }
            size={24}
            color="#529053"
          />
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
        {filteredRides.map((ride) => {
          return <SingleRidePost key={ride.id} rideId={ride.id} />;
        })}
      </ScrollView>
      <FloatingActionButton />
      <Footer />
    </View>
  );
}
