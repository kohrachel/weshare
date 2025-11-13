/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render } from "@testing-library/react-native";
import ContactCard from "../components/contactCard";
import { UserGenderType } from "@/app/rsvp";

describe("ContactCard", () => {
  const baseProps = {
    name: "Jane Doe",
    phoneNum: "1234567890",
    email: "jane.doe@example.com",
    gender: "Female" as UserGenderType,
  };

  it("renders all contact info correctly", () => {
    const { getByText } = render(<ContactCard {...baseProps} />);

    // Name
    expect(getByText("Jane Doe")).toBeTruthy();

    // Phone label and formatted number
    expect(getByText("Phone: ")).toBeTruthy();
    expect(getByText("(123) 456-7890")).toBeTruthy();

    // Email label and value
    expect(getByText("Email: ")).toBeTruthy();
    expect(getByText("jane.doe@example.com")).toBeTruthy();

    // Gender label and value
    expect(getByText("Gender: ")).toBeTruthy();
    expect(getByText("Female")).toBeTruthy();
  });

  it("formats 'Not set' phone numbers correctly", () => {
    const props = { ...baseProps, phoneNum: "Not set" };
    const { getByText } = render(<ContactCard {...props} />);

    expect(getByText("Not set")).toBeTruthy();
  });

  it("renders correctly with different props", () => {
    const props = {
      name: "John Smith",
      phoneNum: "9876543210",
      email: "john.smith@test.com",
      gender: "Male" as UserGenderType,
    };

    const { getByText } = render(<ContactCard {...props} />);

    expect(getByText("John Smith")).toBeTruthy();
    expect(getByText("(987) 654-3210")).toBeTruthy();
    expect(getByText("john.smith@test.com")).toBeTruthy();
    expect(getByText("Male")).toBeTruthy();
  });
});
