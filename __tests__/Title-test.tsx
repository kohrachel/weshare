/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render } from "@testing-library/react-native";
import Title from "../Title";

// Mock BackButton so we can isolate Title rendering
jest.mock("../components/backbutton", () => () => <></>);

describe("Title", () => {
  it("renders correctly with text prop and matches snapshot", () => {
    const { getByText, toJSON } = render(<Title text="Page Title" />);

    // Verify that the text is displayed
    expect(getByText("Page Title")).toBeTruthy();

    // Snapshot captures layout including BackButton placeholder and spacer view
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders correctly without text prop", () => {
    const { queryByText, toJSON } = render(<Title />);

    // No text should be rendered
    expect(queryByText(/.+/)).toBeNull();

    // Snapshot captures layout
    expect(toJSON()).toMatchSnapshot();
  });
});
