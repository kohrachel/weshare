/**
 Contributors
 Emma Reid: 0.5 hours
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import ButtonGreen from "../components/buttonGreen";

describe("ButtonGreen", () => {
  it("renders correctly with title text", () => {
    const { getByText } = render(
      <ButtonGreen title="Press Me" onPress={jest.fn()} />,
    );

    const textElement = getByText("Press Me");
    expect(textElement).toBeTruthy();

    // Verify styling props on the text
    expect(textElement.props.style).toEqual(
      expect.objectContaining({
        color: "white",
        fontSize: 18,
        fontFamily: "Inter_700Bold",
      }),
    );
  });

  it("calls onPress when pressed", () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <ButtonGreen title="Click" onPress={mockPress} />,
    );
    const button = getByText("Click");

    fireEvent.press(button);

    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it("has correct container styling", () => {
    const { UNSAFE_getByType } = render(
      <ButtonGreen title="Test" onPress={jest.fn()} />,
    );

    // Verify TouchableOpacity style values
    const touchable = UNSAFE_getByType(
      require("react-native").TouchableOpacity,
    );
    expect(touchable.props.style[0]).toEqual(
      expect.objectContaining({
        alignItems: "center",
        backgroundColor: "#529053",
        borderRadius: 15,
        marginHorizontal: 10,
        padding: 10,
        width: "100%",
      }),
    );
  });

  it("applies disabled styling when disabled prop is true", () => {
    const { UNSAFE_getByType } = render(
      <ButtonGreen title="Test" onPress={jest.fn()} disabled={true} />,
    );

    // Verify TouchableOpacity has disabled style
    const touchable = UNSAFE_getByType(
      require("react-native").TouchableOpacity,
    );
    expect(touchable.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: "#5f5f5f",
      }),
    );
    expect(touchable.props.disabled).toBe(true);
    expect(touchable.props.accessibilityState.disabled).toBe(true);
  });
});
