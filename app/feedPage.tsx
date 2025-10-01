
// Main screen
import { View, ScrollView } from 'react-native';
import RidePost from '../components/RidePost'; // adjust the path if needed
import { ButtonGreen } from '../components/button-green';

const HomeScreen = () => {
  return (
    <ScrollView>
      <View>
        <RidePost
          firstName="Kevin"
          lastName="Song"
          destination="BNA Airport (United Airlines)"
          departureTime="6:30 PM"
          currentPeople={2}
          maxPeople={4}
        />

        <RidePost
          firstName="Other"
          lastName="Kevin Song"
          destination="Sun Hair Salon"
          departureTime="7:00 PM"
          currentPeople={1}
          maxPeople={6}
        />
      </View>
    </ScrollView>
  );
};


export default HomeScreen;