/**
 Contributors
 Emma Reid: 3 hours
 Jonny Yang: 4 hours
*/

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import EditProfile from "@/app/editProfile";

// Mock SecureStore
import * as SecureStore from "expo-secure-store";
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

// Mock Firebase
jest.mock("@/firebaseConfig", () => ({
  db: {},
  storage: {},
}));
import { db, storage } from "@/firebaseConfig";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));
import { doc, getDoc, setDoc } from "firebase/firestore";

jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Mock ImagePicker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
}));

describe("EditProfile Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock SecureStore
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("testUser123");
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    // Mock Firestore getDoc/setDoc
    (getDoc as jest.Mock).mockResolvedValue({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: null,
      }),
    });
    (setDoc as jest.Mock).mockResolvedValue({});

    // Mock Firebase Storage
    (getDownloadURL as jest.Mock).mockResolvedValue("mock-download-url");

    // Mock global fetch for image upload
    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () =>
          Promise.resolve(new Blob(["mock image data"], { type: "image/jpeg" })),
      } as any)
    );
  });

  // -----------------------
  // Original Tests
  // -----------------------
  it("renders correctly", async () => {
    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("input-Name")).toBeTruthy();
      expect(getByTestId("input-Email")).toBeTruthy();
      expect(getByTestId("input-Phone")).toBeTruthy();
      expect(getByTestId("input-Gender")).toBeTruthy();
    });
    expect(getByTestId("save-button")).toBeTruthy();
    expect(getByTestId("profilePicButton")).toBeTruthy();
  });

  it("handles save button press", async () => {
    const { getByTestId } = render(<EditProfile />);
    const saveButton = await waitFor(() => getByTestId("save-button"));
    fireEvent.press(saveButton);
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    });
  });

  it("handles input changes", async () => {
    const { getByTestId } = render(<EditProfile />);
    const nameInput = await waitFor(() => getByTestId("input-Name"));
    fireEvent.changeText(nameInput, "Jane Doe");
    expect(nameInput.props.value).toBe("Jane Doe");

    const emailInput = getByTestId("input-Email");
    fireEvent.changeText(emailInput, "jane@example.com");
    expect(emailInput.props.value).toBe("jane@example.com");

    const phoneInput = getByTestId("input-Phone");
    fireEvent.changeText(phoneInput, "9876543210");
    expect(phoneInput.props.value).toBe("9876543210");

    const genderInput = getByTestId("input-Gender");
    fireEvent.changeText(genderInput, "Female");
    expect(genderInput.props.value).toBe("Female");
  });

  it("handles profile picture selection", async () => {
    const { getByTestId } = render(<EditProfile />);
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockResolvedValue({ canceled: false, assets: [{ uri: "mock-uri" }] });

    const profileButton = await waitFor(() => getByTestId("profilePicButton"));
    fireEvent.press(profileButton);
    await waitFor(() => {
      expect(getDownloadURL).toHaveBeenCalled();
    });
  });

  it("handles storeInfo error gracefully", async () => {
    (setDoc as jest.Mock).mockRejectedValue(new Error("Failed to save"));
    const { getByTestId } = render(<EditProfile />);
    const saveButton = await waitFor(() => getByTestId("save-button"));
    fireEvent.press(saveButton);
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    });
  });

  it("handles uploadImage error gracefully", async () => {
    (uploadBytes as jest.Mock).mockRejectedValue(new Error("Upload failed"));
    const { getByTestId } = render(<EditProfile />);
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockResolvedValue({ canceled: false, assets: [{ uri: "mock-uri" }] });

    const profileButton = await waitFor(() => getByTestId("profilePicButton"));
    fireEvent.press(profileButton);
    await waitFor(() => {
      expect(uploadBytes).toHaveBeenCalled();
    });
  });

  // -----------------------
  // New Tests to Increase Branch Coverage
  // -----------------------

  it("fetchInfo throws error if no userid", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("input-Name")).toBeTruthy();
    });
  });

  it("pickImage canceled scenario", async () => {
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockResolvedValueOnce({ canceled: true, assets: [] });

    const { getByTestId } = render(<EditProfile />);
    const profileButton = await waitFor(() => getByTestId("profilePicButton"));
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(uploadBytes).not.toHaveBeenCalled();
    });
  });

  it("pickImage throws error", async () => {
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockRejectedValueOnce(new Error("Picker failed"));

    const { getByTestId } = render(<EditProfile />);
    const profileButton = await waitFor(() => getByTestId("profilePicButton"));
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(uploadBytes).not.toHaveBeenCalled();
    });
  });

  it("storeInfo with no user id", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const { getByTestId } = render(<EditProfile />);
    const saveButton = await waitFor(() => getByTestId("save-button"));
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  it("renders loading state ActivityIndicator", async () => {
    // Keep getDoc hanging to simulate loading
    (getDoc as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // never resolves
    );
    const { getByTestId } = render(<EditProfile />);
    expect(getByTestId("ActivityIndicator")).toBeTruthy();
  });

  // -----------------------
  // NEW: covers data() undefined branch
  // -----------------------
  it("handles empty user data from getDoc", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({ data: () => undefined });

    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      const nameInput = getByTestId("input-Name");
      const emailInput = getByTestId("input-Email");
      const phoneInput = getByTestId("input-Phone");
      const genderInput = getByTestId("input-Gender");

      expect(nameInput.props.value).toBe("");
      expect(emailInput.props.value).toBe("");
      expect(phoneInput.props.value).toBe("");
      expect(genderInput.props.value).toBe("");
    });
  });
});
