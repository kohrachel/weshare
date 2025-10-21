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

  if (route.name === 'rsvp') {

  
  return (
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>

        <Text style={styles.value}>{destination}</Text>

        <Text style={styles.value}>{departureTime}</Text>

        <Text style={styles.value}>
          {currentPeople} / {maxPeople}
        </Text>

        <ButtonGreen title="RSVP" onPress={() => console.log("RSVP pressed!")} />

  );
}
else {
  return (
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>

        <Text style={styles.value}>{destination}</Text>

        <Text style={styles.value}>{departureTime}</Text>

          {currentPeople} / {maxPeople}

        <ButtonGreen title="RSVP" onPress={() => console.log("RSVP pressed!")} />

        <ButtonGreen title="More Info" onPress={() => router.navigate('/rsvp')} />
  );
}
};

export default RidePost;