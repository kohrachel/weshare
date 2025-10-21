/**
 Contributors
 Emma Reid: 1 hour
 Jonny Yang: 4 hours
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
      <TouchableOpacity style={styles.profilePicContainer} onPress={handleChangePic}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <Ionicons name="camera" size={28} color="#00ff9d" />
        )}
      </TouchableOpacity>

        <ButtonGreen title="Save" onPress={handleSave} />
  );
}
});
