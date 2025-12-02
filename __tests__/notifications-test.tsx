/**
 Contributors
 Emma Reid: 1 hour
 */

  import { registerForPushNotificationsAsync, scheduleRideNotification, cancelRideNotification } from "../utils/notifications";

  // Mocks
  jest.mock("react-native", () => ({
    Platform: { OS: "android" },
  }));

  jest.mock("expo-device", () => ({
    isDevice: true,
  }));

  let mockScheduled: any[] = [];

  jest.mock("expo-notifications", () => ({
    AndroidImportance: { MAX: 5 },
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
    getExpoPushTokenAsync: jest.fn(() =>
      Promise.resolve({ data: "test-token-123" })
    ),
    scheduleNotificationAsync: jest.fn((input) => {
      mockScheduled.push({
        identifier: "id-" + mockScheduled.length,
        trigger: input.trigger,
      });
      return Promise.resolve();
    }),
    getAllScheduledNotificationsAsync: jest.fn(() =>
      Promise.resolve(mockScheduled)
    ),
    cancelScheduledNotificationAsync: jest.fn((id) => {
      mockScheduled = mockScheduled.filter((n) => n.identifier !== id);
      return Promise.resolve();
    }),
  }));

  jest.mock("expo-constants", () => ({
    expoConfig: { extra: { eas: { projectId: "proj-123" } } },
  }));

  global.alert = jest.fn();

  console.error = jest.fn();
  console.log = jest.fn();

  beforeEach(() => {
    mockScheduled = [];
    jest.clearAllMocks();
  });

  // Test registerForPushNotificationsAsync
  describe("registerForPushNotificationsAsync", () => {
    it("returns a token when permissions granted", async () => {
      const token = await registerForPushNotificationsAsync();
      expect(token).toBe("test-token-123");
    });

    it("requests permissions if not already granted", async () => {
      const Notifications = require("expo-notifications");
      Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: "denied" });
      Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: "granted" });

      const token = await registerForPushNotificationsAsync();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(token).toBe("test-token-123");
    });

    it("throws and alerts when permission is denied", async () => {
      const Notifications = require("expo-notifications");
      Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: "denied" });
      Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: "denied" });

      await expect(registerForPushNotificationsAsync()).rejects.toThrow(
        "Permission not granted to get push token for push notifications!"
      );

      expect(global.alert).toHaveBeenCalledWith(
        "Permission not granted to get push token for push notifications!"
      );
    });

    it("handles getExpoPushTokenAsync error", async () => {
      const Notifications = require("expo-notifications");
      Notifications.getExpoPushTokenAsync.mockRejectedValueOnce("explode");

      await expect(registerForPushNotificationsAsync()).rejects.toThrow("explode");
      expect(global.alert).toHaveBeenCalledWith("explode");
    });

    it("throws error when project ID is missing", async () => {
      const Constants = require("expo-constants");
      const originalConfig = Constants.expoConfig;
      Constants.expoConfig = { extra: { eas: {} } };
      Constants.easConfig = undefined;

      await expect(registerForPushNotificationsAsync()).rejects.toThrow(
        "Project ID not found"
      );

      expect(global.alert).toHaveBeenCalledWith("Project ID not found");

      // Reset for other tests
      Constants.expoConfig = originalConfig;
    });

    it("sets up Android notification channel on Android platform", async () => {
      const Notifications = require("expo-notifications");
      const Platform = require("react-native").Platform;
      Platform.OS = "android";

      await registerForPushNotificationsAsync();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        "default",
        expect.objectContaining({
          name: "default",
          importance: 5,
        })
      );
    });

    it("skips Android channel setup on iOS platform", async () => {
      const Notifications = require("expo-notifications");
      const Platform = require("react-native").Platform;
      Platform.OS = "ios";

      jest.clearAllMocks();
      await registerForPushNotificationsAsync();

      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();

      // Reset for other tests
      Platform.OS = "android";
    });

  });


  // test scheduleRideNotification
  describe("scheduleRideNotification", () => {
    it("schedules a notification 10 minutes before", async () => {
      const depart = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes in future

      await scheduleRideNotification(depart);

      expect(mockScheduled.length).toBe(1);
      const trigger = mockScheduled[0].trigger as Date;
      expect(trigger.getTime()).toBeCloseTo(
        depart.getTime() - 10 * 60 * 1000,
        -1
      );
    });

    it("skips scheduling if time already passed", async () => {
      const depart = new Date(Date.now() + 1 * 60 * 1000);

      await scheduleRideNotification(depart);

      expect(mockScheduled.length).toBe(0);
      expect(console.log).toHaveBeenCalled();
    });
  });


  // test cancelRideNotification
  describe("cancelRideNotification", () => {
    it("cancels a matching timestamp notification", async () => {
      const target = new Date(Date.now() + 30 * 60 * 1000);
      const tenBefore = new Date(target.getTime() - 10 * 60 * 1000);

      mockScheduled.push({
        identifier: "id-1",
        trigger: tenBefore.getTime(),
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(true);
      expect(mockScheduled.length).toBe(0);
    });

    it("cancels a matching calendar-trigger notification", async () => {
      const target = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const tenBefore = new Date(target.getTime() - 10 * 60 * 1000);

      mockScheduled.push({
        identifier: "id-2",
        trigger: {
          year: tenBefore.getFullYear(),
          month: tenBefore.getMonth() + 1,
          day: tenBefore.getDate(),
          hour: tenBefore.getHours(),
          minute: tenBefore.getMinutes(),
        },
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(true);
      expect(mockScheduled.length).toBe(0);
    });

    it("cancels a matching date trigger with type and value (Expo format)", async () => {
      const target = new Date(Date.now() + 30 * 60 * 1000);
      const tenBefore = new Date(target.getTime() - 10 * 60 * 1000);

      mockScheduled.push({
        identifier: "id-date-trigger",
        trigger: {
          type: "date",
          value: tenBefore.getTime(),
          channelId: null,
          repeats: false,
        },
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(true);
      expect(mockScheduled.length).toBe(0);
    });

    it("cancels date trigger within 60 second tolerance", async () => {
      const target = new Date(Date.now() + 30 * 60 * 1000);
      const tenBefore = new Date(target.getTime() - 10 * 60 * 1000);
      const slightlyOff = new Date(tenBefore.getTime() + 30000); // 30 seconds off

      mockScheduled.push({
        identifier: "id-tolerance",
        trigger: {
          type: "date",
          value: slightlyOff.getTime(),
          channelId: null,
          repeats: false,
        },
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(true);
      expect(mockScheduled.length).toBe(0);
    });

    it("does not cancel date trigger outside 60 second tolerance", async () => {
      const target = new Date(Date.now() + 30 * 60 * 1000);
      const tenBefore = new Date(target.getTime() - 10 * 60 * 1000);
      const wayOff = new Date(tenBefore.getTime() + 120000); // 2 minutes off

      mockScheduled.push({
        identifier: "id-no-match",
        trigger: {
          type: "date",
          value: wayOff.getTime(),
          channelId: null,
          repeats: false,
        },
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(false);
      expect(mockScheduled.length).toBe(1);
    });

    it("does not cancel timestamp trigger outside 60 second tolerance", async () => {
      const target = new Date(Date.now() + 30 * 60 * 1000);
      const tenBefore = new Date(target.getTime() - 10 * 60 * 1000);
      const wayOff = new Date(tenBefore.getTime() + 120000); // 2 minutes off

      mockScheduled.push({
        identifier: "id-timestamp-no-match",
        trigger: wayOff.getTime(),
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(false);
      expect(mockScheduled.length).toBe(1);
    });

    it("skips non-matching calendar trigger", async () => {
      const target = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const tenBefore = new Date(target.getTime() - 10 * 60 * 1000);
      const different = new Date(tenBefore.getTime() + 60 * 60 * 1000); // 1 hour different

      mockScheduled.push({
        identifier: "id-calendar-no-match",
        trigger: {
          year: different.getFullYear(),
          month: different.getMonth() + 1,
          day: different.getDate(),
          hour: different.getHours(),
          minute: different.getMinutes(),
        },
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(false);
      expect(mockScheduled.length).toBe(1);
    });

    it("handles multiple notifications and cancels the correct one", async () => {
      const target = new Date(Date.now() + 30 * 60 * 1000);
      const tenBefore = new Date(target.getTime() - 10 * 60 * 1000);

      // Add multiple notifications
      mockScheduled.push({
        identifier: "id-wrong-1",
        trigger: {
          type: "date",
          value: Date.now() + 5000,
          channelId: null,
          repeats: false,
        },
      });

      mockScheduled.push({
        identifier: "id-correct",
        trigger: {
          type: "date",
          value: tenBefore.getTime(),
          channelId: null,
          repeats: false,
        },
      });

      mockScheduled.push({
        identifier: "id-wrong-2",
        trigger: {
          type: "date",
          value: Date.now() + 999999,
          channelId: null,
          repeats: false,
        },
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(true);
      expect(mockScheduled.length).toBe(2);
      expect(mockScheduled.find(n => n.identifier === "id-correct")).toBeUndefined();
    });

    it("returns false when no match found", async () => {
      const target = new Date(Date.now() + 60 * 60 * 1000);
      mockScheduled.push({
        identifier: "id-3",
        trigger: new Date(Date.now() + 99999),
      });

      const result = await cancelRideNotification(target);
      expect(result).toBe(false);
    });

    it("returns false on internal error", async () => {
      const Notifications = require("expo-notifications");
      Notifications.getAllScheduledNotificationsAsync.mockRejectedValueOnce(
        new Error("bad")
      );

      const res = await cancelRideNotification(new Date());
      expect(res).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
