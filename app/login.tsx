import { Text, View, Image } from "react-native";
import { ButtonGreen } from '../components/button-green';
import { useRouter } from 'expo-router';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';

// Main screen
export default function Login() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        backgroundColor: "#181818",
      }}
    >
      <Image source={require('@/assets/images/car-logo.png')} style={{width: 105,  height: 105, marginBottom: 5}}/>
      <Image source={require('@/assets/images/weshare-glowing.png')} style={{width: 256,  height: 70, marginBottom: 5}}/>
      <Text style={{color: 'white', fontSize: 30, textAlign: 'center', fontFamily: "Inter_700Bold", marginBottom: 50}}>Rideshare with other Vanderbilt students!</Text>
      <ButtonGreen  title="Login with VU SSO⚓"  onPress={() => router.navigate('/_sitemap')}/>
    </View>
  );
}
//       TODO: Space based on screen size
//       TODO: Improve button https://reactnativeelements.com/docs/components/button
