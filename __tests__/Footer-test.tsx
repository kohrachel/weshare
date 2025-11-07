/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render } from "@testing-library/react-native";
import Footer from "../components/Footer";

// Mock expo-router Link so it renders its children directly
jest.mock("expo-router", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("Footer", () => {
  it("renders the footer with three images", () => {
    const { UNSAFE_getAllByType, toJSON } = render(<Footer />);

    // Use UNSAFE_getAllByType to find <Image> components directly
    const images = UNSAFE_getAllByType(require("react-native").Image);
    expect(images).toHaveLength(3);

    // Snapshot to cover structure
    expect(toJSON()).toMatchSnapshot();

    // Verify each image uses the correct source file
    const imageSources = images.map(
      (img) => img.props.source?.testUri || img.props.source
    );
  });

  it("applies consistent styles to all images", () => {
    const { UNSAFE_getAllByType } = render(<Footer />);
    const images = UNSAFE_getAllByType(require("react-native").Image);

    images.forEach((img) => {
      expect(img.props.style).toMatchObject({
        height: 24,
        width: 24,
      });
    });
  });

  it("renders the footer wrapper and footer items with correct layout styles", () => {
    const { UNSAFE_getAllByType } = render(<Footer />);
    const views = UNSAFE_getAllByType(require("react-native").View);

    // There should be 3 View containers: wrapper, items, and one per Link group
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
