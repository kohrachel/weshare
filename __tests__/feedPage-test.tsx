import React from "react";
import { render, act, fireEvent } from "@testing-library/react-native";
import FeedPage from "../app/feedPage"; // import AFTER mocks
import { getDocs, getDoc, collection, doc } from "firebase/firestore";

// Mock Firebase modules
jest.mock("@/firebaseConfig", () => ({ db: {} }));

jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));

// Mock all Firestore functions
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

// Mock React Native components
jest.mock("@/components/Footer", () => () => <></>);
jest.mock("@/components/FloatingActionButton", () => () => <></>);

jest.mock("@/components/Input", () => (props: any) => {
  const { View, TextInput } = require("react-native");
  return (
    <View>
      <TextInput
        testID="searchInput"
        value={props.value}
        placeholder={props.defaultValue}
        onChangeText={props.setValue}
      />
    </View>
  );
});

jest.mock("@/components/RidePost", () => (props: any) => {
  const { View } = require("react-native");
  return <View testID={`ride-${props.name}`} />;
});

// Sample rides and users
const flushPromises = () => new Promise(setImmediate);

const mockRideFuture = {
  id: "ride1",
  data: () => ({
    creator: "user1",
    destination: "Airport",
    date: { toDate: () => new Date("2099-12-10T10:00:00") },
    time: { toDate: () => new Date("2099-12-10T10:00:00") },
    currPpl: 2,
    maxPpl: 4,
  }),
};

const mockRidePast = {
  id: "ride2",
  data: () => ({
    creator: "user2",
    destination: "Downtown",
    date: { toDate: () => new Date("2000-01-01T08:00:00") },
    time: { toDate: () => new Date("2000-01-01T08:00:00") },
    currPpl: 1,
    maxPpl: 3,
  }),
};

const mockUserSnapshot = {
  exists: () => true,
  data: () => ({ name: "Alice" }),
};

describe("FeedPage - Full Branch Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading initially", async () => {
    (getDocs as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { queryByTestId } = render(<FeedPage />);
    expect(queryByTestId("ride-Alice")).toBeNull();
    await act(flushPromises);
  });

  test("renders future rides and skips past rides", async () => {
    (collection as jest.Mock).mockReturnValue("rides");
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [mockRideFuture, mockRidePast],
    });
    (doc as jest.Mock).mockReturnValue("userDocRef");
    (getDoc as jest.Mock).mockResolvedValue(mockUserSnapshot);

    const { queryByTestId } = render(<FeedPage />);
    await act(flushPromises);

    expect(queryByTestId("ride-Alice")).toBeTruthy();
    expect(queryByTestId("ride-user2")).toBeNull();
  });

  test.each([undefined, null, 12345])(
    "skips ride with invalid creator: %p",
    async (creator) => {
      const invalidRide = { id: "rideInvalid", data: () => ({ creator }) };
      (getDocs as jest.Mock).mockResolvedValue({ docs: [invalidRide] });
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnapshot);

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      render(<FeedPage />);
      await act(flushPromises);

      expect(consoleWarnSpy.mock.calls[0][0]).toContain(
        "invalid creator field:",
      );
      consoleWarnSpy.mockRestore();
    },
  );

  test("handles missing user document", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [mockRideFuture] });
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    render(<FeedPage />);
    await act(flushPromises);

    expect(consoleWarnSpy.mock.calls[0][0]).toContain("User doc not found");
    consoleWarnSpy.mockRestore();
  });

  test("handles getDoc throwing error", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [mockRideFuture] });
    (getDoc as jest.Mock).mockRejectedValue(new Error("Firestore error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    render(<FeedPage />);
    await act(flushPromises);

    expect(consoleErrorSpy.mock.calls[0][0]).toContain("Error fetching user");
    consoleErrorSpy.mockRestore();
  });

  test("handles top-level getDocs error", async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error("Network fail"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    render(<FeedPage />);
    await act(flushPromises);

    expect(consoleErrorSpy.mock.calls[0][0]).toContain("Error fetching rides:");
    consoleErrorSpy.mockRestore();
  });

  test("handles empty rides collection", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
    const { queryByTestId } = render(<FeedPage />);
    await act(flushPromises);
    expect(queryByTestId("ride-Alice")).toBeNull();
  });

  test("handles rides with missing fields", async () => {
    const incompleteRide = {
      id: "rideIncomplete",
      data: () => ({
        creator: "user3",
        // set future date/time so it passes the upcoming filter
        date: { toDate: () => new Date(Date.now() + 1000 * 60 * 60) },
        time: { toDate: () => new Date(Date.now() + 1000 * 60 * 60) },
      }),
    };
    const incompleteUser = { exists: () => true, data: () => ({}) };
    (getDocs as jest.Mock).mockResolvedValue({ docs: [incompleteRide] });
    (getDoc as jest.Mock).mockResolvedValue(incompleteUser);

    const { queryByTestId } = render(<FeedPage />);
    await act(flushPromises);

    expect(queryByTestId("ride-Inactive Account")).toBeTruthy();
  });

  describe("search filtering", () => {
    beforeEach(() => {
      (getDocs as jest.Mock).mockResolvedValue({ docs: [mockRideFuture] });
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnapshot);
    });

    test("filters by name", async () => {
      const { getByTestId, queryByTestId } = render(<FeedPage />);
      await act(flushPromises);
      fireEvent.changeText(getByTestId("searchInput"), "Alice");
      expect(queryByTestId("ride-Alice")).toBeTruthy();
    });

    test("filters by destination", async () => {
      const { getByTestId, queryByTestId } = render(<FeedPage />);
      await act(flushPromises);
      fireEvent.changeText(getByTestId("searchInput"), "Airport");
      expect(queryByTestId("ride-Alice")).toBeTruthy();
    });

    test("filters by partial date", async () => {
      const { getByTestId, queryByTestId } = render(<FeedPage />);
      await act(flushPromises);
      const dateWord = mockRideFuture.data().date.toDate().getDate().toString();
      fireEvent.changeText(getByTestId("searchInput"), dateWord);
      expect(queryByTestId("ride-Alice")).toBeTruthy();
    });

    test("filters by partial time", async () => {
      const { getByTestId, queryByTestId } = render(<FeedPage />);
      await act(flushPromises);
      const timeWord = mockRideFuture
        .data()
        .time.toDate()
        .getHours()
        .toString();
      fireEvent.changeText(getByTestId("searchInput"), timeWord);
      expect(queryByTestId("ride-Alice")).toBeTruthy();
    });

    test("filters with multiple spaces or empty string", async () => {
      const { getByTestId, queryByTestId } = render(<FeedPage />);
      await act(flushPromises);
      fireEvent.changeText(getByTestId("searchInput"), "   ");
      expect(queryByTestId("ride-Alice")).toBeTruthy();
    });

    test("renders no results indicator if search yields nothing", async () => {
      const { getByTestId, queryByTestId } = render(<FeedPage />);
      await act(flushPromises);
      fireEvent.changeText(getByTestId("searchInput"), "Nonexistent");
      expect(queryByTestId("ride-Alice")).toBeNull();
    });
  });
});
