/**
 Contributors
 Emma Reid: 2 hours
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreateRide from "../app/createRide";
import * as SecureStore from "expo-secure-store";
import { addDoc, getDoc, doc, collection } from "firebase/firestore";

// Mocks
jest.mock("expo-secure-store");

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
}));

jest.mock("@/firebaseConfig", () => ({ db: {} }));

jest.mock("../components/button-green", () => ({
  ButtonGreen: ({ title, onPress }: any) => (
    <button onClick={onPress} testID="create-ride-button">
      {title}
    </button>
  ),
}));

jest.mock("@/components/Input", () => (props: any) => (
  <input
    testID={props.label}
    value={props.value}
    onChangeText={(text) => props.setValue(text)}
  />
));

jest.mock("@/components/DateTimeInput", () => (props: any) => (
  <div testID="datetime-input" />
));

jest.mock("../components/backbutton", () => () => <div />);

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
        expect.stringContaining("User id null")
      )
    );
  });

  it("throws error if user document not found", async () => {
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
    const { getByTestId } = render(<CreateRide />);
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("User not found")
      )
    );
  });

  it("throws error if destination empty", async () => {
    const { getByTestId } = render(<CreateRide />);
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Destination is required")
      )
    );
  });

  it("throws error if meeting location empty", async () => {
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "3");
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Meeting location is required")
      )
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
        expect.stringContaining("Must allow 2 or more people")
      )
    );
  });

  it("successfully creates a ride when all fields valid", async () => {
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "3");

    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith("mockCollectionRef", expect.objectContaining({
        destination: "Airport",
        meetLoc: "Commons Lawn",
        maxPpl: 3,
      }));
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Ride saved!")
      );
    });
  });

  it("resets all form fields after successful submission", async () => {
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "4");
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() => expect(global.alert).toHaveBeenCalled());
    expect(getByTestId("Where to?").props.value).toBe("");
    expect(getByTestId("Where to meet?").props.value).toBe("");
    expect(getByTestId("How many people (including you)?").props.value).toBe("");
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
        expect.stringContaining("Ride not saved")
      )
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
        expect.stringContaining("Ride not saved")
      )
    );
  });

  it("handles unexpected SecureStore rejection", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
      new Error("SecureStore failed")
    );
    const { getByTestId } = render(<CreateRide />);
    fireEvent.changeText(getByTestId("Where to?"), "Airport");
    fireEvent.changeText(getByTestId("Where to meet?"), "Commons Lawn");
    fireEvent.changeText(getByTestId("How many people (including you)?"), "3");
    fireEvent.press(getByTestId("create-ride-button"));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Ride not saved")
      )
    );
  });
});
