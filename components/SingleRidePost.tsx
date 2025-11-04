/**
 Contributors
 Kevin Song: 3 hours
 Rachel Huiqi: 5 hours
 */

import { RideData } from "@/app/rsvp";
import { RidesContext } from "@/contexts/RidesContext";
import { UserContext } from "@/contexts/UserContext";
import { db } from "@/firebaseConfig";
import { formatDate, formatTime } from "@/utils";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ButtonGreen } from "./button-green";

type SingleRidePostProps = {
  rideId: string;
};

export default function SingleRidePost({ rideId }: SingleRidePostProps) {
  const router = useRouter();
  const route = useRoute();

  const { getSingleRide, setSingleRide } = useContext(RidesContext);
  const { userId } = useContext(UserContext);

  const rideData = useMemo(
    () => getSingleRide(rideId),
    [getSingleRide, rideId],
  );
  const isUserRsvped = useMemo(
    () => !!(userId && rideData?.ppl?.includes(userId)),
    [rideData?.ppl, userId],
  );

  useEffect(() => {
    // fetch the ride of the user
    const fetchRideData = async () => {
      if (!rideId || !userId) return;

      const rideDoc = doc(db, "rides", rideId);
      const rideDataDb = await getDoc(rideDoc);

      if (!rideDataDb.exists()) return;

      const rideData = rideDataDb.data() as RideData;

      if (!rideData) return;

      setSingleRide(rideId, rideData);
    };

    fetchRideData();
  }, [rideId, userId, setSingleRide]);

  const toggleRSVP = async () => {
    if (!rideId || !userId) return;

    // update in db
    await updateDoc(doc(db, "rides", rideId), {
      ppl: isUserRsvped ? arrayRemove(userId) : arrayUnion(userId),
      currPpl: isUserRsvped ? increment(-1) : increment(1),
    });
    // update in context
    const newPpl: string[] = isUserRsvped
      ? rideData?.ppl?.filter((id) => id !== userId) || []
      : [...(rideData?.ppl || []), userId];
    const currPpl: number = isUserRsvped
      ? (rideData?.currPpl || 0) - 1
      : (rideData?.currPpl || 0) + 1;
    setSingleRide(rideId, {
      ppl: newPpl,
      currPpl: currPpl,
    });
  };

  const isRsvpRoute = route.name === "rsvp";

  if (!rideData) {
    return (
      <View style={styles.card}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Name Header */}
      <Text style={styles.name}>{rideData.creator}</Text>

      {/* Ride Details */}
      <View style={styles.detailRow}>
        <Text style={styles.label}>Destination: </Text>
        <Text style={styles.value}>{rideData.destination}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Departure: </Text>
        <Text style={styles.value}>
          {formatDate(rideData.date.toDate()) +
            " " +
            formatTime(rideData.time.toDate())}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Seats: </Text>
        <Text style={styles.value}>
          {rideData.currPpl} / {rideData.maxPpl}
        </Text>
      </View>

      {/* RSVP Button */}
      <View style={styles.buttonWrapper}>
        <ButtonGreen
          title={isUserRsvped ? "RSVPed" : "RSVP"}
          onPress={toggleRSVP}
        />
      </View>

      {!isRsvpRoute && (
        <View style={styles.buttonWrapper}>
          <ButtonGreen
            title="More Info"
            onPress={() => router.navigate(`/rsvp?rideId=${rideId}`)}
          />
        </View>
      )}
    </View>
  );
}

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
