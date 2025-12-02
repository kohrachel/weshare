/**
 Contributors
 Emma Reid: 1 hour
 */

import { StyleSheet, Text, View } from "react-native";
import BackButton from "../components/backbutton";

type InputProps = {
  text?: string;
};

/**
 * Renders a standardized header component with a back button and a centered title.
 * The layout is designed to keep the title perfectly centered by including a back button
 * on the left and an invisible spacer of the same width on the right.
 * @param {InputProps} props The component props.
 * @param {string} [props.text] The text to display as the title.
 * @returns {JSX.Element} The Title header component.
 */
export default function Title({
  text,
}: InputProps) {
  return (
    <View style={styles.header}>
      <BackButton />
      <Text style={styles.headerText}>{text}</Text>
      <View style={{ width: 28 }} />
    </View>
  );
}

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  headerText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#e7e7e7",
    textAlign: "center",
  },
});
