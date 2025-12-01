/**
 Contributors
 Emma Reid: 3.5 hours
 Rachel Huiqi: 1 hour
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { addDoc, collection, getDoc } from "firebase/firestore";
import React from "react";
import CreateRide from "../app/createRide";

// Mocks
jest.mock("expo-secure-store");

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}));

jest.mock("@/firebaseConfig", () => ({ db: {} }));

jest.mock("../components/buttonGreen", () => {
  return ({ title, onPress }: any) => (
    <button onClick={onPress} testID="create-ride-button">
      {title}
    </button>
  );
});

jest.mock("@/components/Input", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return React.forwardRef((props: any, ref: any) => {
    return (
      <TextInput
        ref={ref}
        testID={props.label}
        value={props.value}
        onChangeText={(text: string) => {
          if (props.setValue) {
            props.setValue(text);
          }
        }}
      />
    );
  });
});

jest.mock("@/components/DateTimeInput", () => {
  return function MockDateTimeInput(props: any) {
    const isReturn = props.label?.includes("returning");
    return (
      <div testID={`datetime-${props.label}`}>
        <button
          testID={`date-button-${props.label}`}
          onClick={() =>
            props.setDateValue(
              new Date(
                isReturn ? "2025-01-02T00:00:00" : "2025-01-01T00:00:00",
              ),
            )
          }
        >
          Set Date
        </button>
        <button
          testID={`time-button-${props.label}`}
          onClick={() =>
            props.setTimeValue(
              new Date(
                isReturn ? "2025-01-01T18:00:00" : "2025-01-01T12:00:00",
              ),
            )
          }
        >
          Set Time
        </button>
      </div>
    );
  };
});

jest.mock("../components/backbutton", () => () => <div />);

jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");
  return {
    Picker: ({ selectedValue, onValueChange, children }: any) => (
      <>
        <Text testID="gender-picker">{selectedValue}</Text>
        {React.Children.map(children, (child) => (
          <TouchableOpacity
            onPress={() => onValueChange(child.props.value)}
            testID={`picker-${child.props.value}`}
          >
            <Text>{child.props.label}</Text>
          </TouchableOpacity>
        ))}
      </>
    ),
    PickerItem: ({ label }: any) => <Text>{label}</Text>,
  };
});

global.alert = jest.fn();
global.console = { ...console, error: jest.fn(), log: jest.fn() };

// Tests
describe("CreateRide Ride Creation Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("user123");
    (collection as jest.Mock).mockReturnValue("mockCollectionRef");
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
    (addDoc as jest.Mock).mockResolvedValue({ id: "ride123" });
    (global.alert as jest.Mock).mockClear();
  });

  it("renders all main input fields and button", () => {
    const { getByText, getByTestId } = render(<CreateRide />);
    expect(getByText("Create a Ride")).toBeTruthy();
    expect(getByTestId("Where to?")).toBeTruthy();
    expect(getByTestId("Where to meet?")).toBeTruthy();
    expect(getByTestId("How many people (including you)?")).toBeTruthy();
    expect(getByTestId("create-ride-button")).toBeTruthy();
  });

  it("throws error if SecureStore returns empty ID", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("");
    const { getByTestId } = render(<CreateRide />);
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("User id null"),
      ),
    );
  });

  it("throws error if user document not found", async () => {
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
    const { getByTestId } = render(<CreateRide />);
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("User not found"),
      ),
    );
  });

  it("throws error if destination empty", async () => {
    const { getByTestId } = render(<CreateRide />);
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Destination is required"),
      ),
    );
  });

  it("throws error if meeting location empty", async () => {
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "3");
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Meeting location is required"),
      ),
    );
  });

  it("throws error if number of people < 2", async () => {
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "1");
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Must allow 2 or more people"),
      ),
    );
  });

  it("successfully creates a ride when all fields valid", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "3",
      );
    });

    // Wait a bit for state to settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(
      () => {
        expect(addDoc).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    expect(addDoc).toHaveBeenCalledWith(
      "mockCollectionRef",
      expect.objectContaining({
        destination: "Airport",
        departsFrom: "Commons Lawn",
        maxPpl: 3,
      }),
    );
    expect(global.alert).toHaveBeenCalledWith(
      expect.stringContaining("Ride saved!"),
    );
  });

  it("resets all form fields after successful submission", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "4",
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() => expect(global.alert).toHaveBeenCalled());
    expect(getByTestId("Where to?").props.value).toBe("");
    expect(getByTestId("Where to meet?").props.value).toBe("");
    expect(getByTestId("How many people (including you)?").props.value).toBe(
      "",
    );
  });

  it("handles thrown error during addDoc (DB failure)", async () => {
    (addDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"));
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "3");
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Ride not saved"),
      ),
    );
  });

  it("handles unexpected error thrown by getDoc", async () => {
    (getDoc as jest.Mock).mockRejectedValueOnce(new Error("getDoc failed"));
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "3");

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Ride not saved"),
      ),
    );
  });

  it("handles unexpected SecureStore rejection", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
      new Error("SecureStore failed"),
    );
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "3");
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Ride not saved"),
      ),
    );
  });

  it("updates gender when Picker value changes", async () => {
    const { getByTestId } = render(<CreateRide />);
    fireEvent.press(getByTestId("picker-Female"));
    await waitFor(() => {
      expect(getByTestId("gender-picker").children[0]).toBe("Female");
    });
  });

  it("toggles switches correctly", async () => {
    const { getByTestId } = render(<CreateRide />);
    const luggageSwitch = getByTestId("luggage-switch");
    const roundTripSwitch = getByTestId("round-trip-switch");
    expect(luggageSwitch.props.value).toBe(false);
    expect(roundTripSwitch.props.value).toBe(false);
    fireEvent(luggageSwitch, "valueChange", true);
    fireEvent(roundTripSwitch, "valueChange", true);
    await waitFor(() => {
      expect(luggageSwitch.props.value).toBe(true);
      expect(roundTripSwitch.props.value).toBe(true);
    });
  });

  it("includes gender and luggage values in addDoc payload", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "3",
      );
    });

    fireEvent.press(getByTestId("picker-Male"));

    // Trigger date and time setters
    fireEvent.press(getByTestId("date-button-When are we leaving?"));
    fireEvent.press(getByTestId("time-button-When are we leaving?"));

    fireEvent(getByTestId("luggage-switch"), "valueChange", true);
    fireEvent(getByTestId("round-trip-switch"), "valueChange", false);

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        "mockCollectionRef",
        expect.objectContaining({
          destination: "Airport",
          departsFrom: "Commons Lawn",
          maxPpl: 3,
          gender: "Male",
          hasLuggageSpace: true,
          isRoundTrip: false,
        }),
      );
    });
  });

  it("throws error if return time is before departure time for round trip", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "3",
      );
    });

    // Enable round trip
    fireEvent(getByTestId("round-trip-switch"), "valueChange", true);

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Return must be after departure"),
      ),
    );
  });

  it("throws error if recurring ride occurrences is less than 1", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "3",
      );
    });

    // Enable recurring ride
    fireEvent(getByTestId("recurring-ride-switch"), "valueChange", true);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("How many occurrences?"), "0");
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining(
          "Number of occurrences must be between 1 and 52",
        ),
      ),
    );
  });

  it("throws error if recurring ride occurrences is greater than 52", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "3",
      );
    });

    // Enable recurring ride
    fireEvent(getByTestId("recurring-ride-switch"), "valueChange", true);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("How many occurrences?"), "100");
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining(
          "Number of occurrences must be between 1 and 52",
        ),
      ),
    );
  });

  it("creates multiple rides for weekly recurring ride", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "3",
      );
    });

    // Enable recurring ride
    fireEvent(getByTestId("recurring-ride-switch"), "valueChange", true);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("How many occurrences?"), "3");
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(3);
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("3 rides saved!"),
      );
    });
  });

  it("creates recurring rides with daily frequency", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "3",
      );
    });

    // Enable recurring ride
    fireEvent(getByTestId("recurring-ride-switch"), "valueChange", true);

    // Change frequency to daily
    fireEvent.press(getByTestId("picker-daily"));

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("How many occurrences?"), "2");
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(2);
    });
  });

  it("creates recurring rides with monthly frequency", async () => {
    const { getByTestId } = render(<CreateRide />);

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("Where to?"), "Airport");
      fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
      fireEvent.changeText(
        getByTestId("How many people (including you)?"),
        "3",
      );
    });

    // Enable recurring ride
    fireEvent(getByTestId("recurring-ride-switch"), "valueChange", true);

    // Change frequency to monthly
    fireEvent.press(getByTestId("picker-monthly"));

    await waitFor(async () => {
      fireEvent.changeText(getByTestId("How many occurrences?"), "2");
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(2);
    });
  });

  it("shows recurring ride inputs when recurring ride switch is enabled", () => {
    const { getByTestId, getByText } = render(<CreateRide />);

    // Enable recurring ride
    fireEvent(getByTestId("recurring-ride-switch"), "valueChange", true);

    // Check that recurring ride inputs are visible
    expect(getByText("Repeat every day")).toBeTruthy();
    expect(getByTestId("How many occurrences?")).toBeTruthy();
  });

  it("shows return date/time inputs when round trip switch is enabled", () => {
    const { getByTestId, queryByTestId } = render(<CreateRide />);

    // Initially, return date/time input should not be visible
    expect(queryByTestId("datetime-When are we returning?")).toBeNull();

    // Enable round trip
    fireEvent(getByTestId("round-trip-switch"), "valueChange", true);

    // Check that return date/time input is now visible
    expect(getByTestId("datetime-When are we returning?")).toBeTruthy();
  });
});
