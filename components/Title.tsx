/**
 Contributors
 Emma Reid: 1 hour
 */

import { StyleSheet, Text, View } from "react-native";
import BackButton from "../components/backbutton";

type InputProps = {
  text?: string;
};

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
