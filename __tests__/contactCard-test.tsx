/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render } from "@testing-library/react-native";
import ContactCard from "../components/contactCard";

describe("ContactCard", () => {
  const props = {
    firstName: "Jane",
    lastName: "Doe",
    phoneNum: 1234567890,
    email: "jane.doe@example.com",
  };

  it("renders the contact card correctly", () => {
    const { getByText } = render(<ContactCard {...props} />);

    // Check name
    expect(getByText("Jane Doe")).toBeTruthy();

    // Check phone label and number
    expect(getByText("Phone: ")).toBeTruthy();
    expect(getByText("1234567890")).toBeTruthy();

    // Check email label and value
    expect(getByText("Email: ")).toBeTruthy();
    expect(getByText("jane.doe@example.com")).toBeTruthy();
  });

  it("renders with different props correctly", () => {
    const { getByText, rerender } = render(
      <ContactCard
        firstName="John"
        lastName="Smith"
        phoneNum={9876543210}
        email="john.smith@test.com"
      />
    );

    // Check all text elements after re-render
    expect(getByText("John Smith")).toBeTruthy();
    expect(getByText("9876543210")).toBeTruthy();
    expect(getByText("john.smith@test.com")).toBeTruthy();
  });
});
