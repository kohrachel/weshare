/**
 Contributors
 Emma Reid: 5 hours
 */

import React, { useEffect, useState } from "react";
import { Text, View, Image } from "react-native";
import { ButtonGreen } from '../components/button-green';
import { useRouter } from 'expo-router';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from "expo-secure-store";


// Main screen
export default function Login() {
    const router = useRouter();

    const [enforceVanderbilt, setEnforceVanderbilt] = useState(false);

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

        const getUserInfo = async () => {
          // Exchange authorization code for tokens
          const tokenResponse = await AuthSession.exchangeCodeAsync(
            {
              clientId: "0b6e0e8a-0d83-459f-9262-cbe067b52bf3",
              code,
              redirectUri: AuthSession.makeRedirectUri({
                scheme: "com.wesharenative://oauth/auth/",
              }),
              extraParams: {
                code_verifier: request.codeVerifier,
              },
            },
            discovery
          );

          // Fetch user info using the access token
          // Uses UserInfo endpoint https://learn.microsoft.com/en-us/entra/identity-platform/userinfo
          const userInfoResponse = await fetch(discovery.userInfoEndpoint, {
            headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
          });
          const user = await userInfoResponse.json();

          // Extract user details
          const userId = user.sub;
          const email = user.email || user.upn || user.unique_name;
          const name = user.name;

          if (!email.includes("vanderbilt")) {
            setEnforceVanderbilt(true);
          } else {
              await SecureStore.setItemAsync("userid", userId); // whole app can now access this

              // essentially "signs up" every time in case information is updated
              storeUser(userId, email, name);

              router.push("/feedPage");
          }

        };

        getUserInfo();
      }
    }, [response]);

    const storeUser = async (userId, email, name) => {
      try {
        const docRef = await setDoc(doc(db, "users", userId), {
          name: name,
          email: email,
        });
      } catch (error) {
        console.error("Error adding user: ", error);
        alert("User info not saved. Please try signing in again.");
      }
    };

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
        {enforceVanderbilt && (
          <Text
            style={{
              color: 'red',
              fontSize: 15,
              textAlign: 'center',
              fontFamily: 'Inter_700',
              marginBottom: 50,
            }}
          >
            Error: Please use your Vanderbilt account.
          </Text>
        )}
        </View>
    );
}