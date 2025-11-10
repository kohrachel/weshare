/**
 Contributors
 Emma Reid: 3 hours
 Kevin Song: 7 hours
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
import FloatingActionButton from "../components/FloatingActionButton";

export default function FeedPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const ridesSnapshot = await getDocs(collection(db, "rides"));
        const ridesData: any[] = [];

        for (const rideDoc of ridesSnapshot.docs) {
          const ride = rideDoc.data();

          // Get the user document for the ride
          //let userData: DocumentData = {};

          // TODO validate entries either here or in create ride
          // TODO only display rides whose time is not < curr time (keep them sorted somehow?)
          if (!ride.creator || typeof ride.creator !== "string") {
            console.warn(
              `Skipping ride ${rideDoc.id} — invalid creator field:`,
              ride.creator,
            );
            continue; // Skip this ride
          }

          let userData: DocumentData = {};

          try {
            const userRef = doc(db, "users", ride.creator.trim());
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
              console.warn(
                `User doc not found for creator ID: ${ride.creator}`,
              );
            } else {
              userData = userSnapshot.data() as DocumentData;
            }
          } catch (err) {
            console.error(`Error fetching user ${ride.creator}:`, err);
          }

          ridesData.push({
            id: rideDoc.id,
            name: userData.name || "Inactive Account",
            destination: ride.destination || "Unknown Destination",
            departureDate: ride.date?.toDate?.() ?? new Date(),
            departureTime: ride.time?.toDate?.() ?? new Date(),
            currentPeople: ride.currPpl,
            maxPeople: ride.maxPpl,
          });
        }

        // Exclude past rides and sort chronologically
        const now = new Date();

        // Keep only rides whose departure date/time is in the future
        const upcomingRides = ridesData.filter((ride) => {
          const departure = new Date(
            ride.departureDate.getFullYear(),
            ride.departureDate.getMonth(),
            ride.departureDate.getDate(),
            ride.departureTime.getHours(),
            ride.departureTime.getMinutes(),
          );
          return departure >= now;
        });

        // Sort upcoming rides by date and time (earliest first)
        upcomingRides.sort((a, b) => {
          const dateA = new Date(
            a.departureDate.getFullYear(),
            a.departureDate.getMonth(),
            a.departureDate.getDate(),
            a.departureTime.getHours(),
            a.departureTime.getMinutes(),
          );
          const dateB = new Date(
            b.departureDate.getFullYear(),
            b.departureDate.getMonth(),
            b.departureDate.getDate(),
            b.departureTime.getHours(),
            b.departureTime.getMinutes(),
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
  }, []);

  // Filtering logic
  const filteredRides = rides.filter((ride) => {
    const queryWords = searchQuery.toLowerCase().split(" ").filter(Boolean);

    return queryWords.every((word) => {
      const name = ride.name?.toLowerCase() || "";
      const destination = ride.destination?.toLowerCase() || "";
      const formattedDate =
        ride.departureDate?.toLocaleDateString().toLowerCase() || "";
      const formattedTime = ride.departureTime
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
        paddingVertical: 50,
        paddingHorizontal: 20,
      }}
    >
      <Input
        defaultValue="Search rides by user name, destination, or date/time"
        value={searchQuery}
        setValue={setSearchQuery}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
      >
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RidePost
              key={ride.id}
              name={ride.name}
              destination={ride.destination}
              departureDate={ride.departureDate}
              departureTime={ride.departureTime}
              currentPeople={ride.currentPeople}
              maxPeople={ride.maxPeople}
            />
          ))
        ) : (
          // 🆕 Added “no results” visual feedback (optional)
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <ActivityIndicator size="small" color="#888" />
          </View>
        )}
      </ScrollView>
      <FloatingActionButton/>
      <Footer />
    </View>
  );
}
