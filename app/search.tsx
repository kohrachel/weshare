
// Main screen
import { View, ScrollView } from 'react-native';
import RidePost from '../components/RidePost'; // adjust the path if needed
import {Text, StyleSheet } from 'react-native';
import { ButtonGreen } from '../components/button-green';
import Input from '../components/Input';

const SearchScreen = () => {
  return (
    <ScrollView>
      <View>
        <Input
        label="Search"
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
        <View style={styles.buttonWrapper}>
                <ButtonGreen title="Create Post" onPress={() => console.log("Create post pressed!")} />
                </View>
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