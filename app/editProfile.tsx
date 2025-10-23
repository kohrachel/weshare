/**
 Contributors
 Emma Reid: 1 hour
 Jonny Yang: 4 hours
 */

import { ButtonGreen } from "@/components/button-green";
import Footer from "@/components/Footer";
import Input from "@/components/Input";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import BackButton from "../components/backbutton";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import * as SecureStore from "expo-secure-store";

export default function EditProfile() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      let id = await SecureStore.getItemAsync("userid")
      const userInfo = await getDoc(doc(db, "users", id));

      setName(userInfo.data().name || "");
      setEmail(userInfo.data().email || "");
      setPhone(userInfo.data().phone || "");
      setGender(userInfo.data().gender || "");

    } catch (error) {
      console.error("Error fetching user:", error);

    } finally {
      setLoading(false);
    }
  };

  const storeInfo = async () => {
    try {
      let id = await SecureStore.getItemAsync("userid")
      const docRef = await setDoc(doc(db, "users", id), {
        name: name,
        email: email,
        phone: phone,
        gender: gender
      });

      console.log("Info stored to ID:", id);
      alert("Info saved!\n" + name + "\n" + email + "\n" + phone + "\n" + gender);

      // Reset form fields
      fetchInfo();

    } catch (error) {
      console.error("Error adding info: ", error);
      alert("Info not saved, please try again.\n" + error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <TouchableOpacity
        style={styles.profilePicContainer}
      >
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <Ionicons name="camera" size={28} color="#00ff9d" />
        )}
      </TouchableOpacity>

      <View style={styles.formArea}>
        <Input
          label={"Name"}
          defaultValue={""}
          value={name}
          setValue={setName}
        ></Input>
        <Input
          label={"Email"}
          value={email}
          setValue={setEmail}
        />
        <Input
          label={"Phone"}
          defaultValue={""}
          value={phone}
          setValue={setPhone}
        ></Input>
        <Input
          label={"Gender"}
          defaultValue={""}
          value={gender}
          setValue={setGender}
        ></Input>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonGreen title="Save" onPress={storeInfo} />
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    paddingHorizontal: 30,
    paddingTop: 50,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  headerText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#e7e7e7",
    textAlign: "center",
  },
  profilePicContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 40,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  formArea: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
    width: "100%",
    paddingVertical: 0,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 90,
  },
});
