/**
 Contributors
 Emma Reid: 2 hours
 */

import SingleRidePost from "@/components/SingleRidePost";
import { RidesContext } from "@/contexts/RidesContext";
import { UserContext } from "@/contexts/UserContext";
import { useRoute } from "@react-navigation/native";
import {
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

// Mock firebase/firestore with Timestamp implementation
const mockTimestamp = {
  toDate: jest.fn(() => new Date("2025-01-15T10:00:00")),
  seconds: 1736938800,
  nanoseconds: 0,
};

const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn();
const mockArrayRemove = jest.fn((val) => ({
  _methodName: "arrayRemove",
  _elements: [val],
}));
const mockArrayUnion = jest.fn((val) => ({
  _methodName: "arrayUnion",
  _elements: [val],
}));
const mockIncrement = jest.fn((val) => ({
  _methodName: "increment",
  _operand: val,
}));

jest.mock("firebase/firestore", () => ({
  getDoc: (...args: any[]) => mockGetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  arrayRemove: (...args: any[]) => mockArrayRemove(...args),
  arrayUnion: (...args: any[]) => mockArrayUnion(...args),
  increment: (...args: any[]) => mockIncrement(...args),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}));

// Mock dependencies
jest.mock("@/firebaseConfig", () => ({
  db: {},
}));
jest.mock("@react-navigation/native");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/utils", () => ({
  formatDate: jest.fn((date) => "01/15/2025"),
  formatTime: jest.fn((date) => "10:00 AM"),
}));

describe("SingleRidePost", () => {
  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockRoute = {
    name: "home",
  };

  const mockGetSingleRide = jest.fn();
  const mockSetSingleRide = jest.fn();
  const mockUserId = "user123";

  const mockRideData = {
    destination: "Mountain Peak",
    departs: {
      toDate: () => new Date("2025-01-15T10:00:00"),
      seconds: 1736938800,
      nanoseconds: 0,
    },
    departsFrom: "Parking Lot A",
    gender: "Co-ed",
    numRsvpedUsers: 3,
    maxPpl: 5,
    rsvpedUserIds: ["user456", "user789"],
    creatorId: "creator123",
    hasLuggageSpace: true,
    isRoundTrip: false,
    returns: {
      toDate: () => new Date("2025-01-15T14:00:00"),
      seconds: 1736952400,
      nanoseconds: 0,
    },
  };

  const mockUserData = {
    name: "John Doe",
    gender: "Male",
  };

  const mockCreatorData = {
    name: "Jane Smith",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useRoute as jest.Mock).mockReturnValue(mockRoute);
    mockGetSingleRide.mockReturnValue(mockRideData);
    mockDoc.mockImplementation((db, collection, id) => ({
      path: `${collection}/${id}`,
    }));
  });

  const renderComponent = (
    rideId: string = "ride123",
    userId: string | null = mockUserId,
    getSingleRide = mockGetSingleRide,
    setSingleRide = mockSetSingleRide,
  ) => {
    return render(
      <UserContext.Provider value={{ userId, setUserId: jest.fn() }}>
        <RidesContext.Provider
          value={{
            getSingleRide,
            setSingleRide,
            rides: [],
            setRides: jest.fn(),
          }}
        >
          <SingleRidePost rideId={rideId} />
        </RidesContext.Provider>
      </UserContext.Provider>,
    );
  };

  describe("Loading States", () => {
    it("should render loading state when ride data is not available", () => {
      mockGetSingleRide.mockReturnValue(null);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });
      const { getByText } = renderComponent();
      expect(getByText("Loading...")).toBeTruthy();
    });

    it("should render loading for creator name initially", () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });
      const { getByText } = renderComponent();
      expect(getByText("Created by: Loading...")).toBeTruthy();
    });
  });

  describe("Ride Information Display", () => {
    beforeEach(() => {
      mockGetDoc.mockImplementation((docRef) => {
        if (docRef.path?.includes("users/user123")) {
          return Promise.resolve({
            exists: () => true,
            data: () => mockUserData,
          });
        }
        if (docRef.path?.includes("users/creator123")) {
          return Promise.resolve({
            exists: () => true,
            data: () => mockCreatorData,
          });
        }
        return Promise.resolve({
          exists: () => false,
        });
      });
    });

    it("should render ride destination", () => {
      const { getByText } = renderComponent();
      expect(getByText("Mountain Peak")).toBeTruthy();
    });

    it("should render departure date and time", () => {
      const { getByText } = renderComponent();
      expect(getByText("01/15/2025 @ 10:00 AM")).toBeTruthy();
    });

    it("should render meeting location", () => {
      const { getByText } = renderComponent();
      expect(getByText("Parking Lot A")).toBeTruthy();
    });

    it("should render Co-ed gender restriction", () => {
      const { getByText } = renderComponent();
      expect(getByText("Co-ed")).toBeTruthy();
    });

    it("should render gender-specific restriction", () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        gender: "Male",
      });
      const { getByText } = renderComponent();
      expect(getByText("Male only ride")).toBeTruthy();
    });

    it("should render capacity", () => {
      const { getByText } = renderComponent();
      expect(getByText("3 / 5 seats taken")).toBeTruthy();
    });

    it("should fetch and render creator name", async () => {
      const { getByText } = renderComponent();
      await waitFor(() => {
        // The creator name appears in "Created by: Jane Smith"
        expect(getByText(/Created by: Jane Smith/)).toBeTruthy();
      });
    });
  });

  describe("User Data Fetching", () => {
    it("should fetch user data when userId is provided", async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });

      renderComponent();

      await waitFor(() => {
        expect(mockGetDoc).toHaveBeenCalled();
      });
    });

    it("should not fetch user data when userId is null", async () => {
      renderComponent("ride123", null);
      await waitFor(() => {
        // Check that getDoc was not called with a user document path
        const calls = mockGetDoc.mock.calls;
        const userDocCalls = calls.filter((call) =>
          call[0]?.path?.includes("users/null"),
        );
        expect(userDocCalls.length).toBe(0);
      });
    });

    it("should handle non-existent user document", async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const { getByText } = renderComponent();
      expect(getByText("Mountain Peak")).toBeTruthy();
    });
  });

  describe("Creator Info Fetching", () => {
    it("should handle non-existent creator document", async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const { getByText } = renderComponent();
      await waitFor(() => {
        expect(getByText("Created by: Loading...")).toBeTruthy();
      });
    });

    it("should not fetch creator info when ride data has no creator", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        creatorId: undefined,
      });

      renderComponent();
      // Should not crash and should render other info
      expect(mockGetSingleRide).toHaveBeenCalled();
    });
  });

  describe("Ride Data Fetching from Firebase", () => {
    it("should fetch ride data from Firestore on mount", async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockRideData,
      });

      renderComponent();

      await waitFor(() => {
        expect(mockSetSingleRide).toHaveBeenCalledWith("ride123", mockRideData);
      });
    });

    it("should handle non-existent ride document", async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      renderComponent();

      await waitFor(() => {
        expect(mockGetDoc).toHaveBeenCalled();
      });
    });

    it("should not fetch when rideId is empty", () => {
      renderComponent("");
      // Should not crash
      expect(mockGetSingleRide).toHaveBeenCalled();
    });
  });

  describe("RSVP Functionality", () => {
    beforeEach(() => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });
      mockUpdateDoc.mockResolvedValue(undefined);
    });

    it("should show RSVP button when user is not RSVPed", () => {
      const { getByText } = renderComponent();
      expect(getByText("RSVP to this ride")).toBeTruthy();
    });

    it("should show RSVPed button when user is already RSVPed", () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        rsvpedUserIds: ["user123", "user456"],
      });
      const { getByText } = renderComponent();
      expect(getByText("RSVPed")).toBeTruthy();
    });

    it("should handle RSVP when user is not RSVPed", async () => {
      const { getByText } = renderComponent();
      const rsvpButton = getByText("RSVP to this ride");

      fireEvent.press(rsvpButton);

      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalled();
        expect(mockSetSingleRide).toHaveBeenCalledWith("ride123", {
          rsvpedUserIds: ["user456", "user789", "user123"],
          numRsvpedUsers: 4,
        });
      });
    });

    it("should handle un-RSVP when user is already RSVPed", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        rsvpedUserIds: ["user123", "user456", "user789"],
        numRsvpedUsers: 3,
      });

      const { getByText } = renderComponent();
      const rsvpButton = getByText("RSVPed");

      fireEvent.press(rsvpButton);

      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalled();
        expect(mockSetSingleRide).toHaveBeenCalledWith("ride123", {
          rsvpedUserIds: ["user456", "user789"],
          numRsvpedUsers: 2,
        });
      });
    });

    it("should not RSVP when userId is null", async () => {
      const { getByText } = renderComponent("ride123", null);
      const rsvpButton = getByText("RSVP to this ride");

      fireEvent.press(rsvpButton);

      await waitFor(() => {
        expect(mockUpdateDoc).not.toHaveBeenCalled();
      });
    });

    it("should not RSVP when rideId is empty", async () => {
      const { getByText } = renderComponent("");

      // Component should render with loading or ride data
      await waitFor(() => {
        const buttons = getByText("RSVP to this ride", { exact: false });
        if (buttons) {
          fireEvent.press(buttons);
        }
      });
    });
  });

  describe("RSVP Button Disabled States", () => {
    beforeEach(() => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });
    });

    it("should disable RSVP when ride is full and user is not RSVPed", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        numRsvpedUsers: 5,
        maxPpl: 5,
        rsvpedUserIds: ["user456", "user789", "user111", "user222", "user333"],
      });

      const { getByText, UNSAFE_getAllByType } = renderComponent();

      await waitFor(() => {
        const rsvpText = getByText("Ride is full");
        // Find the TouchableOpacity that contains this text
        const buttons = UNSAFE_getAllByType(TouchableOpacity);
        const rsvpButton = buttons.find((btn) => {
          try {
            within(btn).getByText("Ride is full");
            return true;
          } catch {
            return false;
          }
        });
        expect(rsvpButton?.props.disabled).toBe(true);
      });
    });

    it("should not disable RSVP when ride is full but user is RSVPed", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        numRsvpedUsers: 5,
        maxPpl: 5,
        rsvpedUserIds: ["user123", "user456", "user789", "user111", "user222"],
      });

      const { getByText, UNSAFE_getAllByType } = renderComponent();

      await waitFor(() => {
        const rsvpText = getByText("RSVPed");
        const buttons = UNSAFE_getAllByType(TouchableOpacity);
        const rsvpButton = buttons.find((btn) => {
          try {
            within(btn).getByText("RSVPed");
            return true;
          } catch {
            return false;
          }
        });
        expect(rsvpButton?.props.disabled).toBe(false);
      });
    });

    it("should disable RSVP when gender restriction does not match", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        gender: "Female",
      });
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockUserData, gender: "Male" }),
      });

      const { getByText, UNSAFE_getAllByType } = renderComponent();

      await waitFor(() => {
        const rsvpText = getByText("Female only ride");
        const buttons = UNSAFE_getAllByType(TouchableOpacity);
        const rsvpButton = buttons.find((btn) => {
          try {
            within(btn).getByText("Female only ride");
            return true;
          } catch {
            return false;
          }
        });
        expect(rsvpButton?.props.disabled).toBe(true);
      });
    });

    it("should not disable RSVP for Co-ed rides", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        gender: "Co-ed",
      });

      const { getByText, UNSAFE_getAllByType } = renderComponent();

      await waitFor(() => {
        const rsvpText = getByText("RSVP to this ride");
        const buttons = UNSAFE_getAllByType(TouchableOpacity);
        const rsvpButton = buttons.find((btn) => {
          try {
            within(btn).getByText("RSVP to this ride");
            return true;
          } catch {
            return false;
          }
        });
        expect(rsvpButton?.props.disabled).toBe(false);
      });
    });

    it("should handle undefined maxPpl when checking capacity", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        maxPpl: undefined,
        numRsvpedUsers: 10,
      });

      const { getByText, UNSAFE_getAllByType } = renderComponent();

      await waitFor(() => {
        const rsvpText = getByText("Ride is full");
        const buttons = UNSAFE_getAllByType(TouchableOpacity);
        const rsvpButton = buttons.find((btn) => {
          try {
            within(btn).getByText("Ride is full");
            return true;
          } catch {
            return false;
          }
        });
        expect(rsvpButton?.props.disabled).toBe(true);
      });
    });

    it("should handle undefined userData", async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        gender: "Male",
      });

      const { getByText, UNSAFE_getAllByType } = renderComponent();
      await waitFor(() => {
        const rsvpText = getByText("Male only ride");
        const buttons = UNSAFE_getAllByType(TouchableOpacity);
        const rsvpButton = buttons.find((btn) => {
          try {
            within(btn).getByText("Male only ride");
            return true;
          } catch {
            return false;
          }
        });
        expect(rsvpButton?.props.disabled).toBe(true);
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to rsvp page when card is pressed", () => {
      const { getByText } = renderComponent();
      const card = getByText("Mountain Peak").parent?.parent?.parent;

      if (card) {
        fireEvent.press(card);
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          "/rsvp?rideId=ride123",
        );
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle ride with empty ppl array", () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        rsvpedUserIds: [],
        numRsvpedUsers: 0,
      });

      const { getByText } = renderComponent();
      expect(getByText("0 / 5 seats taken")).toBeTruthy();
    });

    it("should handle ride with undefined ppl array when RSVPing", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        rsvpedUserIds: undefined,
        numRsvpedUsers: 0,
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      const { getByText } = renderComponent();
      const rsvpButton = getByText("RSVP to this ride");

      fireEvent.press(rsvpButton);

      await waitFor(() => {
        expect(mockSetSingleRide).toHaveBeenCalledWith("ride123", {
          rsvpedUserIds: ["user123"],
          numRsvpedUsers: 1,
        });
      });
    });

    it("should handle ride with undefined currPpl when un-RSVPing", async () => {
      mockGetSingleRide.mockReturnValue({
        ...mockRideData,
        rsvpedUserIds: ["user123"],
        numRsvpedUsers: undefined,
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      const { getByText } = renderComponent();
      const rsvpButton = getByText("RSVPed");

      fireEvent.press(rsvpButton);

      await waitFor(() => {
        expect(mockSetSingleRide).toHaveBeenCalledWith("ride123", {
          rsvpedUserIds: [],
          numRsvpedUsers: -1,
        });
      });
    });

    it("should handle userId being null in isUserRsvped check", () => {
      const { getByText } = renderComponent("ride123", null);
      expect(getByText("RSVP to this ride")).toBeTruthy();
    });
  });
});
