import React, { useEffect } from "react";
import { Text, View, Image } from "react-native";
import { ButtonGreen } from '../components/button-green';
import { useRouter } from 'expo-router';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from "expo-secure-store";


// Main screen
export default function Login() {
    const discovery = AuthSession.useAutoDiscovery("https://login.microsoftonline.com/common");

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
        clientId: "0b6e0e8a-0d83-459f-9262-cbe067b52bf3",
        redirectUri: AuthSession.makeRedirectUri({
            scheme: "com.wesharenative://oauth/auth/",
        }),
        scopes: ["openid", "profile", "email"],
    },
        discovery
    );

    useEffect(() => {
        if (response?.type === "success") {
          const { code } = response.params;
          save(code); // TODO: try to save something shorter
          console.log("Auth code:", code);
        }
    }, [response]);

    async function save(code) {
        await SecureStore.setItemAsync("userid", code);
    }

    const router = useRouter(); // TODO: redirect to diff page after sign in

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
          <ButtonGreen  title="Login with VU SSO⚓"  onPress={() => promptAsync()} />
        </View>
    );
}