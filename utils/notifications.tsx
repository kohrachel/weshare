/**
 Contributors
 Emma Reid: 5 hours
 */

import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// Global handler for how notifications behave when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Handles notification related errors
function handleRegistrationError(errorMessage: string) {
  // uses alert and not console.log because testing is done entirely on .apk
  alert(errorMessage);
  throw new Error(errorMessage);
}

// EXPORT THIS
export async function registerForPushNotificationsAsync() {
  // Android channel setup
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Device permission request
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notifications!"
      );
      return null;
    }

    // Project ID required for Expo tokens (not needed for local notifications, but harmless)
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }

    try {
      const token = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      console.log("Expo push token:", token);
      return token;
    } catch (e) {
      handleRegistrationError(String(e));
    }
  } else {
    handleRegistrationError("Must use a physical device for push notifications.");
  }
}

// Schedules a notification for 10 minutes before Date
export async function scheduleRideNotification(departsDate: Date) {
  const triggerTime = new Date(departsDate.getTime() - 10 * 60 * 1000);

  if (triggerTime <= new Date()) {
    console.log(
      "Skipping notification: departure is too soon or the time already passed."
    );
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

// Cancel the notification scheduled exactly 10 minutes before the given date/time.
export async function cancelRideNotification(targetDateTime: Date) {
  try {
    const tenMinutesBefore = new Date(targetDateTime.getTime() - 10 * 60 * 1000);

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    for (const notif of scheduled) {
      const trigger = notif.trigger;

      // ---- Case 1: Timestamp trigger ----
      if (typeof trigger === "number") {
        const triggerDate = new Date(trigger);

        if (Math.abs(triggerDate.getTime() - tenMinutesBefore.getTime()) < 1000) {
          // match within 1 second - likely necessary for current use cases,
          // but built in to work with as many other use cases as possible
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
          return true;
        }
      }

      // ---- Case 2: Calendar trigger object ----
      if (trigger && typeof trigger === "object" && "hour" in trigger) {
        const matches =
          trigger.year === tenMinutesBefore.getFullYear() &&
          trigger.month === tenMinutesBefore.getMonth() + 1 &&
          trigger.day === tenMinutesBefore.getDate() &&
          trigger.hour === tenMinutesBefore.getHours() &&
          trigger.minute === tenMinutesBefore.getMinutes();

        if (matches) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error("Error cancelling notification:", err);
    return false;
  }
}
