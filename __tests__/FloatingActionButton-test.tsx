/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock dependencies
jest.mock("expo-router", () => ({
 useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
 Ionicons: jest.fn(() => null),
}));

describe("FloatingActionButton", () => {
 const mockNavigate = jest.fn();
 const mockUseRouter = useRouter as jest.Mock;

 beforeEach(() => {
   jest.clearAllMocks();
   mockUseRouter.mockReturnValue({ navigate: mockNavigate });
 });

 it("renders correctly with Ionicons", () => {
   const { UNSAFE_getByType } = render(<FloatingActionButton />);
   const touchable = UNSAFE_getByType(require("react-native").TouchableOpacity);

   expect(touchable).toBeTruthy();
   expect(Ionicons).toHaveBeenCalledWith(
     expect.objectContaining({
       name: "add",
       size: 28,
       color: "#fff",
     }),
     undefined
   );

   // Verify TouchableOpacity has the expected style
   expect(touchable.props.style).toEqual(
     expect.objectContaining({
       position: "absolute",
       bottom: 100,
       right: 24,
       borderRadius: 50,
       padding: 16,
       backgroundColor: "#529053",
       elevation: 5,
       zIndex: 10,
     })
   );
 });

 it("navigates to /createRide on press", () => {
   const { UNSAFE_getByType } = render(<FloatingActionButton />);
   const touchable = UNSAFE_getByType(require("react-native").TouchableOpacity);

   fireEvent.press(touchable);

   expect(mockNavigate).toHaveBeenCalledTimes(1);
   expect(mockNavigate).toHaveBeenCalledWith("/createRide");
 });
});
