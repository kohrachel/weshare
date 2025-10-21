/**
 Contributors
 Emma Reid: 3 hours
 Rachel Huiqi: 1 hour
 */

import { StyleSheet, Text, TouchableOpacity } from "react-native";
interface ButtonGreenProps {
  title: string;
  onPress: () => void;
}

export function ButtonGreen({ title, onPress }: ButtonGreenProps) {
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    backgroundColor: "#529053",
    borderRadius: 10,
    marginHorizontal: 10,
    padding: 15,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
});
