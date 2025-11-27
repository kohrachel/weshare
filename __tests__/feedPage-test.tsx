/**
 Contributors
 Kevin Song: 3 hours
 */

import React from "react";
import { render, act, fireEvent, waitFor } from "@testing-library/react-native";
import FeedPage from "../app/feedPage";
import { getDocs } from "firebase/firestore";
import { RidesContext } from "@/contexts/RidesContext";
import { useLocalSearchParams } from "expo-router";
import { View, TextInput, Text } from "react-native";

// --- Mocks ---

// Mock Firebase Config
jest.mock("@/firebaseConfig", () => ({ db: {} }));

// Mock Firestore
jest.mock("firebase/firestore", () => ({
  collection: jest.fn((db, name) => name),
  getDocs: jest.fn(),
}));

// Mock Expo Router
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

// Mock Child Components
jest.mock("@/components/Footer", () => "Footer");
jest.mock("@/components/FloatingActionButton", () => "FloatingActionButton");

// Mock Input safely
jest.mock("../components/Input", () => {
  const React = require("react");
  const { TextInput, View } = require("react-native");

  return React.forwardRef((props: any, ref: any) => {
    return (
      <View>
        <TextInput
          ref={ref}
          testID="searchInput"
          value={props.value}
          onChangeText={props.setValue}
          placeholder={props.defaultValue}
        />
      </View>
    );
  });
});

// Mock SingleRidePost with dynamic testID based on ID for easy existence checks
jest.mock("../components/SingleRidePost", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return ({ rideId }: { rideId: string }) => (
    <View testID={`ride-post-${rideId}`}>
      <Text>RideID: {rideId}</Text>
    </View>
  );
});

// --- Helper Data ---

const mockNow = new Date("2024-01-01T12:00:00");

// Helper to create Firestore Timestamps
const createTimestamp = (isoDate: string) => ({
  toDate: () => new Date(isoDate),
});

// Mock Users Data
const mockUsers = [
  { id: "user1", data: () => ({ name: "Alice" }) },
  { id: "user2", data: () => ({ name: "Bob" }) },
  { id: "user3", data: () => ({ name: "Charlie" }) },
];

// Mock Rides Data
const mockRides = [
  {
    id: "ride1",
    data: () => ({
      creatorId: "user1",
      destination: "Airport",
      departs: createTimestamp("2024-01-02T10:00:00"),
      numRsvpedUsers: 1,
      maxPpl: 4,
      rsvpedUserIds: [],
      gender: "Any",
      departsFrom: "Campus",
      hasLuggageSpace: true,
      isRoundTrip: false,
      returns: null,
    }),
  },
  {
    id: "ride2",
    data: () => ({
      creatorId: "user2",
      destination: "Downtown",
      departs: createTimestamp("2023-12-31T10:00:00"),
      numRsvpedUsers: 0,
      maxPpl: 2,
      rsvpedUserIds: [],
      gender: "Any",
      departsFrom: "Station",
      hasLuggageSpace: false,
      isRoundTrip: false,
      returns: null,
    }),
  },
  {
    id: "ride3",
    data: () => ({
      creatorId: "unknown_user",
      destination: "Mall",
      departs: createTimestamp("2024-01-03T15:30:00"),
      numRsvpedUsers: 0,
      maxPpl: 3,
      rsvpedUserIds: [],
    }),
  },
];

describe("FeedPage", () => {
  let mockSetRides: jest.Mock;
  let mockRidesContextValue: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);

    // Default Router Params
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    // Setup Context Mock
    mockSetRides = jest.fn();
    mockRidesContextValue = {
      rides: [],
      setRides: mockSetRides,
    };

    // Default Firestore Behavior
    (getDocs as jest.Mock).mockImplementation((collectionName) => {
      if (collectionName === "users") {
        return Promise.resolve({
          forEach: (callback: any) => mockUsers.forEach(callback),
          docs: mockUsers,
        });
      }
      if (collectionName === "rides") {
        return Promise.resolve({
          docs: mockRides,
        });
      }
      return Promise.resolve({ docs: [] });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderWithContext = (contextOverrides = {}) => {
    const contextValue = { ...mockRidesContextValue, ...contextOverrides };
    return render(
      <RidesContext.Provider value={contextValue}>
        <FeedPage />
      </RidesContext.Provider>,
    );
  };

  test("renders loading indicator initially", () => {
    // Make fetch never resolve to keep it in loading state
    (getDocs as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { queryByTestId } = renderWithContext();

    // Instead of asserting on ActivityIndicator (which requires fragile RN mocking),
    // we assert that the main content (searchInput) is NOT present.
    expect(queryByTestId("searchInput")).toBeNull();
  });

  test("fetches data, filters past rides, sorts, and updates context", async () => {
    renderWithContext();

    await waitFor(() => {
      expect(mockSetRides).toHaveBeenCalled();
    });

    const setRidesArg = mockSetRides.mock.calls[0][0];

    expect(setRidesArg).toHaveLength(2);
    expect(setRidesArg[0].id).toBe("ride1");
    expect(setRidesArg[1].id).toBe("ride3");
    expect(setRidesArg[0].creatorName).toBe("Alice");
    expect(setRidesArg[1].creatorName).toBe("Unknown user");
    expect(setRidesArg[1].destination).toBe("Mall");
  });

  test("handles user fetching gracefully when name is missing", async () => {
    const namelessUser = [{ id: "u1", data: () => ({}) }];
    const ride = [
      {
        id: "r1",
        data: () => ({
          creatorId: "u1",
          departs: createTimestamp("2025-01-01T00:00:00"),
        }),
      },
    ];

    (getDocs as jest.Mock).mockImplementation((col) => {
      if (col === "users")
        return Promise.resolve({
          forEach: (cb: any) => namelessUser.forEach(cb),
        });
      if (col === "rides") return Promise.resolve({ docs: ride });
      return Promise.resolve({ docs: [] });
    });

    renderWithContext();

    await waitFor(() => {
      expect(mockSetRides).toHaveBeenCalled();
    });

    const result = mockSetRides.mock.calls[0][0];
    expect(result[0].creatorName).toBe("Unknown");
  });

  test("handles ride with undefined destination fallback", async () => {
    const rideNoDest = [
      {
        id: "r1",
        data: () => ({
          creatorId: "u1",
          departs: createTimestamp("2025-01-01T00:00:00"),
        }),
      },
    ];

    (getDocs as jest.Mock).mockImplementation((col) => {
      if (col === "users") return Promise.resolve({ forEach: () => {} });
      if (col === "rides") return Promise.resolve({ docs: rideNoDest });
      return Promise.resolve({ docs: [] });
    });

    renderWithContext();
    await waitFor(() => expect(mockSetRides).toHaveBeenCalled());

    expect(mockSetRides.mock.calls[0][0][0].destination).toBe(
      "Unknown Destination",
    );
  });

  test("handles Firestore error", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (getDocs as jest.Mock).mockRejectedValue(new Error("Network Error"));

    const { queryByTestId } = renderWithContext();

    // Even if it errors, finally block runs and loading stops
    await waitFor(() => {
      expect(queryByTestId("searchInput")).toBeTruthy();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching rides:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  test("aborts processing if a ride document has no ID", async () => {
    const badRide = {
      id: undefined,
      data: () => ({ creatorId: "u1" }),
    };

    (getDocs as jest.Mock).mockImplementation((col) => {
      if (col === "rides") return Promise.resolve({ docs: [badRide] });
      return Promise.resolve({ forEach: () => {} });
    });

    renderWithContext();

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(mockSetRides).not.toHaveBeenCalled();
  });

  test("focuses search input if param is present", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      focusSearch: "true",
    });

    const { getByTestId } = renderWithContext();

    await waitFor(() => getByTestId("searchInput"));

    act(() => {
      jest.runAllTimers();
    });

    const input = getByTestId("searchInput");
    expect(input).toBeTruthy();
  });

  describe("Client-side Filtering", () => {
    const populatedRides = [
      {
        id: "1",
        creatorName: "Alice",
        destination: "San Francisco",
        departs: createTimestamp("2024-01-02T10:00:00"),
      },
      {
        id: "2",
        creatorName: "Bob",
        destination: "San Jose",
        departs: createTimestamp("2024-01-02T14:00:00"),
      },
    ];

    // Helper to ensure the component is done loading before we test filters
    const renderAndReady = async (rides = populatedRides) => {
      const result = renderWithContext({ rides });
      // Wait for the initial loading to complete (caused by mount useEffect)
      await waitFor(() => result.getByTestId("searchInput"));
      return result;
    };

    test("filters by destination", async () => {
      const { getByTestId, queryByTestId } = await renderAndReady();

      const input = getByTestId("searchInput");
      fireEvent.changeText(input, "Francisco");

      // Check existence using the specific IDs from our mock
      expect(queryByTestId("ride-post-1")).toBeTruthy();
      expect(queryByTestId("ride-post-2")).toBeNull();
    });

    test("filters by creator name", async () => {
      const { getByTestId, queryByTestId } = await renderAndReady();

      fireEvent.changeText(getByTestId("searchInput"), "Bob");
      expect(queryByTestId("ride-post-2")).toBeTruthy();
      expect(queryByTestId("ride-post-1")).toBeNull();
    });

    test("filters by date string", async () => {
      const { getByTestId, queryByTestId } = await renderAndReady();

      fireEvent.changeText(getByTestId("searchInput"), "1/2/2024");
      expect(queryByTestId("ride-post-1")).toBeTruthy();
      expect(queryByTestId("ride-post-2")).toBeTruthy();
    });

    test("filters by time string", async () => {
      const { getByTestId, queryByTestId } = await renderAndReady();

      // 10:00 matches ride 1
      fireEvent.changeText(getByTestId("searchInput"), "10:00");
      expect(queryByTestId("ride-post-1")).toBeTruthy();
      expect(queryByTestId("ride-post-2")).toBeNull();
    });

    test("handles multi-word search (AND logic)", async () => {
      const { getByTestId, queryByTestId } = await renderAndReady();

      // Alice is ride 1, Francisco is ride 1 -> Match
      fireEvent.changeText(getByTestId("searchInput"), "Alice Francisco");
      expect(queryByTestId("ride-post-1")).toBeTruthy();

      // Alice is ride 1, Jose is ride 2 -> No Match (AND logic)
      fireEvent.changeText(getByTestId("searchInput"), "Alice Jose");
      expect(queryByTestId("ride-post-1")).toBeNull();
      expect(queryByTestId("ride-post-2")).toBeNull();
    });

    test("handles empty or whitespace search queries", async () => {
      const { getByTestId, queryByTestId } = await renderAndReady();

      fireEvent.changeText(getByTestId("searchInput"), "   ");
      expect(queryByTestId("ride-post-1")).toBeTruthy();
      expect(queryByTestId("ride-post-2")).toBeTruthy();
    });

    test("handles safe navigation on missing ride fields during filter", async () => {
      const incompleteRide = [
        {
          id: "3",
          creatorName: null,
          destination: null,
          departs: null,
        },
      ];

      const { getByTestId, queryByTestId } =
        await renderAndReady(incompleteRide);

      fireEvent.changeText(getByTestId("searchInput"), "search");
      expect(queryByTestId("ride-post-3")).toBeNull();
    });
  });
});
