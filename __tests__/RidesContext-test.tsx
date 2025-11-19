/**
 Contributors
 Rachel Huiqi: 3 hours
 */

import { RidesContext, RidesProvider } from "@/contexts/RidesContext";
import { act, renderHook } from "@testing-library/react-native";
import { Timestamp } from "firebase/firestore";
import { useContext } from "react";

// Mock firebase/firestore
jest.mock("firebase/firestore", () => ({
  Timestamp: {
    fromDate: (date: Date) => ({ toDate: () => date }),
  },
}));

describe("RidesContext", () => {
  const mockRideData = {
    id: "ride1",
    creatorId: "user1",
    destination: "Airport",
    departs: { toDate: () => new Date("2025-12-01T10:00:00") } as Timestamp,
    numRsvpedUsers: 2,
    maxPpl: 4,
    rsvpedUserIds: ["user1", "user2"],
    gender: "Co-ed",
    departsFrom: "Parking Lot",
    hasLuggageSpace: true,
    isRoundTrip: false,
    returns: { toDate: () => new Date("2025-12-01T14:00:00") } as Timestamp,
  };

  const mockRideData2 = {
    id: "ride2",
    creatorId: "user3",
    destination: "Downtown",
    departs: { toDate: () => new Date("2025-12-02T14:00:00") } as Timestamp,
    numRsvpedUsers: 1,
    maxPpl: 3,
    rsvpedUserIds: ["user3"],
    gender: "Co-ed",
    departsFrom: "Main Street",
    hasLuggageSpace: false,
    isRoundTrip: false,
    returns: { toDate: () => new Date("2025-12-02T18:00:00") } as Timestamp,
  };

  test("provides initial empty rides array", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    expect(result.current.rides).toEqual([]);
  });

  test("setRides updates the rides array", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData]);
    });

    expect(result.current.rides).toEqual([mockRideData]);
    expect(result.current.rides.length).toBe(1);
  });

  test("setRides can update with multiple rides", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData, mockRideData2]);
    });

    expect(result.current.rides).toEqual([mockRideData, mockRideData2]);
    expect(result.current.rides.length).toBe(2);
  });

  test("getSingleRide returns correct ride by id", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData, mockRideData2]);
    });

    const ride = result.current.getSingleRide("ride1");
    expect(ride).toEqual(mockRideData);
    expect(ride?.id).toBe("ride1");
  });

  test("getSingleRide returns undefined for non-existent ride", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData]);
    });

    const ride = result.current.getSingleRide("nonexistent");
    expect(ride).toBeUndefined();
  });

  test("setSingleRide updates specific ride by id", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData, mockRideData2]);
    });

    act(() => {
      result.current.setSingleRide("ride1", { numRsvpedUsers: 3 });
    });

    const updatedRide = result.current.getSingleRide("ride1");
    expect(updatedRide?.currPpl).toBe(3);
    expect(updatedRide?.destination).toBe("Airport"); // Other fields unchanged
  });

  test("setSingleRide updates partial data correctly", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData]);
    });

    act(() => {
      result.current.setSingleRide("ride1", {
        rsvpedUserIds: ["user1", "user2", "user3"],
        numRsvpedUsers: 3,
      });
    });

    const updatedRide = result.current.getSingleRide("ride1");
    expect(updatedRide?.ppl).toEqual(["user1", "user2", "user3"]);
    expect(updatedRide?.currPpl).toBe(3);
    expect(updatedRide?.maxPpl).toBe(4); // Unchanged
  });

  test("setSingleRide does not affect other rides", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData, mockRideData2]);
    });

    act(() => {
      result.current.setSingleRide("ride1", { numRsvpedUsers: 3 });
    });

    const unchangedRide = result.current.getSingleRide("ride2");
    expect(unchangedRide).toEqual(mockRideData2);
  });

  test("setSingleRide with non-existent id does not crash", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData]);
    });

    act(() => {
      result.current.setSingleRide("nonexistent", { numRsvpedUsers: 5 });
    });

    // Should not crash and original ride should be unchanged
    const ride = result.current.getSingleRide("ride1");
    expect(ride?.currPpl).toBe(2);
  });

  test("setRides can be used with a function", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData]);
    });

    act(() => {
      result.current.setRides((prevRides) => [...prevRides, mockRideData2]);
    });

    expect(result.current.rides.length).toBe(2);
    expect(result.current.rides).toContainEqual(mockRideData);
    expect(result.current.rides).toContainEqual(mockRideData2);
  });

  test("getSingleRide works after multiple updates", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    act(() => {
      result.current.setRides([mockRideData]);
    });

    act(() => {
      result.current.setSingleRide("ride1", { numRsvpedUsers: 3 });
    });

    act(() => {
      result.current.setSingleRide("ride1", { numRsvpedUsers: 4 });
    });

    const ride = result.current.getSingleRide("ride1");
    expect(ride?.currPpl).toBe(4);
  });

  test("context provides all required functions", () => {
    const { result } = renderHook(() => useContext(RidesContext), {
      wrapper: RidesProvider,
    });

    expect(result.current.rides).toBeDefined();
    expect(result.current.setRides).toBeDefined();
    expect(result.current.getSingleRide).toBeDefined();
    expect(result.current.setSingleRide).toBeDefined();
    expect(typeof result.current.setRides).toBe("function");
    expect(typeof result.current.getSingleRide).toBe("function");
    expect(typeof result.current.setSingleRide).toBe("function");
  });
});
