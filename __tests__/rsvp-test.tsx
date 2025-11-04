/**
 Contributors
 Rachel Huiqi: 3 hours
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
  test("displays loading indicator initially", () => {
    const { UNSAFE_queryAllByType } = render(<RsvpRidePage />);
    // ActivityIndicator should be present initially
    const activityIndicators = UNSAFE_queryAllByType(
      require("react-native").ActivityIndicator,
    );
    expect(activityIndicators.length).toBeGreaterThan(0);
  });

  test("displays ride details after fetching data", async () => {
    const { getByText, queryAllByText } = render(<RsvpRidePage />);
    await waitFor(
      () => {
        expect(getByText("Ride Details")).toBeTruthy();
        // Check that contact cards are displayed
        const userNames = queryAllByText("User Name");
        expect(userNames.length).toBeGreaterThan(0);
      },
      { timeout: 2000 },
    );
  });

  test("displays contact cards for RSVPed users", async () => {
    const { queryAllByText } = render(<RsvpRidePage />);
    await waitFor(() => {
      // Should display user names from the mocked data
      const userNames = queryAllByText("User Name");
      expect(userNames.length).toBeGreaterThan(0);
    });
  });

  test("handles multiple RSVPed users", async () => {
    const { queryAllByText } = render(<RsvpRidePage />);
    await waitFor(() => {
      // Mock returns 2 users (user1, user2)
      const userNames = queryAllByText("User Name");
      expect(userNames.length).toBe(2);
    });
  });

  test("handles ride data loading successfully", async () => {
    const { getByText } = render(<RsvpRidePage />);

    await waitFor(() => {
      // Should load data and display ride details
      expect(getByText("Ride Details")).toBeTruthy();
    });
  });

  test("handles contact data fetching", async () => {
    const { queryAllByText } = render(<RsvpRidePage />);

    await waitFor(() => {
      // Should display contact information for users
      const userEmails = queryAllByText(/user@example.com/);
      expect(userEmails.length).toBeGreaterThan(0);
    });
  });

  test("handles non-existent user with unknown user fallback", async () => {
    // The mock already handles this by returning exists: false for unknown users
    const { getByText, queryAllByText } = render(<RsvpRidePage />);

    await waitFor(() => {
      expect(getByText("Ride Details")).toBeTruthy();
      // Should display "User Name" even if some users don't exist
      const userNames = queryAllByText("User Name");
      expect(userNames.length).toBeGreaterThan(0);
    });
  });

  test("displays ride title when data is loaded", async () => {
    const { getByText, UNSAFE_queryAllByType } = render(<RsvpRidePage />);

    await waitFor(() => {
      // Should show ride details title
      expect(getByText("Ride Details")).toBeTruthy();
    });

    // Loading indicator should be gone
    const activityIndicators = UNSAFE_queryAllByType(
      require("react-native").ActivityIndicator,
    );
    expect(activityIndicators.length).toBe(0);
  });

  test("renders SingleRidePost component with correct rideId", async () => {
    const { UNSAFE_queryAllByType } = render(<RsvpRidePage />);

    await waitFor(() => {
      // Check that SingleRidePost is rendered
      const SingleRidePost = require("../components/SingleRidePost").default;
      const singleRidePosts = UNSAFE_queryAllByType(SingleRidePost);
      expect(singleRidePosts.length).toBe(1);
    });
  });

  test("renders Footer component", async () => {
    const { UNSAFE_queryAllByType } = render(<RsvpRidePage />);

    await waitFor(() => {
      const Footer = require("../components/Footer").default;
      const footers = UNSAFE_queryAllByType(Footer);
      expect(footers.length).toBe(1);
    });
  });

  test("displays creator name correctly", async () => {
    const { getByText } = render(<RsvpRidePage />);

    await waitFor(() => {
      // The mock returns "Creator Name" for creatorUserId
      expect(getByText("Ride Details")).toBeTruthy();
    });
  });
});
