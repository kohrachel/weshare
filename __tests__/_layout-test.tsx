/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import RootLayout from "../app/_layout";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "@expo-google-fonts/inter";

// Mocks
jest.mock("expo-router", () => ({
  Stack: ({ children }: any) => <>{children}</>,
}));

jest.mock("@expo-google-fonts/inter", () => ({
  useFonts: jest.fn(),
  Inter_400Regular: "mock-font-400",
  Inter_400Regular_Italic: "mock-font-400i",
  Inter_700Bold: "mock-font-700",
  Inter_700Bold_Italic: "mock-font-700i",
  Inter_900Black: "mock-font-900",
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders null while fonts are loading", () => {
    (Font.useFonts as jest.Mock).mockReturnValue([false, null]);
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });
});
