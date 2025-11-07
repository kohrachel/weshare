/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BackButton from "../components/backbutton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mocks
jest.mock("expo-router", () => ({
 useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
 Ionicons: jest.fn(() => null),
}));

// Tests
describe("BackButton", () => {
 const mockBack = jest.fn();
 const mockUseRouter = useRouter as jest.Mock;

 beforeEach(() => {
   jest.clearAllMocks();
   mockUseRouter.mockReturnValue({ back: mockBack });
 });

 it("renders correctly", () => {
   const { getByTestId } = render(<BackButton />);
   const button = getByTestId("back-button");
   expect(button).toBeTruthy();
   expect(Ionicons).toHaveBeenCalledWith(
     expect.objectContaining({
       name: "arrow-back",
       size: 28,
       color: "#529053",
     }),
     undefined
   );
 });

 it("calls custom onPress when provided", () => {
   const customPress = jest.fn();
   const { getByTestId } = render(<BackButton onPress={customPress} />);
   const button = getByTestId("back-button");

   fireEvent.press(button);

   expect(customPress).toHaveBeenCalledTimes(1);
   expect(mockBack).not.toHaveBeenCalled();
 });

 it("calls router.back when onPress not provided", () => {
   const { getByTestId } = render(<BackButton />);
   const button = getByTestId("back-button");

   fireEvent.press(button);

   expect(mockBack).toHaveBeenCalledTimes(1);
 });

 it("does not crash if onPress is not a function", () => {
   const { getByTestId } = render(<BackButton onPress={123 as any} />);
   const button = getByTestId("back-button");

   fireEvent.press(button);

   expect(mockBack).toHaveBeenCalledTimes(1);
 });
});
