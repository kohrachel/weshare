import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import EditProfile from "../app/EditProfile"; // adjust path if needed
import { act } from "react-test-renderer";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

// Mock Firebase Firestore
const mockSetDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock("firebase/firestore", () => ({
  getDoc: (...args: any) => mockGetDoc(...args),
  setDoc: (...args: any) => mockSetDoc(...args),
  doc: (...args: any) => mockDoc(...args),
}));

// Mock SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve("mockUserId")),
}));

// Mock components
jest.mock("@/components/button-green", () => ({
  ButtonGreen: ({ title, onPress }: any) => (
    <button onClick={onPress} testID="saveButton">
      {title}
    </button>
  ),
}));

jest.mock("@/components/Input", () => {
  return ({ label, value, setValue }: any) => (
    <input
      testID={`input-${label}`}
      placeholder={label}
      value={value}
      onChangeText={(text: string) => setValue(text)}
    />
  );
});

jest.mock("@/components/Footer", () => () => <div testID="footer" />);
jest.mock("../components/backbutton", () => () => <div testID="backButton" />);

// Silence console errors for cleaner output
jest.spyOn(console, "error").mockImplementation(() => {});

describe("EditProfile Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading indicator initially", async () => {
    const { getByTestId, unmount } = render(<EditProfile />);
    // The ActivityIndicator should show initially
    expect(getByTestId("ActivityIndicator")).toBeTruthy();
    unmount();
  });

  it("fetches and displays user data after loading", async () => {
    mockGetDoc.mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
      }),
    });

    const { getByPlaceholderText } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByPlaceholderText("Name").props.value).toBe("John Doe");
      expect(getByPlaceholderText("Email").props.value).toBe("john@example.com");
      expect(getByPlaceholderText("Phone").props.value).toBe("1234567890");
      expect(getByPlaceholderText("Gender").props.value).toBe("Male");
    });
  });

  it("handles save button press and calls Firestore setDoc", async () => {
    mockGetDoc.mockResolvedValueOnce({
      data: () => ({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "9998887777",
        gender: "Female",
      }),
    });

    const { getByTestId } = render(<EditProfile />)
