/**
 Contributors
 Emma Reid: 3 hours
 Jonny Yang: 4 hours
*/

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Components
import BackButton from "@/components/backbutton";
import { ButtonGreen } from "@/components/button-green";
import Footer from "@/components/Footer";
import Input from "@/components/Input";

// Firebase
import { db, storage } from "@/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function EditProfile() {
  const router = useRouter();

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  // Ensure a test userid exists
  useEffect(() => {
    (async () => {
      const id = await SecureStore.getItemAsync("userid");
      if (!id) {
        await SecureStore.setItemAsync("userid", "testUser123");
        console.log("Test userid set to 'testUser123'");
      } else {
        console.log("Existing userid found:", id);
      }
    })();
  }, []);

  // Fetch info on mount
  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const id = await SecureStore.getItemAsync("userid");
      console.log("Fetching info for userid:", id);
      if (!id) throw new Error("No user ID found");

      const userDoc = await getDoc(doc(db, "users", id));
      const data = userDoc.data();

      setName(data?.name || "");
      setEmail(data?.email || "");
      setPhone(data?.phone || "");
      setGender(data?.gender || "");
      setProfilePic(data?.profilePic || null);
    } catch (error) {
      console.error("Error fetching user:", error);
      Alert.alert("Error", "Failed to fetch user info.");
    } finally {
      setLoading(false);
    }
  };

  const storeInfo = async () => {
    try {
      const id = await SecureStore.getItemAsync("userid");
      console.log("Saving info for userid:", id);
      if (!id) throw new Error("No user ID found");

      await setDoc(
        doc(db, "users", id),
        { name, email, phone, gender, profilePic },
        { merge: true },
      );

      Alert.alert("Success", "Info saved!");
      fetchInfo();
    } catch (error) {
      console.error("Error saving info:", error);
      Alert.alert("Error", "Info not saved, please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfilePic(uri);
        await uploadImage(uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Could not select image.");
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const id = await SecureStore.getItemAsync("userid");
      if (!id) throw new Error("No user ID found");

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profilePictures/${id}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setProfilePic(downloadURL);

      await setDoc(
        doc(db, "users", id),
        { profilePic: downloadURL },
        { merge: true },
      );
      console.log("Image uploaded:", downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" testID="ActivityIndicator" />
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
        onPress={pickImage}
        testID="profilePicButton"
        accessibilityLabel="Profile Picture Button"
      >
        {profilePic ? (
          <Image
            source={{ uri: profilePic }}
            style={styles.profilePic}
            testID="profilePicImage"
            accessibilityRole="image"
          />
        ) : (
          <Ionicons name="camera" size={28} color="#529053" />
        )}
      </TouchableOpacity>

      <View style={styles.formArea}>
        <Input
          label="Name"
          value={name}
          setValue={setName}
          testID="input-Name"
        />
        <Input
          label="Email"
          value={email}
          setValue={setEmail}
          testID="input-Email"
        />
        <Input
          label="Phone"
          value={phone}
          setValue={setPhone}
          testID="input-Phone"
        />
        <Input
          label="Gender"
          value={gender}
          setValue={setGender}
          testID="input-Gender"
        />
      </View>

      <View style={styles.buttonContainer}>
        <ButtonGreen title="Save" onPress={storeInfo} testID="save-button" />
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
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  profilePic: { width: 80, height: 80, borderRadius: 40 },
  formArea: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
    width: "100%",
    paddingVertical: 0,
  },
  buttonContainer: { width: "100%", alignItems: "center", paddingBottom: 90 },
});
