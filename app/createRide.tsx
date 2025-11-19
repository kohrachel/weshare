/**
 Contributors
 Emma Reid: 7.5 hours
 Rachel Huiqi: 5 hours
 */

import ButtonGreen from "@/components/buttonGreen";
import DateTimeInput from "@/components/DateTimeInput";
import Input from "@/components/Input";
import { db } from "@/firebaseConfig";
import * as SecureStore from "expo-secure-store";
import { addDoc, getDoc, doc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Switch } from "react-native";
import Title from "../components/Title";
import { Picker } from "@react-native-picker/picker";

export default function CreateRide() {
  const [dest, setDest] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [meetLoc, setMeetLoc] = useState("");
  const [numberPpl, setNumberPpl] = useState("");
  const [gender, setGender] = useState("Co-ed");
  const [luggage, setLuggage] = useState(false);
  const [roundTrip, setRoundTrip] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date());
  const [returnTime, setReturnTime] = useState(new Date());

  function mergeDateAndTime(datePart, timePart) {
    return new Date(
      datePart.getFullYear(),
      datePart.getMonth(),
      datePart.getDate(),
      timePart.getHours(),
      timePart.getMinutes(),
      timePart.getSeconds(),
      timePart.getMilliseconds()
    );
  }

  const storeRide = async () => {
    try {
      const id = await SecureStore.getItemAsync("userid");
      let user;
      let error = "";

      // Validate data
      if (id == "") {
        throw new Error('User id null. Must reopen app to sign in.');
      } else {
        user = await getDoc(doc(db, "users", id));
      }

      if (!user.exists()) {
        throw new Error('User not found. Must reopen app to sign in.');
      }

      if (dest == "") {
        console.log("no dest");
        error += '\nDestination is required.';
      }

      if (meetLoc == "") {
        error += '\nMeeting location is required.';
      }

      if (numberPpl < 2) {
        error += '\nMust allow 2 or more people (including yourself).';
      }

      const returnDateTime = mergeDateAndTime(returnDate, returnTime);
      const dateTime = mergeDateAndTime(date, time);

      if (roundTrip && returnDateTime <= dateTime) {
        error += '\nReturn must be after departure.';
      }

      if (error == "") {
        // send data to database
        const docRef = await addDoc(collection(db, "rides"), {
          destination: dest,
          date: date,
          time: time,
          meetLoc: meetLoc,
          maxPpl: Number(numberPpl),
          gender: gender,
          luggage: Boolean(luggage),
          roundTrip: Boolean(roundTrip),
          returnTime: returnTime,
          returnDate: returnDate,
          creationTime: new Date(),
          currPpl: 1,
          creator: id,
          ppl: [id],
        });

        console.log("Ride stored with ID:", docRef.id);
        alert(
          "Ride saved!\n" +
          dest + "\n" +
          date + "\n" +
          time + "\n" +
          meetLoc + "\n" +
          numberPpl + "\n" +
          (gender == "" ? "Coed" : gender) + "\n" +
          (luggage ? "Luggage" : "No luggage") + "\n" +
          (roundTrip ? "Round Trip" : "One Way") + "\n" +
          returnDate + "\n" +
          returnTime
        );

        // Reset form fields
        setDest("");
        setTime(new Date());
        setDate(new Date());
        setMeetLoc("");
        setNumberPpl("");
        setGender("Co-ed");
        setLuggage(false);
        setRoundTrip(false);
        setReturnTime(new Date());
        setReturnDate(new Date());
      } else {
        alert("Ride not saved, please fix error(s):\n" + error);
        error = "";
      }

    } catch (systemError) {
      console.error("Error adding ride: ", systemError);
      alert("Ride not saved, please try again.\n" + systemError);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#181818",
        paddingHorizontal: 30,
        paddingTop: 50,
        paddingBottom: 50,
        width: "100%",
      }}
    >
      <View style={styles.header}>
      <Title text={"Create a Ride"}/>
      </View>
      <ScrollView
        contentContainerStyle={styles.formArea}
      >
        <Input
          label={"Where to?"}
          defaultValue={"e.g. BNA"}
          value={dest}
          setValue={setDest}
        ></Input>
        <DateTimeInput
          label={"When are we leaving?"}
          dateValue={date}
          timeValue={time}
          setDateValue={setDate}
          setTimeValue={setTime}
        />
        <Input
          label={"Where to meet?"}
          defaultValue={"e.g. Commons Lawn"}
          value={meetLoc}
          setValue={setMeetLoc}
        ></Input>
        <Input
          label={"How many people (including you)?"}
          defaultValue={"e.g. 4"}
          value={numberPpl}
          setValue={setNumberPpl}
        ></Input>
        <View>
          <Text style={styles.label}>What genders allowed?</Text>
          <Picker
            selectedValue={gender}
            dropdownIconColor="#e7e7e7"
            style={styles.picker}
            onValueChange={(itemValue) => setGender(itemValue)}
          >
            <Picker.Item label="Coed" value="Coed" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Male" value="Male" />
          </Picker>
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Room for luggage?</Text>
          <Switch
            testID = "luggage-switch"
            value={luggage}
            onValueChange={(value) => setLuggage(value)}
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={luggage ? "#81C784" : "#f4f3f4"}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Round Trip?</Text>
          <Switch
            testID = "round-trip-switch"
            value={roundTrip}
            onValueChange={(value) => setRoundTrip(value)}
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={roundTrip ? "#81C784" : "#f4f3f4"}
          />
        </View>
        {roundTrip && (
          <DateTimeInput
            label={"When are we returning?"}
            dateValue={returnDate}
            timeValue={returnTime}
            setDateValue={setReturnDate}
            setTimeValue={setReturnTime}
          />
        )}
      </ScrollView>
    <ButtonGreen title="Create New Ride" onPress={storeRide} />
    </View>
  );
}

const styles = StyleSheet.create({
  formArea: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
    paddingHorizontal: 1, // yes, the 1 is necessary
    paddingBottom: 10,
  },
  label: {
    color: "#e7e7e7",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  picker: {
    backgroundColor: "#2a2a2a",
    color: "#e7e7e7",
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
