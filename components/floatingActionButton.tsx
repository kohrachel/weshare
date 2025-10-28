/**
*Contributors: Jonny Yang
 */

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface FloatingActionButtonProps {
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
  size?: number;
  style?: ViewStyle;
}

export default function FloatingActionButton({
  onPress,
  color = "#fff",
  backgroundColor = "#00ff9d",
  size = 28,
  style,
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name="add" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 24,
    right: 24,
    borderRadius: 50,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
});
