import { View, ScrollView } from 'react-native';
import RidePost from '../components/RidePost';
import ContactCard from '../components/contactCard'


const PostRSVP = () => {
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

        <ContactCard
            firstName="Kevin"
            lastName="Song"
            phoneNum={1234567890}
            email="kevin.song@vanderbilt.edu"
            />

      </View>
    </ScrollView>
  );
};

export default PostRSVP;