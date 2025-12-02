/**
 * Contributors
 * Jonny Yang: 4 hours
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

/**
 * Renders a floating action button that navigates to the create ride screen.
 * This component is positioned at the bottom right of the screen and provides a
 * quick access point for users to initiate the ride creation process.
 * @returns {JSX.Element} The FloatingActionButton component.
 */
export default function FloatingActionButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.8}
      onPress={() => router.navigate("/createRide")}
    >
      <Ionicons name="add" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 100, 
    right: 24,
    borderRadius: 50,
    padding: 16,
    backgroundColor: "#529053", 
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5, 
    zIndex: 10,
  },
});
