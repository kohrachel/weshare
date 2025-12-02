/**
 Contributors
 Emma Reid: 3 hours
 Rachel Huiqi: 1 hour
 Jonny Yang: 5 min
*/

import { StyleSheet, Text, TouchableOpacity } from "react-native";

type ButtonGreenProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Renders a reusable green button component.
 * @param {ButtonGreenProps} props - The component props.
 * @param {string} props.title - The text to display inside the button.
 * @param {() => void} props.onPress - The function to call when the button is pressed.
 * @param {boolean} [props.disabled=false] - If true, the button will be disabled and styled differently.
 * @param {string} [props.testID] - An optional ID for testing purposes.
 * @returns {JSX.Element} The ButtonGreen component.
 */
export default function ButtonGreen({
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
      accessibilityState={{ disabled }}
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
