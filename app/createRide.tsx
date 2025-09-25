import Input from "@/components/Input";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "#181818",
        width: "100%",
        paddingTop: 50,
      }}
    >
      <Text style={styles.title}>Create a Reservation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#e7e7e7",
    paddingBottom: 10,
    paddingTop: 28,
  },
});
