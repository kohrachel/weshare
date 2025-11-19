/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render } from "@testing-library/react-native";
import Footer from "../components/Footer";
import { Ionicons } from "@expo/vector-icons";

// Mock expo-router Link so it renders its children directly
jest.mock("expo-router", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: jest.fn(() => null),
}));

describe("Footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the footer with three icons", () => {
    const { toJSON, getByText } = render(<Footer />);

    // Verify all three labels are rendered
    expect(getByText("Home")).toBeTruthy();
    expect(getByText("Search")).toBeTruthy();
    expect(getByText("Profile")).toBeTruthy();

    // Verify Ionicons is called three times
    expect(Ionicons).toHaveBeenCalledTimes(3);

    // Snapshot to cover structure
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders icons with correct names, size, and color", () => {
    render(<Footer />);

    // Verify each icon is called with correct props
    expect(Ionicons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "home-outline",
        size: 28,
        color: "#4CAF50",
      }),
      undefined
    );

    expect(Ionicons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "search-outline",
        size: 28,
        color: "#4CAF50",
      }),
      undefined
    );

    expect(Ionicons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "person-outline",
        size: 28,
        color: "#4CAF50",
      }),
      undefined
    );
  });

  it("renders the footer wrapper and footer items with correct layout styles", () => {
    const { UNSAFE_getAllByType } = render(<Footer />);
    const views = UNSAFE_getAllByType(require("react-native").View);

    // There should be multiple View containers: wrapper, items, and one per Link group
    expect(views.length).toBeGreaterThanOrEqual(2);

    const footerWrapper = views[0];
    const footerItems = views[1];

    expect(footerWrapper.props.style).toEqual(
      expect.objectContaining({
        position: "absolute",
        bottom: 0,
        backgroundColor: "#181818",
      })
    );

    expect(footerItems.props.style).toEqual(
      expect.objectContaining({
        flexDirection: "row",
        justifyContent: "space-between",
      })
    );
  });
});
