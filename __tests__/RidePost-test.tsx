/**
 Contributors
 Emma Reid: 2 hours
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RidePost from "@/components/RidePost"; // adjust path if different
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { formatDate, formatTime } from "@/utils";

// Mocks
jest.mock("@/utils", () => ({
  formatDate: jest.fn((date) => `formatted-${date.toDateString?.() || "invalid"}`),
  formatTime: jest.fn((time) => `formatted-${time.toTimeString?.() || "invalid"}`),
}));

const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useRoute: jest.fn(),
}));

// Mock ButtonGreen so we can simulate presses
jest.mock("../components/buttonGreen", () => {
  return ({ title, onPress }: { title: string; onPress: () => void }) => {
    return (
      <button testID={`button-${title}`} onClick={onPress}>
        {title}
      </button>
    );
  };
});

describe("RidePost", () => {
  const baseProps = {
    name: "Alice",
    destination: "Nashville",
    departureDate: new Date("2025-01-01T10:00:00Z"),
    departureTime: new Date("2025-01-01T10:00:00Z"),
    currentPeople: 2,
    maxPeople: 4,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ navigate: mockNavigate });
  });

  it("renders correctly when route is not rsvp and triggers navigate", () => {
    (useRoute as jest.Mock).mockReturnValue({ name: "home" });

    const { getByText, getByTestId } = render(<RidePost {...baseProps} />);

    expect(getByText("Alice")).toBeTruthy();
    expect(getByText("Destination:")).toBeTruthy();
    expect(getByText("Nashville")).toBeTruthy();

    // Check formatted date/time usage
    expect(formatDate).toHaveBeenCalledWith(baseProps.departureDate);
    expect(formatTime).toHaveBeenCalledWith(baseProps.departureTime);

    // Check seats
    expect(getByText("2 / 4")).toBeTruthy();

    // "RSVP" button logs to console
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    fireEvent.press(getByTestId("button-RSVP"));
    expect(logSpy).toHaveBeenCalledWith("RSVP pressed!");
    logSpy.mockRestore();

    // "More Info" button triggers navigation
    fireEvent.press(getByTestId("button-More Info"));
    expect(mockNavigate).toHaveBeenCalledWith("/rsvp");
  });

  it("renders correctly when route is rsvp (no More Info button)", () => {
    (useRoute as jest.Mock).mockReturnValue({ name: "rsvp" });

    const { queryByTestId, getByTestId } = render(<RidePost {...baseProps} />);
    expect(getByTestId("button-RSVP")).toBeTruthy();
    expect(queryByTestId("button-More Info")).toBeNull();
  });

  it("uses default date/time when invalid", () => {
    (useRoute as jest.Mock).mockReturnValue({ name: "home" });

    const { getByText } = render(
      <RidePost
        {...baseProps}
        // @ts-expect-error intentionally invalid
        departureDate={null}
        // @ts-expect-error intentionally invalid
        departureTime={"invalid"}
      />
    );

    // Should call formatDate and formatTime with default new Date objects
    expect(formatDate).toHaveBeenCalled();
    expect(formatTime).toHaveBeenCalled();

    // Still renders fallback formatted strings
    expect(getByText(/formatted/)).toBeTruthy();
  });
});
