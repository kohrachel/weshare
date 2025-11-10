/**
 Contributors
 Emma Reid: 2 hours
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RidePost from "../components/RidePost";
import { ButtonGreen } from "../components/buttonGreen";

// Mock formatDate and formatTime utils
jest.mock("@/utils", () => ({
  formatDate: jest.fn((date) => `formatted-${date.getTime()}`),
  formatTime: jest.fn((date) => `time-${date.getTime()}`),
}));

// Mock navigation hooks
const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

let mockRouteName = "home";
jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({ name: mockRouteName }),
}));

// Mock ButtonGreen so we can inspect its props
jest.mock("../components/buttonGreen", () => ({
  ButtonGreen: jest.fn(({ title, onPress }) => (
    <button title={title} onClick={onPress} />
  )),
}));

describe("RidePost", () => {
  const baseProps = {
    name: "Kevin Song",
    destination: "BNA Airport",
    departureDate: new Date(2025, 0, 1, 10, 30),
    departureTime: new Date(2025, 0, 1, 10, 30),
    currentPeople: 2,
    maxPeople: 4,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly and matches snapshot (non-rsvp route)", () => {
    mockRouteName = "home";
    const { getByText, toJSON } = render(<RidePost {...baseProps} />);

    // Header text and details
    expect(getByText("Kevin Song")).toBeTruthy();
    expect(getByText("Destination: ")).toBeTruthy();
    expect(getByText("BNA Airport")).toBeTruthy();
    expect(getByText("Departure: ")).toBeTruthy();
    expect(getByText("Seats: ")).toBeTruthy();
    expect(getByText("2 / 4")).toBeTruthy();

    // Buttons
    expect(ButtonGreen).toHaveBeenCalledTimes(2);

    const calls = ButtonGreen.mock.calls.map(call => call[0]); // extract first argument (props)
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "RSVP" }),
        expect.objectContaining({ title: "More Info" }),
      ])
    );

    // Snapshot for layout and text consistency
    expect(toJSON()).toMatchSnapshot();
  });

  it("navigates to /rsvp when 'More Info' pressed", () => {
    mockRouteName = "home";
    render(<RidePost {...baseProps} />);
    // Get the call for the "More Info" button
    const moreInfoCall = (ButtonGreen as jest.Mock).mock.calls.find(
      (call) => call[0].title === "More Info"
    );
    // Trigger the onPress manually
    moreInfoCall[0].onPress();
    expect(mockNavigate).toHaveBeenCalledWith("/rsvp");
  });

  it("renders without 'More Info' button on RSVP route", () => {
    mockRouteName = "rsvp";
    render(<RidePost {...baseProps} />);
    // Should only have one ButtonGreen call (RSVP)
    const calls = (ButtonGreen as jest.Mock).mock.calls.map((c) => c[0].title);
    expect(calls).toEqual(["RSVP"]);
  });

  it("handles invalid departureDate and departureTime gracefully", () => {
    mockRouteName = "home";
    const { getByText } = render(
      <RidePost
        {...baseProps}
        // Pass invalid values to trigger fallback branches
        departureDate={null as any}
        departureTime={"not-a-date" as any}
      />
    );

    // Should still render with fallback new Dates
    expect(getByText("Departure: ")).toBeTruthy();

    // Verify fallback caused formatDate/formatTime to be called with new Date
    expect(require("@/utils").formatDate).toHaveBeenCalled();
    expect(require("@/utils").formatTime).toHaveBeenCalled();
  });
});
