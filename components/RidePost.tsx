/**
 Contributors
 Kevin Song: 3 hours
 */

import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ButtonGreen } from "./button-green";

type RidePostProps = {
  firstName: string;
  lastName: string;
  destination: string;
  departureTime: string;
  currentPeople: number;
  maxPeople: number;
};

const RidePost: React.FC<RidePostProps> = ({
  firstName,
  lastName,
  destination,
  departureTime,
  currentPeople,
  maxPeople,
}) => {
  const router = useRouter();
  const route = useRoute();

  if (route.name === "rsvp") {
    return (
      <View style={styles.card}>
        {/* Name Header */}
        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>

        {/* Ride Details */}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Destination: </Text>
          <Text style={styles.value}>{destination}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Departure: </Text>
          <Text style={styles.value}>{departureTime}</Text>
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
            title="RSVP"
            onPress={() => console.log("RSVP pressed!")}
          />
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.card}>
        {/* Name Header */}
        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>

        {/* Ride Details */}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Destination: </Text>
          <Text style={styles.value}>{destination}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Departure: </Text>
          <Text style={styles.value}>{departureTime}</Text>
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
            title="RSVP"
            onPress={() => console.log("RSVP pressed!")}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <ButtonGreen
            title="More Info"
            onPress={() => router.navigate("/rsvp")}
          />
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 0,
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
