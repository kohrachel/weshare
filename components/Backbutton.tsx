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

/**
 * Renders a reusable back button component.
 * When pressed, it navigates to the previous screen using the router, or
 * executes a custom `onPress` function if one is provided as a prop.
 * @param {BackButtonProps} props - The component props.
 * @param {() => void} [props.onPress] - An optional function to override the default back navigation behavior.
 * @returns {JSX.Element} The BackButton component.
 */
export default function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();

  /**
   * Handles the press event on the back button.
   * If a custom `onPress` function is provided, it will be executed.
   * Otherwise, the default behavior is to navigate to the previous screen.
   */
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
