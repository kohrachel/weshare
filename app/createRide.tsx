import { ButtonGreen } from "@/components/button-green";
import Input from "@/components/Input";
import { StyleSheet, Text, View } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

async function storeRide(dest: string, date: string, time: string, meetLoc: string, numberPpl: number) {
  try {
    await addDoc(collection(db, "rides"), {
      destination: dest,
      date: date,
      time: time,
      meetLoc: meetLoc,
      numberPpl: numberPpl
    });

    console.log("Success!");
    return true;

  } catch (error) {
    console.log(error);
    return false;
  }
}

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "#181818",
        width: "100%",
        paddingVertical: 50,
        paddingHorizontal: 30,
        flexDirection: "column",
      }}
    >
      <Text style={styles.title}>Create a Ride</Text>
      <View style={styles.formArea}>
        <Input label={"Where to?"} defaultValue={"e.g. BNA"}></Input>
        <Input label={"When are we leaving?"} inputType="time"></Input>
        <Input
          label={"Where to meet?"}
          defaultValue={"e.g. Commons Lawn"}
        ></Input>
        <Input label={"How many people?"} defaultValue={"e.g. 4"}></Input>
      </View>
      <ButtonGreen title="Create New Ride" onPress={() => storeRide('BNA', '1/1/1', '8pm', 'Commons', 4)} />
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
    paddingVertical: 40,
  },
});
