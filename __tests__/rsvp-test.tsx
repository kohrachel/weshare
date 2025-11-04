/**
 Contributors
 Rachel Huiqi: 1 hour
 */

import RsvpRidePage from "@/app/rsvp";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock expo-router primitives used by Footer
jest.mock("expo-router", () => {
  const React = require("react");
  const MockLink: React.FC<{ href: string; children: React.ReactNode }> = ({
    children,
  }) => React.createElement("MockLink", null, children);
  return {
    Link: MockLink,
    useRouter: () => ({
      navigate: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    }),
    useRoute: () => ({ params: { rideId: "testRideId" } }),
  };
});

// Mock @react-navigation/native useRoute (RSVP uses it)
jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({
    params: { rideId: "testRideId" },
  }),
}));

// Mock firebase config so the SDK isn't initialized in tests
jest.mock("@/firebaseConfig", () => require("../__mocks__/firebaseConfig.js"));

// Fully mock firebase/firestore without requireActual (avoids ESM import issue)
jest.mock("firebase/firestore", () => {
  // Minimal Firestore mock matching the API used in RSVP
  const Timestamp = {
    // Provide a minimal shape if your code references Timestamp methods elsewhere
    fromDate: (date: Date) => ({ toDate: () => date }),
  };

  const doc = (...args: string[]) => ({ __path: args.join("/") });

  const getDoc = async (ref: { __path: string }) => {
    const path = ref?.__path ?? "";
    if (path.includes("/rides/")) {
      return {
        exists: () => true,
        data: () => ({
          creator: "creatorUserId",
          destination: "Test Destination",
          date: { toDate: () => new Date("2025-11-03T10:00:00Z") },
          time: { toDate: () => new Date("2025-11-03T12:00:00Z") },
          currPpl: 2,
          maxPpl: 4,
          ppl: ["user1", "user2"],
        }),
      };
    }
    if (path.includes("/users/")) {
      const isCreator = path.endsWith("creatorUserId");
      return {
        exists: () => true,
        data: () => ({
          name: isCreator ? "Creator Name" : "User Name",
          gender: "Not set",
          phone: "1234567890",
          email: isCreator ? "creator@example.com" : "user@example.com",
        }),
      };
    }
    return { exists: () => false, data: () => null };
  };

  return { Timestamp, doc, getDoc };
});

describe("<RSVP />", () => {
  test("displays ride details after fetching data", async () => {
    const { getByText } = render(<RsvpRidePage />);
    await waitFor(() => {
      expect(getByText("Ride Details")).toBeTruthy();
      expect(getByText("Test Destination")).toBeTruthy();
    });
  });

  test("when rideId is missing, warns and uses fallback rideId", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.isolateModules(() => {
      jest.doMock("@react-navigation/native", () => ({
        useRoute: () => ({ params: {} }),
      }));
      render(<RsvpRidePage />);
    });
    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        "Deprecated: Accessing RSVP page from index.",
      );
    });
    warnSpy.mockRestore();
  });
});
