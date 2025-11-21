/**
 Contributors
 Emma Reid: 12 hours
 Rachel Huiqi: 6 hours
 */

import ButtonGreen from "@/components/buttonGreen";
import DateTimeInput from "@/components/DateTimeInput";
import Input from "@/components/Input";
import { db } from "@/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import { addDoc, collection, doc, getDoc, Timestamp } from "firebase/firestore";
import React, { useState, useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Switch, Text, View, Button, Platform } from "react-native";
import Title from "../components/Title";
import { RideDataType } from "./rsvp";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export type AllowedGenders = "Co-ed" | "Female" | "Male";
type RecurrenceFrequency = "daily" | "weekly" | "monthly";

type RideFormData = Omit<RideDataType, "id" | "departs" | "returns"> & {
  isRecurringRide: boolean;
  recurrenceFrequency: RecurrenceFrequency;
  numOccurrences: string;
};

//////////////////// Notification Logic Functions //////////////////////////////////////
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

async function scheduleRideNotification(departsDate: Date) {
  // 10 minutes before
  const triggerTime = new Date(departsDate.getTime() - 10 * 60 * 1000);

  // If the trigger time is already passed, skip scheduling
  if (triggerTime <= new Date()) {
    console.log("Skipping notification: departure is too soon or time already passed");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming Ride Reminder 🚗",
      body: "Your ride is coming up in 10 minutes!",
      sound: "default",
      data: { type: "ride-reminder" },
    },
    trigger: triggerTime,
  });

  console.log("Notification scheduled for:", triggerTime.toString());
}

//////////////////// End of Notification Logic Functions //////////////////////////////////////

export default function CreateRide() {
  // Local state for date and time inputs (to prevent overriding each other)
  const [departDate, setDepartDate] = useState(new Date());
  const [departTime, setDepartTime] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [returnTime, setReturnTime] = useState(new Date());
  const [expoPushToken, setExpoPushToken] = useState('');

  // Setup notifications
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));
  }, []);

  const [rideData, setRideData] = useState<RideFormData>({
    destination: "",
    departsFrom: "",
    maxPpl: 0,
    gender: "Co-ed",
    hasLuggageSpace: false,
    isRoundTrip: false,
    creatorId: "",
    numRsvpedUsers: 0,
    rsvpedUserIds: [],
    isRecurringRide: false,
    recurrenceFrequency: "weekly",
    numOccurrences: "4",
  });

  // Merges the date part of one timestamp with the time part of another timestamp
  // Date and time are two separate fields and are picked separately so need to be put together
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

  // Produces a date a specified time (daily/weekly/monthly) after the input date
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

  // Validates and pushes a new ride to the Firebase,
  // or multiple rides if a recurring schedule is set
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

      if (rideData.departsFrom === "") {
        error += "\nMeeting location is required.";
      }

      if (rideData.maxPpl < 2) {
        error += "\nMust allow 2 or more people (including yourself).";
      }

      const returnDateTime = mergeDateAndTime(returnDate, returnTime);
      const departDateTime = mergeDateAndTime(departDate, departTime);

      if (rideData.isRoundTrip && returnDateTime <= departDateTime) {
        error += "\nReturn must be after departure.";
      }

      if (
        rideData.isRecurringRide &&
        (Number(rideData.numOccurrences) < 1 ||
          Number(rideData.numOccurrences) > 52)
      ) {
        error += "\nNumber of occurrences must be between 1 and 52.";
      }

      if (error === "") {
        // Generate rides based on recurrence
        const ridesToCreate = rideData.isRecurringRide
          ? Number(rideData.numOccurrences)
          : 1;
        let currentDepartDate = new Date(departDate);
        let currentReturnDate = new Date(returnDate);

        for (let i = 0; i < ridesToCreate; i++) {
          // Merge date and time for departs and returns timestamps
          const departsDate = mergeDateAndTime(currentDepartDate, departTime);
          const returnsDate = mergeDateAndTime(currentReturnDate, returnTime);

          // send data to database
          const docRef = await addDoc(collection(db, "rides"), {
            destination: rideData.destination,
            departs: Timestamp.fromDate(departsDate),
            departsFrom: rideData.departsFrom,
            maxPpl: rideData.maxPpl,
            gender: rideData.gender,
            hasLuggageSpace: rideData.hasLuggageSpace,
            isRoundTrip: rideData.isRoundTrip,
            returns: Timestamp.fromDate(returnsDate),
            creationTime: new Date(),
            numRsvpedUsers: 1,
            creatorId: id,
            rsvpedUserIds: [id],
          });

          console.log("Ride stored with ID:", docRef.id);

          // Calculate next occurrence dates
          if (i < ridesToCreate - 1) {
            currentDepartDate = getNextDate(
              currentDepartDate,
              rideData.recurrenceFrequency,
            );
            if (rideData.isRoundTrip) {
              currentReturnDate = getNextDate(
                currentReturnDate,
                rideData.recurrenceFrequency,
              );
            }
          }

          // set notifications here within recurring ride creation loop
          await scheduleRideNotification(departsDate);
        }

        alert(
          (rideData.isRecurringRide
            ? `${ridesToCreate} rides saved!\n`
            : "Ride saved!\n") +
            rideData.destination +
            "\n" +
            departDate +
            "\n" +
            departTime +
            "\n" +
            rideData.departsFrom +
            "\n" +
            rideData.maxPpl +
            "\n" +
            (rideData.gender === "Co-ed" ? "Co-ed" : rideData.gender) +
            "\n" +
            (rideData.hasLuggageSpace ? "Luggage" : "No luggage") +
            "\n" +
            (rideData.isRoundTrip ? "Round Trip" : "One Way") +
            "\n" +
            returnDate +
            "\n" +
            returnTime,
        );

        // Reset form fields
        setDepartDate(new Date());
        setDepartTime(new Date());
        setReturnDate(new Date());
        setReturnTime(new Date());
        setRideData({
          destination: "",
          departsFrom: "",
          maxPpl: 0,
          gender: "Co-ed",
          hasLuggageSpace: false,
          isRoundTrip: false,
          creatorId: "",
          numRsvpedUsers: 0,
          rsvpedUserIds: [],
          isRecurringRide: false,
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
          dateValue={departDate}
          timeValue={departTime}
          setDateValue={setDepartDate}
          setTimeValue={setDepartTime}
        />
        <Input
          label={"Where to meet?"}
          defaultValue={"e.g. Commons Lawn"}
          value={rideData.departsFrom}
          setValue={(value) =>
            setRideData((prev) => ({ ...prev, departsFrom: value }))
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
            value={rideData.hasLuggageSpace}
            onValueChange={(value) =>
              setRideData((prev) => ({ ...prev, hasLuggageSpace: value }))
            }
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={rideData.hasLuggageSpace ? "#81C784" : "#f4f3f4"}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Round Trip?</Text>
          <Switch
            testID="round-trip-switch"
            value={rideData.isRoundTrip}
            onValueChange={(value) =>
              setRideData((prev) => ({ ...prev, isRoundTrip: value }))
            }
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={rideData.isRoundTrip ? "#81C784" : "#f4f3f4"}
          />
        </View>
        {rideData.isRoundTrip && (
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
            value={rideData.isRecurringRide}
            onValueChange={(value) =>
              setRideData((prev) => ({ ...prev, isRecurringRide: value }))
            }
            trackColor={{ false: "#555", true: "#4CAF50" }}
            thumbColor={rideData.isRecurringRide ? "#81C784" : "#f4f3f4"}
          />
        </View>
        {rideData.isRecurringRide && (
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
