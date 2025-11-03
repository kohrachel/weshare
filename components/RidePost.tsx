/**
 Contributors
 Kevin Song: 3 hours
 Rachel Huiqi: 3 hours
 */

import { db } from "@/firebaseConfig";
import { formatDate, formatTime } from "@/utils";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ButtonGreen } from "./button-green";

type RidePostProps = {
  rideId: string;
  name: string;
  destination: string;
  departureDate: Date;
  departureTime: Date;
  currentPeople: number;
  maxPeople: number;
};

const RidePost: React.FC<RidePostProps> = ({
  rideId,
  name,
  destination,
  departureDate,
  departureTime,
  currentPeople,
  maxPeople,
}) => {
  const [isUserRsvped, setIsUserRsvped] = useState(false);
  const [userId, setUserId] = useState("");
  const router = useRouter();
  const route = useRoute();

  if (!departureDate || !(departureDate instanceof Date)) {
    departureDate = new Date();
  }
  if (!departureTime || !(departureTime instanceof Date)) {
    departureTime = new Date();
  }

  const checkIsUserRsvped = useCallback(async () => {
    const rideDoc = doc(db, "rides", rideId);
    const rideData = await getDoc(rideDoc);
    if (rideData.exists()) {
      const rsvpedUsers = rideData.data().ppl;
      setIsUserRsvped(rsvpedUsers.includes(userId));
    }
  }, [rideId, userId]);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await SecureStore.getItemAsync("userid");
      if (!userId) {
        console.error("User ID not found");
        // TODO: remove this after testing
        setUserId("iuTXJmjktD4jFvE9_HiehLbLnMwsZ9F5svHy1iGWB0c");
        return;
      }
      setUserId(userId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    checkIsUserRsvped();
  }, [checkIsUserRsvped, rideId]);

  const handleRSVP = async () => {
    try {
      if (isUserRsvped) {
        console.log("User already RSVPed to ride: ", rideId);
        return;
      }

      const rideDoc = doc(db, "rides", rideId);
      await updateDoc(rideDoc, {
        ppl: arrayUnion(userId),
        currPpl: increment(1),
      });
      console.log("RSVPed to ride: ", rideId);
      setIsUserRsvped(true);
    } catch (error) {
      console.error("Error RSVPing to ride: ", error);
    }
  };

  const isRsvpRoute = route.name === "rsvp";
  return (
    <View style={styles.card}>
      {/* Name Header */}
      <Text style={styles.name}>{name}</Text>

      {/* Ride Details */}
      <View style={styles.detailRow}>
        <Text style={styles.label}>Destination: </Text>
        <Text style={styles.value}>{destination}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Departure: </Text>
        <Text style={styles.value}>
          {formatDate(departureDate) + " " + formatTime(departureTime)}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Seats: </Text>
        <Text style={styles.value}>
          {currentPeople} / {maxPeople}
        </Text>
      </View>

      {/* RSVP Button */}
      <View style={styles.buttonWrapper}>
        <ButtonGreen
          title={isUserRsvped ? "RSVPed" : "RSVP"}
          onPress={handleRSVP}
        />
      </View>

      {!isRsvpRoute && (
        <View style={styles.buttonWrapper}>
          <ButtonGreen
            title="More Info"
            onPress={() => router.navigate("/rsvp")}
          />
        </View>
      )}
    </View>
  );
};

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
  },
});

export default RidePost;
