/**
 Contributors
 Emma Reid: 8 hours
 */

import React, { useEffect, useState } from "react";
import { Text, View, Image, ActivityIndicator } from "react-native";
import { ButtonGreen } from "../components/button-green";
import { useRouter } from "expo-router";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import Input from "@/components/Input";
import validator from "validator"
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";

// Main screen
export default function Login() {
  const router = useRouter();

  const [showError, setShowError] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      await SecureStore.setItemAsync("userid", "test"); // TODO: delete after testing
      const id = await SecureStore.getItemAsync("userid");
      if (id && id != "test") { // TODO: fix after testing
        router.push("/editProfile");
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const storeUser = async (userId, email, name) => {
    try {
      // This writes to local disk so persists until app is deleted
      await SecureStore.setItemAsync("userid", userId); // whole app can now access this

      const docRef = await setDoc(doc(db, "users", userId), {
        name: name,
        email: email,
      });
    } catch (error) {
      console.error("Error adding user: ", error);
      alert("User info not saved. Please try signing in again.");
    }
  };

  const signIn = async () => {
    if (!validator.isEmail(email)) {
      setError("Error: Please use a valid email.")
      setShowError(true);
    } else if (!email.includes("vanderbilt")) {
      setError("Error: Please use a Vanderbilt email. This app is for Vanderbilt students only.")
      setShowError(true);
    } else {
      authenticateEmail(email);

      // If authentication successful:
      const id = email.substring(0, email.find("@"));
      storeUser(id, email, id);
    }
  }

  const authenticateEmail = async (email) => {
  // TODO: authenticate email
  };

  useEffect(() => {
    checkUser();
  }, []);

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
      <Image
        source={require("@/assets/images/car-logo.png")}
        style={{ width: 105, height: 105, marginBottom: 5 }}
      />
      <Image
        source={require("@/assets/images/weshare-glowing.png")}
        style={{ width: 256, height: 70, marginBottom: 5 }}
      />
      <Text
        style={{
          color: "white",
          fontSize: 30,
          textAlign: "center",
          fontFamily: "Inter_700Bold",
          marginBottom: 50,
        }}
      >
        Rideshare with other Vanderbilt students!
      </Text>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View>
          <Input
            label={"Email"}
            defaultValue={""}
            value={email}
            setValue={setEmail}
          ></Input>
          <ButtonGreen title="Login with VU SSO⚓" onPress={() => signIn()} />
          {showError && (
            <Text
              style={{
                color: "red",
                fontSize: 15,
                textAlign: "center",
                fontFamily: "Inter_700",
                marginBottom: 50,
              }}
            >
              {error}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
