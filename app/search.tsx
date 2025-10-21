/**
 Contributors
 Kevin Song: 3 hours
 */

import { ScrollView, StyleSheet, Text, View } from "react-native";
import Input from "../components/Input";
import RidePost from "../components/RidePost"; // adjust the path if needed

const SearchScreen = () => {
  return (
    <ScrollView
        style={{
          backgroundColor: "#181818",
          paddingVertical: 50,
          paddingHorizontal: 10
        }}
    >
      <View>
        <Text style={styles.title}>Search for a ride</Text>
        <Input
        label=""
        defaultValue="Type here to search"
        
        />
        <RidePost
          firstName="Kevin"
          lastName="Song"
          destination="BNA Airport (United Airlines)"
          departureTime="6:30 PM"
          currentPeople={2}
          maxPeople={4}
        />

        <RidePost
          firstName="Other Kevin"
          lastName="Song"
          destination="BNA Airport (Southwest Airlines)"
          departureTime="6:40 PM"
          currentPeople={1}
          maxPeople={6}
        />
        
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#e7e7e7",
    paddingBottom: 20,
    paddingTop: 28,
    textAlign: "center"
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  value: {
    color: '#333',
  },
  buttonWrapper: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
});

export default SearchScreen;