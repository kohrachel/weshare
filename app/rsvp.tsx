/**
 Contributors
 Kevin Song: 2 hours
 Emma Reid: 2 hours
 Rachel Huiqi: 0.5 hours
 */

import Footer from "@/components/Footer";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "@/firebaseConfig";
import { useRoute } from "@react-navigation/native";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import RidePost from "../components/RidePost";
import ContactCard from "../components/contactCard";

type RideData = {
  creator: string;
  destination: string;
  date: Timestamp;
  time: Timestamp;
  currPpl: number;
  maxPpl: number;
};

export default function RSVP() {
  const [rideData, setRideData] = useState<RideData | null>(null);
  const [rideCreator, setRideCreator] = useState<string | null>(null);

  // Get ride ID from route params
  const route = useRoute();
  const { rideId } = route.params as { rideId: string };

  useEffect(() => {
    const fetchRideData = async () => {
      const rideDoc = doc(db, "rides", rideId);
      const rideData = await getDoc(rideDoc);
      if (rideData.exists()) {
        const ride = rideData.data();
        console.log(ride);
        setRideData({
          creator: ride.creator,
          destination: ride.destination,
          date: ride.date,
          time: ride.time,
          currPpl: ride.currPpl,
          maxPpl: ride.maxPpl,
        });
      } else {
        console.error("Ride data not found");
      }
    };
    fetchRideData();
  }, [rideId]);

  useEffect(() => {
    const fetchRideCreator = async () => {
      if (!rideData) return;
      const userId = doc(db, "users", rideData.creator);
      const userData = await getDoc(userId);
      if (userData.exists()) {
        setRideCreator(userData.data().name);
      }
    };
    fetchRideCreator();
  }, [rideData]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{
          backgroundColor: "#181818",
          paddingVertical: 50,
          paddingHorizontal: 10,
        }}
      >
        <Text style={styles.title}>Ride Details</Text>
        <View>
          <RidePost
            name="Kevin Song"
            destination="BNA Airport (United Airlines)"
            departureDate={new Date()}
            departureTime={new Date()}
            currentPeople={2}
            maxPeople={4}
          />

          <ContactCard
            firstName="Kevin"
            lastName="Song"
            phoneNum={1234567890}
            email="kevin.song@vanderbilt.edu"
          />
        </View>
      </ScrollView>
      <Footer />
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
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#e7e7e7",
    paddingBottom: 20,
    paddingTop: 28,
    textAlign: "center",
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
    paddingHorizontal: 0,
  },
});
