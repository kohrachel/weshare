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
  testID?: string; // <-- add testID prop
}

export function ButtonGreen({ title, onPress, testID }: ButtonGreenProps) {
  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={onPress}
      testID={testID} // <-- forward testID
    >
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
