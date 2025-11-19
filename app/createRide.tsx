/**
 Contributors
 Emma Reid: 7.5 hours
 Rachel Huiqi: 5 hours
 */

import ButtonGreen from "@/components/buttonGreen";
import DateTimeInput from "@/components/DateTimeInput";
import Input from "@/components/Input";
import { db } from "@/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Title from "../components/Title";

export type AllowedGenders = "Co-ed" | "Female" | "Male";
type RecurrenceFrequency = "daily" | "weekly" | "monthly";
export default function CreateRide() {
  const [dest, setDest] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [meetLoc, setMeetLoc] = useState("");
  const [numberPpl, setNumberPpl] = useState("");
  const [gender, setGender] = useState<AllowedGenders>("Co-ed");
  const [luggage, setLuggage] = useState(false);
  const [roundTrip, setRoundTrip] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date());
  const [returnTime, setReturnTime] = useState(new Date());
  const [recurringRide, setRecurringRide] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] =
    useState<RecurrenceFrequency>("weekly");
  const [numOccurrences, setNumOccurrences] = useState("4");

  function mergeDateAndTime(datePart: Date, timePart: Date): Date {
    return new Date(
      datePart.getFullYear(),
      datePart.getMonth(),
      datePart.getDate(),
      timePart.getHours(),
      timePart.getMinutes(),
      timePart.getSeconds(),
      timePart.getMilliseconds(),
    );
  }

  function getNextDate(
    currentDate: Date,
    frequency: RecurrenceFrequency,
  ): Date {
    const nextDate = new Date(currentDate);
    switch (frequency) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    return nextDate;
  }

  const storeRide = async () => {
    try {
      const id = await SecureStore.getItemAsync("userid");
      let user;
      let error = "";

      // Validate data
      if (!id || id === "") {
        throw new Error("User id null. Must reopen app to sign in.");
      } else {
        user = await getDoc(doc(db, "users", id));
      }

      if (!user.exists()) {
        throw new Error("User not found. Must reopen app to sign in.");
      }

      if (dest === "") {
        console.log("no dest");
        error += "\nDestination is required.";
      }

      if (meetLoc === "") {
        error += "\nMeeting location is required.";
      }

      if (Number(numberPpl) < 2) {
        error += "\nMust allow 2 or more people (including yourself).";
      }

      const returnDateTime = mergeDateAndTime(returnDate, returnTime);
      const dateTime = mergeDateAndTime(date, time);

      if (roundTrip && returnDateTime <= dateTime) {
        error += "\nReturn must be after departure.";
      }

      if (
        recurringRide &&
        (Number(numOccurrences) < 1 || Number(numOccurrences) > 52)
      ) {
        error += "\nNumber of occurrences must be between 1 and 52.";
      }

      if (error === "") {
        // Generate rides based on recurrence
        const ridesToCreate = recurringRide ? Number(numOccurrences) : 1;
        let currentDate = new Date(date);
        let currentReturnDate = new Date(returnDate);

        for (let i = 0; i < ridesToCreate; i++) {
          // send data to database
          const docRef = await addDoc(collection(db, "rides"), {
            destination: dest,
            date: new Date(currentDate),
            time: time,
            meetLoc: meetLoc,
            maxPpl: Number(numberPpl),
            gender: gender,
            luggage: Boolean(luggage),
            roundTrip: Boolean(roundTrip),
            returnTime: returnTime,
            returnDate: new Date(currentReturnDate),
            creationTime: new Date(),
            currPpl: 1,
            creator: id,
            ppl: [id],
          });

          console.log("Ride stored with ID:", docRef.id);

          // Calculate next occurrence dates
          if (i < ridesToCreate - 1) {
            currentDate = getNextDate(currentDate, recurrenceFrequency);
            if (roundTrip) {
              currentReturnDate = getNextDate(
                currentReturnDate,
                recurrenceFrequency,
              );
            }
          }
        }

        alert(
          (recurringRide
            ? `${ridesToCreate} rides saved!\n`
            : "Ride saved!\n") +
            dest +
            "\n" +
            date +
            "\n" +
            time +
            "\n" +
            meetLoc +
            "\n" +
            numberPpl +
            "\n" +
            (gender === "Co-ed" ? "Co-ed" : gender) +
            "\n" +
            (luggage ? "Luggage" : "No luggage") +
            "\n" +
            (roundTrip ? "Round Trip" : "One Way") +
            "\n" +
            returnDate +
            "\n" +
            returnTime,
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
        setRecurringRide(false);
        setRecurrenceFrequency("weekly");
        setNumOccurrences("4");
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
        <Title text={"Create a Ride"} />
      </View>
      <ScrollView contentContainerStyle={styles.formArea}>
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
            <Picker.Item label="Co-ed" value="Co-ed" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Male" value="Male" />
          </Picker>
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Room for luggage?</Text>
          <Switch
            testID="luggage-switch"
            value={luggage}
            onValueChange={(value) => setLuggage(value)}
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={luggage ? "#81C784" : "#f4f3f4"}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Round Trip?</Text>
          <Switch
            testID="round-trip-switch"
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
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Recurring Ride?</Text>
          <Switch
            testID="recurring-ride-switch"
            value={recurringRide}
            onValueChange={(value) => setRecurringRide(value)}
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={recurringRide ? "#81C784" : "#f4f3f4"}
          />
        </View>
        {recurringRide && (
          <>
            <View>
              <Picker
                selectedValue={recurrenceFrequency}
                dropdownIconColor="#e7e7e7"
                style={styles.picker}
                onValueChange={(itemValue) => setRecurrenceFrequency(itemValue)}
              >
                <Picker.Item label="Repeat every day" value="daily" />
                <Picker.Item label="Repeat every week" value="weekly" />
                <Picker.Item label="Repeat every month" value="monthly" />
              </Picker>
            </View>
            <Input
              label={"How many occurrences?"}
              defaultValue={"e.g. 4"}
              value={numOccurrences}
              setValue={setNumOccurrences}
            />
          </>
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
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
