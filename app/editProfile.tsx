// Emma Reid: 4 hours
// Jonny Yang: 7 hours

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
import { useFonts } from "expo-font";

// Components
import ButtonGreen from "@/components/buttonGreen";
import Footer from "@/components/Footer";
import Input from "@/components/Input";

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

  // Preload Ionicons font
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    (async () => {
      const id = await SecureStore.getItemAsync("userid");
      if (!id) await SecureStore.setItemAsync("userid", "testUser123");
    })();
  }, []);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const id = await SecureStore.getItemAsync("userid");
      if (!id) throw new Error("No user ID found");

      const userDoc = await getDoc(doc(db, "users", id));
      const data = userDoc.data();

      setName(data?.name || "");
      setEmail(data?.email || "");
      setPhone(data?.phone || "");
      setGender(data?.gender || "");
      setProfilePic(data?.profilePic || null);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user info.");
    } finally {
      setLoading(false);
    }
  };

  const storeInfo = async () => {
    try {
      const id = await SecureStore.getItemAsync("userid");
      if (!id) throw new Error("No user ID found");

      await setDoc(
        doc(db, "users", id),
        { name, email, phone, gender, profilePic },
        { merge: true },
      );

      Alert.alert("Success", "Info saved!");
      fetchInfo();
    } catch (error) {
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

      await setDoc(doc(db, "users", id), { profilePic: downloadURL }, { merge: true });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.setItemAsync("userid", "");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" testID="ActivityIndicator" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <TouchableOpacity style={styles.profilePicContainer} onPress={pickImage} testID="profilePicButton">
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <View style={styles.emptyProfilePic} />
        )}
        <View style={styles.cameraIconOverlay}>
          <Ionicons name="camera-outline" size={40} color="#529053" />
        </View>
      </TouchableOpacity>

      {/* Form Inputs */}
      <View style={styles.formArea}>
        <Input label="Name" value={name} setValue={setName} testID="input-Name" />
        <Input label="Email" value={email} setValue={setEmail} testID="input-Email" />
        <Input label="Phone" value={phone} setValue={setPhone} testID="input-Phone" />
        <Input label="Gender" value={gender} setValue={setGender} testID="input-Gender" />
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <ButtonGreen title="Save Changes" onPress={storeInfo} testID="save-button" />
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818", paddingHorizontal: 30, paddingTop: 50 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#e7e7e7",
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "red",
  },
  logoutButtonText: { color: "white", fontWeight: "600", fontSize: 14 },

  profilePicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
    position: "relative",
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  emptyProfilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2a2a2a",
  },
  cameraIconOverlay: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },

  formArea: { flex: 1, flexDirection: "column", gap: 10, width: "100%", paddingVertical: 0 },
  buttonContainer: { width: "100%", alignItems: "center", paddingBottom: 120 },
});