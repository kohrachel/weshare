/**
 Contributors
 Kevin Song: 3 hours
 Rachel Huiqi: 11 hours
 */

import { RideDataType, UserData } from "@/app/rsvp";
import { RidesContext } from "@/contexts/RidesContext";
import { UserContext } from "@/contexts/UserContext";
import { db } from "@/firebaseConfig";
import { formatDateShort, formatTime } from "@/utils";
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
import Svg, { Rect } from "react-native-svg";
import ButtonGreen from "./buttonGreen";

type SingleRidePostProps = {
  rideId: string;
};

export default function SingleRidePost({ rideId }: SingleRidePostProps) {
  const router = useRouter();

  const { getSingleRide, setSingleRide } = useContext(RidesContext);
  const { userId } = useContext(UserContext);

  const rideData = useMemo(
    () => getSingleRide(rideId),
    [getSingleRide, rideId],
  );
  const isUserRsvped = useMemo(
    () => !!(userId && rideData?.rsvpedUserIds?.includes(userId)),
    [rideData?.rsvpedUserIds, userId],
  );

  const [rideCreator, setRideCreator] = useState<string>("Loading...");
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [capacityBarWidth, setCapacityBarWidth] = useState<number>(330);

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
    if (!rideData?.creatorId) return;
    const creatorDoc = doc(db, "users", rideData.creatorId);
    const creatorData = await getDoc(creatorDoc);
    if (!creatorData.exists()) return;
    return creatorData.data().name as string;
  }, [rideData?.creatorId]);

  useEffect(() => {
    fetchCreatorInfo().then((name) => {
      if (!name) return;
      setRideCreator(name);
    });
  }, [fetchCreatorInfo]);

  useEffect(() => {
    // fetch the ride of the user
    const fetchRideData = async () => {
      if (!rideId) return;

      const rideDoc = doc(db, "rides", rideId);
      const rideDataDb = await getDoc(rideDoc);

      if (!rideDataDb.exists()) return;

      const rideData = rideDataDb.data() as RideDataType;

      if (!rideData) return;

      setSingleRide(rideId, rideData);
    };

    fetchRideData();
  }, [rideId, setSingleRide]);

  const toggleRSVP = async () => {
    if (!rideId || !userId) return;

    // update in db
    await updateDoc(doc(db, "rides", rideId), {
      rsvpedUserIds: isUserRsvped ? arrayRemove(userId) : arrayUnion(userId),
      numRsvpedUsers: isUserRsvped ? increment(-1) : increment(1),
    });
    // update in context
    const newRsvpedUserIds: string[] = isUserRsvped
      ? rideData?.rsvpedUserIds?.filter((id) => id !== userId) || []
      : [...(rideData?.rsvpedUserIds || []), userId];
    const numRsvpedUsers: number = isUserRsvped
      ? (rideData?.numRsvpedUsers || 0) - 1
      : (rideData?.numRsvpedUsers || 0) + 1;
    setSingleRide(rideId, {
      rsvpedUserIds: newRsvpedUserIds,
      numRsvpedUsers: numRsvpedUsers,
    });
  };

  const RSVPButtonText = useMemo(() => {
    if (isUserRsvped) return "RSVPed";
    if (!rideData) return "Loading...";
    if (rideData.numRsvpedUsers >= (rideData.maxPpl || 0) && !isUserRsvped)
      return "Ride is full";
    if (rideData.gender !== "Co-ed" && rideData.gender !== userData?.gender)
      return rideData.gender + " only ride";
    return "RSVP to this ride";
  }, [isUserRsvped, rideData, userData]);

  if (!rideData) {
    return (
      <View style={styles.card}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isRsvpDisabled = () => {
    if (rideData?.numRsvpedUsers >= (rideData?.maxPpl || 0) && !isUserRsvped)
      return true;
    if (rideData?.gender !== "Co-ed" && rideData?.gender !== userData?.gender)
      return true;
    return false;
  };

  return (
    <Pressable
      style={[styles.card, isRsvpDisabled() && styles.cardDisabled]}
      onPress={() => router.navigate(`/rsvp?rideId=${rideId}`)}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerIcon}>📍</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{rideData.destination}</Text>
          <Text style={styles.createdBy}>Created by: {rideCreator || "Loading..."}</Text>
          <Text style={styles.createdBy}>
            {formatDateShort(rideData.departs.toDate()) +
              ", " +
              formatTime(rideData.departs.toDate())}
            {rideData.isRoundTrip &&
              rideData.returns &&
              " — " +
                formatDateShort(rideData.returns.toDate()) +
                ", " +
                formatTime(rideData.returns.toDate())}
          </Text>
        </View>
      </View>

      {/* Capacity Section */}
      <View
        style={styles.capacityContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setCapacityBarWidth(width);
        }}
      >
        <Text style={styles.capacityText}>
          {rideData.numRsvpedUsers} / {rideData.maxPpl} seats taken
        </Text>
        <Svg width={capacityBarWidth} height="10" style={styles.capacityBar}>
          {/* Background bar (gray for full capacity) */}
          <Rect
            x="0"
            y="0"
            width={capacityBarWidth}
            height="10"
            fill="#5f5f5f"
            rx="5"
            ry="5"
          />
          {/* Foreground bar (green for current people) */}
          <Rect
            x="0"
            y="0"
            width={`${(rideData.numRsvpedUsers / (rideData.maxPpl || 1)) * capacityBarWidth}`}
            height="10"
            fill="#a0fca1"
            rx="5"
            ry="5"
          />
        </Svg>
      </View>

      {/* Time & Location Section */}
      <View style={styles.timeLocationSection}>
        {/* <View style={styles.detailRow}>
          <Text style={styles.label}>📅 Leaves </Text>
          <Text style={styles.value}>
            {formatDateShort(rideData.departs.toDate()) +
              " @ " +
              formatTime(rideData.departs.toDate())}
          </Text>
        </View>

        {rideData.isRoundTrip && rideData.returns && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>🏠 Returns </Text>
            <Text style={styles.value}>
              {formatDateShort(rideData.returns.toDate()) +
                " @ " +
                formatTime(rideData.returns.toDate())}
            </Text>
          </View>
        )} */}

        <View style={styles.detailRow}>
          <Text style={styles.label}>🤝🏻 Departs from </Text>
          <Text style={styles.value}>{rideData.departsFrom}</Text>
        </View>
      </View>

      {/* Tags Section */}
      <View style={styles.tagsSection}>
        {rideData.hasLuggageSpace && (
          <Text style={styles.tag}>Space for luggage</Text>
        )}
        <Text style={styles.tag}>
          {rideData.gender === "Co-ed" ? "Co-ed" : rideData.gender + " only"}
        </Text>
        {rideData.isRoundTrip !== undefined && (
          <Text style={styles.tag}>
            {rideData.isRoundTrip ? "Round Trip" : "One Way"}
          </Text>
        )}
      </View>

      {/* RSVP Button */}
      <View style={styles.buttonWrapper}>
        <ButtonGreen
          title={RSVPButtonText}
          onPress={toggleRSVP}
          disabled={isRsvpDisabled()}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    gap: 16,
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
  cardDisabled: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333333",
    opacity: 0.7,
  },
  headerSection: {
    flexDirection: "row",
    gap: 4,
  },
  headerIcon: {
    fontSize: 30,
    color: "#f0f0f0",
    alignSelf: "center",
    marginLeft: -5,
  },
  headerText: {
    flexDirection: "column",
    gap: 4,
  },
  createdBy: {
    fontSize: 12,
    color: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f0f0f0",
  },
  timeLocationSection: {
    flexDirection: "column",
    gap: 2,
  },
  detailRow: {
    flexDirection: "row",
  },
  value: {
    fontWeight: "600",
    color: "#f0f0f0",
  },
  label: {
    color: "#ececec",
  },
  buttonWrapper: {
    alignItems: "center",
  },
  tagsSection: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: "#3B5A3D",
    color: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontWeight: "600",
    fontSize: 12,
  },
  capacityContainer: {
    flexDirection: "column",
    gap: 4,
  },
  capacityText: {
    color: "#ececec",
    minWidth: 50,
    paddingLeft: 5,
    fontSize: 12,
  },
  capacityBar: {
    borderRadius: 5,
  },
});
