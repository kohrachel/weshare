import { ButtonGreen } from "@/components/button-green";
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
      <View style={styles.formArea}>
        <Input label={"Where to?"} defaultValue={"e.g. BNA"}></Input>
        <Input label={"When are we leaving?"} inputType="time"></Input>
        <Input
          label={"Where to meet?"}
          defaultValue={"e.g. Commons Lawn"}
        ></Input>
        <Input label={"How many people?"} defaultValue={"e.g. 4"}></Input>
      </View>
      <ButtonGreen title="Submit Ride" onPress={() => {}} />
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
  formArea: {
    flexDirection: "column",
    gap: 30,
    width: "100%",
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
});
