/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Input from "../Input";

describe("Input", () => {
 it("renders correctly with a label and matches snapshot", () => {
   const mockSetValue = jest.fn();
   const { getByText, getByPlaceholderText, toJSON } = render(
     <Input
       label="Email"
       value="test@example.com"
       setValue={mockSetValue}
       defaultValue="Enter email"
     />
   );

   // Label should render
   expect(getByText("Email")).toBeTruthy();

   // TextInput should render with correct value and placeholder
   const input = getByPlaceholderText("Enter email");
   expect(input.props.value).toBe("test@example.com");

   // Snapshot ensures full structure and styling consistency
   expect(toJSON()).toMatchSnapshot();

   // Simulate text change
   fireEvent.changeText(input, "new@example.com");
   expect(mockSetValue).toHaveBeenCalledWith("new@example.com");
 });

 it("renders without a label and uses empty placeholder when defaultValue not provided", () => {
   const mockSetValue = jest.fn();
   const { queryByText, getByPlaceholderText } = render(
     <Input value="hello" setValue={mockSetValue} />
   );

   // No label should be rendered
   expect(queryByText(/.+/)).not.toBeTruthy();

   // Placeholder should be empty string by default
   const input = getByPlaceholderText("");
   expect(input.props.value).toBe("hello");
 });

 it("handles undefined setValue gracefully (no crash on text change)", () => {
   const { getByPlaceholderText } = render(
     <Input value="hi" defaultValue="Enter something" />
   );

   const input = getByPlaceholderText("Enter something");

   // Simulate text change — should not throw
   expect(() => fireEvent.changeText(input, "ignored")).not.toThrow();
 });
});
