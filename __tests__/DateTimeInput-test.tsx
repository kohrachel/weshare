/**
 Contributors
 Emma Reid: 0.5 hours
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DateTimeInput from "../components/DateTimeInput";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { formatDate, formatTime } from "@/utils";
import { act } from 'react';

// Mock dependencies
jest.mock("@react-native-community/datetimepicker", () => jest.fn(() => null));

jest.mock("@/utils", () => ({
  formatDate: jest.fn(),
  formatTime: jest.fn(),
}));

// Mock Input styles to avoid style resolution issues
// jest.mock("../Input", () => ({
//   styles: {
//     inputWrapper: { padding: 5 },
//     inputLabel: { fontSize: 16 },
//     inputBox: { borderWidth: 1 },
//   },
// }));

// Tests
describe("DateTimeInput", () => {
  const mockSetDateValue = jest.fn();
  const mockSetTimeValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (formatDate as jest.Mock).mockImplementation((d) => `Date: ${d.toDateString()}`);
    (formatTime as jest.Mock).mockImplementation((d) => `Time: ${d.getHours()}:${d.getMinutes()}`);
  });

  const baseProps = {
    label: "Select Date/Time",
    dateValue: new Date(2024, 0, 1, 12, 0),
    timeValue: new Date(2024, 0, 1, 13, 30),
    setDateValue: mockSetDateValue,
    setTimeValue: mockSetTimeValue,
  };

  it("renders correctly with label and formatted date/time", () => {
    const { getByText } = render(<DateTimeInput {...baseProps} />);

    expect(getByText("Select Date/Time")).toBeTruthy();
    expect(formatDate).toHaveBeenCalledWith(baseProps.dateValue);
    expect(formatTime).toHaveBeenCalledWith(baseProps.timeValue);

    expect(getByText(`Date: ${baseProps.dateValue.toDateString()}`)).toBeTruthy();
    expect(getByText(`Time: ${baseProps.timeValue.getHours()}:${baseProps.timeValue.getMinutes()}`)).toBeTruthy();
  });

  it("renders correctly without label", () => {
    const { queryByText } = render(<DateTimeInput {...baseProps} label={undefined} />);
    expect(queryByText("Select Date/Time")).toBeNull();
  });

  it("opens date picker and handles change", () => {
    const { getByText, rerender } = render(<DateTimeInput {...baseProps} />);

    // Open the date picker by pressing date text
    fireEvent.press(getByText(`Date: ${baseProps.dateValue.toDateString()}`));

    // Rerender to simulate visible picker
    rerender(
      <DateTimeInput
        {...baseProps}
        // Simulate state change to visible
        dateValue={baseProps.dateValue}
        timeValue={baseProps.timeValue}
      />
    );

    // Simulate visible date picker and trigger onChange
    const onChangeMock = (RNDateTimePicker as jest.Mock).mock.calls[0][0].onChange;
    const newDate = new Date(2024, 0, 2);

    act(() => {
      onChangeMock(undefined, newDate);
    });

    expect(mockSetDateValue).toHaveBeenCalledWith(newDate);
    expect(mockSetDateValue).toHaveBeenCalledTimes(1);
  });

  it("opens time picker and handles change", () => {
    const { getByText, rerender } = render(<DateTimeInput {...baseProps} />);

    // Press time text to show picker
    fireEvent.press(getByText(`Time: ${baseProps.timeValue.getHours()}:${baseProps.timeValue.getMinutes()}`));

    rerender(
      <DateTimeInput
        {...baseProps}
        dateValue={baseProps.dateValue}
        timeValue={baseProps.timeValue}
      />
    );

    // Simulate picker interaction
    const onChangeMock = (RNDateTimePicker as jest.Mock).mock.calls[1][0].onChange;
    const newTime = new Date(2024, 0, 1, 15, 45);

    act(() => {
      onChangeMock(undefined, newTime);
    });
    expect(mockSetTimeValue).toHaveBeenCalledWith(newTime);
  });

  it("ignores onChange when date is undefined", () => {
    render(<DateTimeInput {...baseProps} />);

    const onChangeMock = (RNDateTimePicker as jest.Mock).mock.calls?.[0]?.[0]?.onChange;
    if (onChangeMock) onChangeMock(undefined, undefined);

    expect(mockSetDateValue).not.toHaveBeenCalled();
  });
});
