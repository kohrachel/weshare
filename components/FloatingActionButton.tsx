/**
 * Contributors: Jonny Yang
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

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
    bottom: 100, // 80 (footer height) + 20 padding = 100
    right: 24,
    borderRadius: 50,
    padding: 16,
    backgroundColor: "#00ff9d", // match your ButtonGreen if needed
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5, // Android shadow
    zIndex: 10, // ensures button is on top of Footer and other components
  },
});
