/**
 Contributors
 Jonny Yang: 4 hours
 */

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

type BackButtonProps = {
  onPress?: () => {};
};

export default function BackButton({ onPress }: BackButtonProps) {
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
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{alignSelf: 'flex-start'}}
      testID="back-button"
    >
      <Ionicons name="arrow-back" size={28} color={"#529053"} />
    </TouchableOpacity>
  );
}
