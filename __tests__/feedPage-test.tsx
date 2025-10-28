import FeedPage from "@/app/feedPage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";

describe("<FeedPage />", () => {
  it("renders loading indicator initially", () => {
    const { getByTestId } = render(<FeedPage />);

    // Assert that the loading indicator is shown initially
    expect(getByTestId("loading-indicator")).not.toBeNull();
  });

  it("renders ride posts once loaded", async () => {
    const { queryByText } = render(<FeedPage />);

    // Wait for loading to finish and rides to render
    await waitFor(() => {
      expect(queryByText("Inactive Account")).toBeTruthy();
    });
  });
});
