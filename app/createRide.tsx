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
import { addDoc, collection, doc, getDoc, Timestamp } from "firebase/firestore";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Title from "../components/Title";
import { RideData } from "./rsvp";

export type AllowedGenders = "Co-ed" | "Female" | "Male";
type RecurrenceFrequency = "daily" | "weekly" | "monthly";

type RideFormData = Omit<RideData, "id"> & {
  recurringRide: boolean;
  recurrenceFrequency: RecurrenceFrequency;
  numOccurrences: string;
};

export default function CreateRide() {
  const [rideData, setRideData] = useState<RideFormData>({
    destination: "",
    date: Timestamp.fromDate(new Date()),
    time: Timestamp.fromDate(new Date()),
    meetLoc: "",
    maxPpl: 0,
    gender: "Co-ed",
    luggage: false,
    roundTrip: false,
    returnTime: Timestamp.fromDate(new Date()),
    returnDate: Timestamp.fromDate(new Date()),
    creator: "",
    currPpl: 0,
    ppl: [],
    recurringRide: false,
    recurrenceFrequency: "weekly",
    numOccurrences: "4",
  });

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

      if (rideData.destination === "") {
        console.log("no dest");
        error += "\nDestination is required.";
      }

      if (rideData.meetLoc === "") {
        error += "\nMeeting location is required.";
      }

      if (rideData.maxPpl < 2) {
        error += "\nMust allow 2 or more people (including yourself).";
      }

      const returnDateTime = mergeDateAndTime(
        rideData.returnDate.toDate(),
        rideData.returnTime.toDate(),
      );
      const dateTime = mergeDateAndTime(
        rideData.date.toDate(),
        rideData.time.toDate(),
      );

      if (rideData.roundTrip && returnDateTime <= dateTime) {
        error += "\nReturn must be after departure.";
      }

      if (
        rideData.recurringRide &&
        (Number(rideData.numOccurrences) < 1 ||
          Number(rideData.numOccurrences) > 52)
      ) {
        error += "\nNumber of occurrences must be between 1 and 52.";
      }

      if (error === "") {
        // Generate rides based on recurrence
        const ridesToCreate = rideData.recurringRide
          ? Number(rideData.numOccurrences)
          : 1;
        let currentDate = rideData.date.toDate();
        let currentReturnDate = rideData.returnDate.toDate();

        for (let i = 0; i < ridesToCreate; i++) {
          // send data to database
          const docRef = await addDoc(collection(db, "rides"), {
            destination: rideData.destination,
            date: new Date(currentDate),
            time: rideData.time.toDate(),
            meetLoc: rideData.meetLoc,
            maxPpl: rideData.maxPpl,
            gender: rideData.gender,
            luggage: rideData.luggage,
            roundTrip: rideData.roundTrip,
            returnTime: rideData.returnTime.toDate(),
            returnDate: new Date(currentReturnDate),
            creationTime: new Date(),
            currPpl: 1,
            creator: id,
            ppl: [id],
          });

          console.log("Ride stored with ID:", docRef.id);

          // Calculate next occurrence dates
          if (i < ridesToCreate - 1) {
            currentDate = getNextDate(
              currentDate,
              rideData.recurrenceFrequency,
            );
            if (rideData.roundTrip) {
              currentReturnDate = getNextDate(
                currentReturnDate,
                rideData.recurrenceFrequency,
              );
            }
          }
        }

        alert(
          (rideData.recurringRide
            ? `${ridesToCreate} rides saved!\n`
            : "Ride saved!\n") +
            rideData.destination +
            "\n" +
            rideData.date.toDate() +
            "\n" +
            rideData.time.toDate() +
            "\n" +
            rideData.meetLoc +
            "\n" +
            rideData.maxPpl +
            "\n" +
            (rideData.gender === "Co-ed" ? "Co-ed" : rideData.gender) +
            "\n" +
            (rideData.luggage ? "Luggage" : "No luggage") +
            "\n" +
            (rideData.roundTrip ? "Round Trip" : "One Way") +
            "\n" +
            rideData.returnDate.toDate() +
            "\n" +
            rideData.returnTime.toDate(),
        );

        // Reset form fields
        setRideData({
          destination: "",
          date: Timestamp.fromDate(new Date()),
          time: Timestamp.fromDate(new Date()),
          meetLoc: "",
          maxPpl: 0,
          gender: "Co-ed",
          luggage: false,
          roundTrip: false,
          returnTime: Timestamp.fromDate(new Date()),
          returnDate: Timestamp.fromDate(new Date()),
          creator: "",
          currPpl: 0,
          ppl: [],
          recurringRide: false,
          recurrenceFrequency: "weekly",
          numOccurrences: "4",
        });
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
          value={rideData.destination}
          setValue={(value) =>
            setRideData((prev) => ({ ...prev, destination: value }))
          }
        ></Input>
        <DateTimeInput
          label={"When are we leaving?"}
          dateValue={rideData.date.toDate()}
          timeValue={rideData.time.toDate()}
          setDateValue={(value) => {
            const date =
              typeof value === "function"
                ? (value as (prev: Date) => Date)(rideData.date.toDate())
                : value;
            setRideData((prev) => ({
              ...prev,
              date: Timestamp.fromDate(date),
            }));
          }}
          setTimeValue={(value) => {
            const time =
              typeof value === "function"
                ? (value as (prev: Date) => Date)(rideData.time.toDate())
                : value;
            setRideData((prev) => ({
              ...prev,
              time: Timestamp.fromDate(time),
            }));
          }}
        />
        <Input
          label={"Where to meet?"}
          defaultValue={"e.g. Commons Lawn"}
          value={rideData.meetLoc}
          setValue={(value) =>
            setRideData((prev) => ({ ...prev, meetLoc: value }))
          }
        ></Input>
        <Input
          label={"How many people (including you)?"}
          defaultValue={"e.g. 4"}
          value={String(rideData.maxPpl || "")}
          setValue={(value) =>
            setRideData((prev) => ({ ...prev, maxPpl: Number(value) || 0 }))
          }
        ></Input>
        <View>
          <Text style={styles.label}>What genders allowed?</Text>
          <Picker
            selectedValue={rideData.gender}
            dropdownIconColor="#e7e7e7"
            style={styles.picker}
            onValueChange={(itemValue) =>
              setRideData((prev) => ({ ...prev, gender: itemValue }))
            }
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
            value={rideData.luggage}
            onValueChange={(value) =>
              setRideData((prev) => ({ ...prev, luggage: value }))
            }
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={rideData.luggage ? "#81C784" : "#f4f3f4"}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Round Trip?</Text>
          <Switch
            testID="round-trip-switch"
            value={rideData.roundTrip}
            onValueChange={(value) =>
              setRideData((prev) => ({ ...prev, roundTrip: value }))
            }
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={rideData.roundTrip ? "#81C784" : "#f4f3f4"}
          />
        </View>
        {rideData.roundTrip && (
          <DateTimeInput
            label={"When are we returning?"}
            dateValue={rideData.returnDate.toDate()}
            timeValue={rideData.returnTime.toDate()}
            setDateValue={(value) => {
              const date =
                typeof value === "function"
                  ? (value as (prev: Date) => Date)(
                      rideData.returnDate.toDate(),
                    )
                  : value;
              setRideData((prev) => ({
                ...prev,
                returnDate: Timestamp.fromDate(date),
              }));
            }}
            setTimeValue={(value) => {
              const time =
                typeof value === "function"
                  ? (value as (prev: Date) => Date)(
                      rideData.returnTime.toDate(),
                    )
                  : value;
              setRideData((prev) => ({
                ...prev,
                returnTime: Timestamp.fromDate(time),
              }));
            }}
          />
        )}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Recurring Ride?</Text>
          <Switch
            testID="recurring-ride-switch"
            value={rideData.recurringRide}
            onValueChange={(value) =>
              setRideData((prev) => ({ ...prev, recurringRide: value }))
            }
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={rideData.recurringRide ? "#81C784" : "#f4f3f4"}
          />
        </View>
        {rideData.recurringRide && (
          <>
            <View>
              <Picker
                selectedValue={rideData.recurrenceFrequency}
                dropdownIconColor="#e7e7e7"
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setRideData((prev) => ({
                    ...prev,
                    recurrenceFrequency: itemValue,
                  }))
                }
              >
                <Picker.Item label="Repeat every day" value="daily" />
                <Picker.Item label="Repeat every week" value="weekly" />
                <Picker.Item label="Repeat every month" value="monthly" />
              </Picker>
            </View>
            <Input
              label={"How many occurrences?"}
              defaultValue={"e.g. 4"}
              value={rideData.numOccurrences}
              setValue={(value) =>
                setRideData((prev) => ({ ...prev, numOccurrences: value }))
              }
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
