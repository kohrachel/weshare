/**
 Contributors
 Emma Reid: 3 hours
 Rachel Huiqi: 1 hour
 Jonny Yang: 5 min
*/

import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonGreenProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

export function ButtonGreen({
  title,
  onPress,
  disabled = false,
  testID,
}: ButtonGreenProps) {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    backgroundColor: "#529053",
    borderRadius: 15,
    marginHorizontal: 10,
    padding: 10,
    width: "100%",
  },
  disabled: {
    backgroundColor: "#5f5f5f",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
});
