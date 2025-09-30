import { Text, View } from "react-native";
import { useRouter } from 'expo-router';
import { Button } from 'react-native';

// First screen - will be deleted in final product
// Navigation info: docs.expo.dev/router/basics/navigation/
export default function Index() {
  //
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button title="Feed" onPress={() => router.navigate('/feedPage')} />
      <Button title="Post a Ride" onPress={() => router.navigate('/createRide')} />
      <Button title="Edit Profile" onPress={() => router.navigate('/editProfile')} />
      <Button title="Login" onPress={() => router.navigate('/login')} />
      <Button title="RSVP" onPress={() => router.navigate('/rsvp')} />
    </View>
  );
}
