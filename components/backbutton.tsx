/**
 Contributors
 Jonny Yang: 4 hours
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function BackButton({ color = "#00ff9d", size = 28, onPress }) {
  const router = useRouter();

  const handlePress = () => {
    // if a custom onPress prop is provided, use that
    if (typeof onPress === "function") {
      onPress();
    } else {
      // otherwise go back to the previous screen
      router.back();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
}
