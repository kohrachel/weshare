import { ButtonGreen } from "@/components/button-green";
import Input from "@/components/Input";
import { StyleSheet, Text, View } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import React, { useState } from "react";

export default function Index() {
  const [dest, setDest] = useState("");
  const [time, setTime] = useState("");
  const [meetLoc, setMeetLoc] = useState("");
  const [numberPpl, setNumberPpl] = useState("");

const storeRide = async () => {
  try {
    const docRef = await addDoc(collection(db, "rides"), {
      destination: dest,
      time: time,
      meetLoc: meetLoc,
      numberPpl: Number(numberPpl),
    });

    console.log("Ride stored with ID:", docRef.id);

    // Reset form fields
    setDest("");
    setTime("");
    setMeetLoc("");
    setNumberPpl("");
  } catch (error) {
    console.error("Error adding ride: ", error);
  }
};

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
        <Input label={"Where to?"} defaultValue={"e.g. BNA"}  onChangeText={setDest}></Input>
        <Input label={"When are we leaving?"} inputType="time" onChangeText={setTime}></Input>
        <Input
          label={"Where to meet?"}
          defaultValue={"e.g. Commons Lawn"}
          onChangeText={setMeetLoc}
        ></Input>
        <Input label={"How many people?"} defaultValue={"e.g. 4"} onChangeText={setNumberPpl}></Input>
      </View>
      <ButtonGreen title="Create New Ride" onPress={storeRide} />
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
