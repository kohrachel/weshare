/**
 Contributors
 Emma Reid: 5 hours
 Rachel Huiqi: 5 hours
 */

import { ButtonGreen } from "@/components/button-green";
import DateTimeInput from "@/components/DateTimeInput";
import Input from "@/components/Input";
import { db } from "@/firebaseConfig";
import * as SecureStore from "expo-secure-store";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [dest, setDest] = useState("");
  const [time, setTime] = useState("");
  const [meetLoc, setMeetLoc] = useState("");
  const [numberPpl, setNumberPpl] = useState("");

  const storeRide = async () => {
    try {
      let id = await SecureStore.getItemAsync("userid");
      const docRef = await addDoc(collection(db, "rides"), {
        destination: dest,
        time: time,
        meetLoc: meetLoc,
        maxPpl: Number(numberPpl),
        creationTime: new Date(),
        currPpl: 1,
        creator: id,
        ppl: [id],
      });

      console.log("Ride stored with ID:", docRef.id);
      alert(
        "Ride saved!\n" +
          dest +
          "\n" +
          time +
          "\n" +
          meetLoc +
          "\n" +
          numberPpl,
      );

      // Reset form fields
      setDest("");
      setTime("");
      setMeetLoc("");
      setNumberPpl("");
    } catch (error) {
      console.error("Error adding ride: ", error);
      alert("Ride not saved, please try again.\n" + error);
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
        <Input
          label={"Where to?"}
          defaultValue={"e.g. BNA"}
          value={dest}
          setValue={setDest}
        ></Input>
        <DateTimeInput
          label={"When are we leaving?"}
          value={time}
          setValue={setTime}
        />
        <Input
          label={"Where to meet?"}
          defaultValue={"e.g. Commons Lawn"}
          value={meetLoc}
          setValue={setMeetLoc}
        ></Input>
        <Input
          label={"How many people?"}
          defaultValue={"e.g. 4"}
          value={numberPpl}
          setValue={setNumberPpl}
        ></Input>
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
