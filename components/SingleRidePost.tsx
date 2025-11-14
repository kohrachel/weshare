/**
 Contributors
 Kevin Song: 3 hours
 Rachel Huiqi: 7 hours
 */

import { RideData, UserData } from "@/app/rsvp";
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
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

  const [rideCreator, setRideCreator] = useState<string>("Loading...");
  const [userData, setUserData] = useState<UserData | undefined>(undefined);

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) return;
      setUserData(userDoc.data() as UserData);
    };
    fetchUserData();
  }, [userId]);

  const fetchCreatorInfo = useCallback(async () => {
    if (!rideData?.creator) return;
    const creatorDoc = doc(db, "users", rideData.creator);
    const creatorData = await getDoc(creatorDoc);
    if (!creatorData.exists()) return;
    return creatorData.data().name as string;
  }, [rideData?.creator]);

  useEffect(() => {
    fetchCreatorInfo().then((name) => setRideCreator(name || "Loading..."));
  }, [fetchCreatorInfo]);

  useEffect(() => {
    // fetch the ride of the user
    const fetchRideData = async () => {
      if (!rideId) return;

      const rideDoc = doc(db, "rides", rideId);
      const rideDataDb = await getDoc(rideDoc);

      if (!rideDataDb.exists()) return;

      const rideData = rideDataDb.data() as RideData;

      if (!rideData) return;

      setSingleRide(rideId, rideData);
    };

    fetchRideData();
  }, [rideId, setSingleRide]);

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

  if (!rideData) {
    return (
      <View style={styles.card}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isRsvpDisabled = () => {
    if (rideData?.currPpl >= (rideData?.maxPpl || 0) && !isUserRsvped)
      return true;
    if (rideData?.gender !== "Co-ed" && rideData?.gender !== userData?.gender)
      return true;
    return false;
  };

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.navigate(`/rsvp?rideId=${rideId}`)}
    >
      {/* Name Header */}
      <Text style={styles.header}>{`📍 ${rideData.destination}`}</Text>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Departure: </Text>
        <Text style={styles.value}>
          {formatDate(rideData.date.toDate()) +
            " " +
            formatTime(rideData.time.toDate())}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Meeting at: </Text>
        <Text style={styles.value}>{rideData.meetLoc}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Gender Restriction: </Text>
        <Text style={styles.value}>
          {rideData.gender === "Co-ed" ? "Co-ed" : rideData.gender + " only"}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Capacity: </Text>
        <Text style={styles.value}>
          {rideData.currPpl} / {rideData.maxPpl}
        </Text>
      </View>

      {/* Ride Details */}
      <View style={styles.detailRow}>
        <Text style={styles.label}>Created by: </Text>
        <Text style={styles.value}>{rideCreator || "Loading..."}</Text>
      </View>

      {rideData.luggage && (
        <View style={styles.detailRow}>
          <Text
            style={styles.luggageTag}
          >{`Room for luggage: ${rideData.luggage ? "✅" : "❌"}`}</Text>
        </View>
      )}

      {/* RSVP Button */}
      <View style={styles.buttonWrapper}>
        <ButtonGreen
          title={isUserRsvped ? "RSVPed" : "RSVP"}
          onPress={toggleRSVP}
          disabled={isRsvpDisabled()}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2D2D2D",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#4c4c4c",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#f0f0f0",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    color: "#f0f0f0",
  },
  value: {
    color: "#ececec",
  },
  buttonWrapper: {
    marginTop: 16,
    alignItems: "center",
  },
  luggageTag: {
    backgroundColor: "#b1f9b3",
    color: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
});
