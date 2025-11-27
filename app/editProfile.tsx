    /**
     Contributors
     Emma Reid: 5 hours
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
    import { deleteField } from "firebase/firestore";

    // Components
    import ButtonGreen from "../components/buttonGreen";
    import Footer from "../components/Footer";
    import Input from "../components/Input";
    import Title from "../components/Title";

    // Firebase
    import { db, storage } from "../firebaseConfig";
    import { doc, getDoc, setDoc } from "firebase/firestore";
    import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

    export default function EditProfile() {
      const router = useRouter();

      const [profilePic, setProfilePic] = useState<string>("");
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
          }
        })();
      }, []);

      // Fetch info on mount
      useEffect(() => {
        fetchInfo();
      }, []);

      const isValidPic = (pic: any): boolean => {
        if (!pic) return false;
        if (typeof pic !== "string") return false;
        if (pic.length < 10) return false;
        if (pic.startsWith("http") || pic.startsWith("file") || pic.startsWith("content")) {
          return true;
        }
        return false;
      };

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

          const pic = data?.profilePic;
          // Only set if it starts with http, file, or content
          if (pic && typeof pic === "string" && (pic.startsWith("http") || pic.startsWith("file") || pic.startsWith("content"))) {
            setProfilePic(pic);
          } else {
            setProfilePic("");
          }
        } catch (error) {
          Alert.alert("Error", "Failed to fetch user info.");
          setProfilePic("");
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

          await setDoc(
            doc(db, "users", id),
            { profilePic: uri },
            { merge: true },
          );

          setProfilePic(uri);
          Alert.alert("Success", "Profile picture saved!");
        } catch (error) {
          Alert.alert("Error", "Failed to save profile picture.");
        }
      };

      const handleLogout = async () => {
        try {
          await SecureStore.setItemAsync("userid", "");
          router.push("/login");
        } catch (error) {
           console.error("Can't logout user: " + error);
        }
      };

      if (loading) {
        return (
          <View style={styles.loading}>
            <ActivityIndicator size="large" testID="ActivityIndicator" />
          </View>
        );
      }

      const showCamera = profilePic === null || profilePic === undefined || profilePic === "";

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleWrapper}>
              <Title text={"Edit Profile"} />
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              testID="logout-button"
              accessibilityLabel="Logout Button"
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Picture */}
          <View style={styles.profilePicWrapper}>
            <TouchableOpacity
              style={styles.profilePicContainer}
              onPress={pickImage}
              testID="profilePicButton"
              accessibilityLabel="Profile Picture Button"
            >
              <Text style={styles.placeholderText}>+</Text>
              {profilePic.length > 10 && (
                <Image
                  source={{ uri: profilePic }}
                  style={[styles.profilePic, { position: "absolute" }]}
                  testID="profilePicImage"
                  accessibilityRole="image"
                />
              )}
            </TouchableOpacity>
            {profilePic.length > 10 && (
              <TouchableOpacity
                style={styles.trashIconButton}
                onPress={async () => {
                  setProfilePic("");
                  const id = await SecureStore.getItemAsync("userid");
                  if (id) {
                    await setDoc(doc(db, "users", id), { profilePic: "" }, { merge: true });
                  }
                }}
                testID="remove-photo-button"
                accessibilityLabel="Remove Photo Button"
              >
                <Ionicons name="trash-outline" size={20} color="#3CB371" />
              </TouchableOpacity>
            )}
          </View>

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
            <ButtonGreen
              title="Save Changes"
              onPress={storeInfo}
              testID="save-button"
            />
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
        justifyContent: "center",
        width: "100%",
        marginBottom: 20,
        position: "relative",
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
        overflow: "hidden",
      },
      profilePicWrapper: {
        alignSelf: "center",
        marginBottom: 20,
        position: "relative",
        width: 80,
        height: 80,
      },
      trashIconButton: {
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
      },
      removeButton: {
        position: "absolute",
        top: 0,
        right: -5,
        backgroundColor: "red",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
      },
      removeButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
      },
      profilePic: {
        width: 80,
        height: 80,
        borderRadius: 40,
      },
      placeholderPic: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#2a2a2a",
        justifyContent: "center",
        alignItems: "center",
      },
      placeholderText: {
        fontSize: 36,
        color: "#3CB371",
        fontWeight: "bold",
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
        paddingBottom: 120,
      },
      logoutButton: {
        backgroundColor: "red",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        position: "absolute",
        right: 0,
      },
      logoutButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
      },
      titleWrapper: {
        alignItems: "center",
      },
    });