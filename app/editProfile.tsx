/**
 Contributors
 Emma Reid: 1 hour
 Jonny Yang: 3 hours
 */

import { ButtonGreen } from "@/components/button-green";
import Input from "@/components/Input";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BackButton from "../components/backbutton";

export default function EditProfile() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleSave = () => {
    router.back();
  };

  const handleChangePic = () => {
    console.log("Change profile pic pressed");
    // later: integrate image picker
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton/>
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <TouchableOpacity style={styles.profilePicContainer} onPress={handleChangePic}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <Ionicons name="camera" size={28} color="#00ff9d" />
        )}
      </TouchableOpacity>

      <View style={styles.formArea}>
        <Input label="Full Name" />
        <Input label="Email" />
        <Input label="Phone Number" />
        <Input label="Gender" />
      </View>

      <View style={styles.buttonContainer}>
        <ButtonGreen title="Save" onPress={handleSave} />
      </View>
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
    paddingBottom: 40,
  },
});
