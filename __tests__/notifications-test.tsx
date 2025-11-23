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
