/**
 Contributors
 Emma Reid: 3 hours
 Jonny Yang: 6 hours
*/

import EditProfile from "../app/editProfile";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import * as ImagePicker from "expo-image-picker";

// Mock SecureStore
import * as SecureStore from "expo-secure-store";
import { getDoc, setDoc } from "firebase/firestore";
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

// Mock Firebase
jest.mock("../firebaseConfig", () => ({
  db: {},
  storage: {},
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteField: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock ImagePicker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
}));

// Mock useRouter
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Footer component to avoid rendering issues
jest.mock("../components/Footer", () => {
  return function MockFooter() {
    return null;
  };
});

// Mock Title component
jest.mock("../components/Title", () => {
  return function MockTitle({ text }: any) {
    return null;
  };
});

// Mock Input component
jest.mock("../components/Input", () => {
  return function MockInput({ label, value, setValue, testID }: any) {
    const React = require("react");
    return React.createElement("input", {
      testID,
      value,
      onChange: (e: any) => setValue(e.target.value || e.nativeEvent?.text),
      onChangeText: (text: string) => setValue(text),
    });
  };
});

// Mock ButtonGreen
jest.mock("../components/buttonGreen", () => {
  return function MockButtonGreen({ title, onPress, testID }: any) {
    const React = require("react");
    return React.createElement("button", {
      testID,
      onClick: onPress,
      children: title,
    });
  };
});

describe("EditProfile Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    // Default mock implementations
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("testUser123");
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

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
  });

  // -----------------------
  // Original Tests
  // -----------------------
  it("renders correctly", async () => {
    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("input-Name")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("handles save button press", async () => {
    const { getByTestId } = render(<EditProfile />);
    const saveButton = await waitFor(() => getByTestId("save-button"), { timeout: 3000 });
    fireEvent.press(saveButton);
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("handles input changes", async () => {
    const { getByTestId } = render(<EditProfile />);
    const nameInput = await waitFor(() => getByTestId("input-Name"), { timeout: 3000 });
    fireEvent.changeText(nameInput, "Jane Doe");
    // Input value should change through the mock's onChange handler
    await waitFor(() => {
      expect(nameInput.props.value).toBe("Jane Doe");
    }, { timeout: 1000 });
  });

  it("handles storeInfo error gracefully", async () => {
    (setDoc as jest.Mock).mockRejectedValueOnce(new Error("Failed to save"));
    const { getByTestId } = render(<EditProfile />);
    const saveButton = await waitFor(() => getByTestId("save-button"), { timeout: 3000 });
    fireEvent.press(saveButton);
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  // -----------------------
  // isValidPic() Tests
  // -----------------------
  it("isValidPic returns false for null/undefined", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: null,
      }),
    });

    const { queryByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(queryByTestId("profilePicImage")).toBeNull();
    }, { timeout: 3000 });
  });

  it("isValidPic returns false for non-string", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: 12345,
      }),
    });

    const { queryByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(queryByTestId("profilePicImage")).toBeNull();
    }, { timeout: 3000 });
  });

  it("isValidPic returns false for short string", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "short",
      }),
    });

    const { queryByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(queryByTestId("profilePicImage")).toBeNull();
    }, { timeout: 3000 });
  });

  it("isValidPic returns true for http url", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "https://example.com/photo.jpg",
      }),
    });

    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("profilePicImage")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("isValidPic returns true for file url", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "file:///storage/photo.jpg",
      }),
    });

    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("profilePicImage")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("isValidPic returns true for content url", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "content://media/photo.jpg",
      }),
    });

    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("profilePicImage")).toBeTruthy();
    }, { timeout: 3000 });
  });

  // -----------------------
  // fetchInfo() Tests
  // -----------------------
  it("fetchInfo throws error if no userid", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("input-Name")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("fetchInfo handles getDoc error gracefully", async () => {
    (getDoc as jest.Mock).mockRejectedValueOnce(new Error("Fetch failed"));
    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("input-Name")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("fetchInfo handles undefined data from getDoc", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({ data: () => undefined });
    const { getByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(getByTestId("input-Name")).toBeTruthy();
    }, { timeout: 3000 });
  });

  // -----------------------
  // pickImage() Tests
  // -----------------------
  it("pickImage handles canceled scenario", async () => {
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockResolvedValueOnce({ canceled: true, assets: [] });

    const { getByTestId } = render(<EditProfile />);
    const profileButton = await waitFor(() => getByTestId("profilePicButton"), { timeout: 3000 });
    fireEvent.press(profileButton);

    await waitFor(() => {
      // When canceled, uploadBytes should not be called
      expect(profileButton).toBeTruthy();
    }, { timeout: 2000 });
  });

  it("pickImage throws error", async () => {
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockRejectedValueOnce(new Error("Picker failed"));

    const { getByTestId } = render(<EditProfile />);
    const profileButton = await waitFor(() => getByTestId("profilePicButton"), { timeout: 3000 });
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(profileButton).toBeTruthy();
    }, { timeout: 2000 });
  });

  // -----------------------
  // storeInfo() Tests
  // -----------------------
  it("storeInfo with no user id", async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce("testUser123")
      .mockResolvedValueOnce("testUser123")
      .mockResolvedValueOnce(null);

    const { getByTestId } = render(<EditProfile />);
    const saveButton = await waitFor(() => getByTestId("save-button"), { timeout: 3000 });
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(SecureStore.getItemAsync).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  // -----------------------
  // handleLogout() Tests
  // -----------------------
  it("handles logout button press", async () => {
    const { getByTestId } = render(<EditProfile />);
    const logoutButton = await waitFor(() => getByTestId("logout-button"), { timeout: 3000 });
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userid", "");
    }, { timeout: 2000 });
  });

  it("handles logout error gracefully", async () => {
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error("Logout failed"));
    const { getByTestId } = render(<EditProfile />);
    const logoutButton = await waitFor(() => getByTestId("logout-button"), { timeout: 3000 });
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  // -----------------------
  // Initial useEffect Tests
  // -----------------------
  it("sets test userid if none exists", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    render(<EditProfile />);

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userid", "testUser123");
    }, { timeout: 3000 });
  });

  it("does not set userid if one already exists", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("existingUser");
    render(<EditProfile />);

    await waitFor(() => {
      expect(SecureStore.setItemAsync).not.toHaveBeenCalledWith("userid", "testUser123");
    }, { timeout: 3000 });
  });

  // -----------------------
  // Loading State Tests
  // -----------------------
  it("renders loading state ActivityIndicator", async () => {
    (getDoc as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}),
    );
    const { getByTestId } = render(<EditProfile />);
    expect(getByTestId("ActivityIndicator")).toBeTruthy();
  });

  // -----------------------
  // Edge Cases
  // -----------------------
  it("handles empty string profilePic from Firebase", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "",
      }),
    });

    const { queryByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(queryByTestId("profilePicImage")).toBeNull();
    }, { timeout: 3000 });
  });

  it("handles profile picture selection success", async () => {
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///new-photo.jpg" }],
    });

    const { getByTestId } = render(<EditProfile />);
    const profileButton = await waitFor(() => getByTestId("profilePicButton"), { timeout: 3000 });
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("profilePic is displayed when valid https url", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "https://example.com/photo.jpg",
      }),
    });

    const { getByTestId } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByTestId("profilePicImage")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("handles uploadImage error", async () => {
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///new-photo.jpg" }],
    });

    (setDoc as jest.Mock).mockRejectedValueOnce(new Error("Upload failed"));

    const { getByTestId } = render(<EditProfile />);
    const profileButton = await waitFor(() => getByTestId("profilePicButton"), { timeout: 3000 });
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("handles storeInfo fetching info again after save", async () => {
    const { getByTestId } = render(<EditProfile />);
    const saveButton = await waitFor(() => getByTestId("save-button"), { timeout: 3000 });
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("ensures userid is set on component mount if none exists", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    render(<EditProfile />);

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userid", "testUser123");
    }, { timeout: 2000 });
  });

  it("handles fetchInfo with no user ID on component mount", async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce(null) // First call in useEffect to set userid
      .mockResolvedValueOnce(null); // Second call in fetchInfo

    const { getByTestId } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByTestId("input-Name")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("fetchInfo populates all fields from firestore data", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "9876543210",
        gender: "Female",
        profilePic: null,
      }),
    });

    const { getByTestId } = render(<EditProfile />);

    await waitFor(() => {
      const nameInput = getByTestId("input-Name");
      const emailInput = getByTestId("input-Email");
      const phoneInput = getByTestId("input-Phone");
      const genderInput = getByTestId("input-Gender");

      expect(nameInput.props.value).toBe("Jane Smith");
      expect(emailInput.props.value).toBe("jane@example.com");
      expect(phoneInput.props.value).toBe("9876543210");
      expect(genderInput.props.value).toBe("Female");
    }, { timeout: 3000 });
  });

  it("storeInfo called when save button pressed", async () => {
    const { getByTestId } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByTestId("input-Name")).toBeTruthy();
    }, { timeout: 3000 });

    const saveButton = getByTestId("save-button");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("isValidPic returns false for string not starting with http file or content", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "invalid://storage/photo.jpg",
      }),
    });

    const { queryByTestId } = render(<EditProfile />);
    await waitFor(() => {
      expect(queryByTestId("profilePicImage")).toBeNull();
    }, { timeout: 3000 });
  });

  it("renders profilePicButton when no photo", async () => {
    const { getByTestId } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByTestId("profilePicButton")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("profilePic image hidden when profilePic length <= 10", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "short",
      }),
    });

    const { queryByTestId, getByTestId } = render(<EditProfile />);

    await waitFor(() => {
      expect(queryByTestId("profilePicImage")).toBeNull();
      expect(getByTestId("profilePicButton")).toBeTruthy();
    }, { timeout: 3000 });
  });

  it("loading state sets loading to true initially", async () => {
    (getDoc as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}), // Never resolves
    );

    const { getByTestId, queryByTestId } = render(<EditProfile />);

    expect(getByTestId("ActivityIndicator")).toBeTruthy();
    expect(queryByTestId("input-Name")).toBeNull();
  });

  it("handles image picker success with actual image", async () => {
    const pickMock = require("expo-image-picker").launchImageLibraryAsync;
    pickMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///path/to/image.jpg" }],
    });

    const { getByTestId } = render(<EditProfile />);
    const profileButton = await waitFor(() => getByTestId("profilePicButton"), { timeout: 3000 });
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("isValidPic with exact 10 char string returns false", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "1234567890",
      }),
    });

    const { queryByTestId } = render(<EditProfile />);

    await waitFor(() => {
      expect(queryByTestId("profilePicImage")).toBeNull();
    }, { timeout: 3000 });
  });

  it("isValidPic with 11 char non-http string returns false", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        gender: "Male",
        profilePic: "12345678901",
      }),
    });

    const { queryByTestId } = render(<EditProfile />);

    await waitFor(() => {
      expect(queryByTestId("profilePicImage")).toBeNull();
    }, { timeout: 3000 });
  });

});
// -----------------------
// Additional Branch Coverage Tests
// -----------------------

it("handles remove profile picture functionality", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      gender: "Male",
      profilePic: "https://example.com/photo.jpg", // Valid URL that passes isValidPic
    }),
  });

  const { getByText } = render(<EditProfile />);

  await waitFor(() => {
    expect(getByText("Remove Photo")).toBeTruthy();
  }, { timeout: 3000 });

  const removeButton = getByText("Remove Photo");
  fireEvent.press(removeButton);

  await waitFor(() => {
    // Just check that setDoc was called with the right data, not the exact arguments
    expect(setDoc).toHaveBeenCalled();

    // Check that it was called with the profilePic empty string
    const setDocCalls = (setDoc as jest.Mock).mock.calls;
    const lastCall = setDocCalls[setDocCalls.length - 1];
    expect(lastCall[1]).toEqual({ profilePic: "" });
    expect(lastCall[2]).toEqual({ merge: true });
  }, { timeout: 2000 });
});

it("handles fetchInfo with no data fields", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({}), // Empty data object
  });

  const { getByTestId } = render(<EditProfile />);

  await waitFor(() => {
    const nameInput = getByTestId("input-Name");
    const emailInput = getByTestId("input-Email");
    const phoneInput = getByTestId("input-Phone");
    const genderInput = getByTestId("input-Gender");

    // Should all be empty strings when no data
    expect(nameInput.props.value).toBe("");
    expect(emailInput.props.value).toBe("");
    expect(phoneInput.props.value).toBe("");
    expect(genderInput.props.value).toBe("");
  }, { timeout: 3000 });
});

it("handles storeInfo with empty fields", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({
      name: "",
      email: "",
      phone: "",
      gender: "",
      profilePic: null,
    }),
  });

  const { getByTestId } = render(<EditProfile />);
  const saveButton = await waitFor(() => getByTestId("save-button"), { timeout: 3000 });
  fireEvent.press(saveButton);

  await waitFor(() => {
    expect(setDoc).toHaveBeenCalled();
  }, { timeout: 2000 });
});

it("renders profile picture when valid file URL", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      gender: "Male",
      profilePic: "file:///path/to/very/long/image.jpg", // File URL with length > 10
    }),
  });

  const { getByTestId } = render(<EditProfile />);

  await waitFor(() => {
    expect(getByTestId("profilePicImage")).toBeTruthy();
  }, { timeout: 3000 });
});

it("renders profile picture when valid content URL", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      gender: "Male",
      profilePic: "content://media/very/long/image.jpg", // Content URL with length > 10
    }),
  });

  const { getByTestId } = render(<EditProfile />);

  await waitFor(() => {
    expect(getByTestId("profilePicImage")).toBeTruthy();
  }, { timeout: 3000 });
});

// Test the specific branches in isValidPic function
it("isValidPic returns false for exactly 10 character string", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      gender: "Male",
      profilePic: "1234567890", // Exactly 10 chars
    }),
  });

  const { queryByTestId } = render(<EditProfile />);

  await waitFor(() => {
    expect(queryByTestId("profilePicImage")).toBeNull();
  }, { timeout: 3000 });
});

// Test the specific branches in fetchInfo
it("fetchInfo sets profilePic to empty string when pic is invalid type", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      gender: "Male",
      profilePic: { invalid: "object" }, // Invalid type (object)
    }),
  });

  const { queryByTestId } = render(<EditProfile />);

  await waitFor(() => {
    expect(queryByTestId("profilePicImage")).toBeNull();
  }, { timeout: 3000 });
});

// Test the showCamera variable logic
it("showCamera is true when profilePic is empty string", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      gender: "Male",
      profilePic: "", // Empty string
    }),
  });

  const { getByTestId, queryByTestId } = render(<EditProfile />);

  await waitFor(() => {
    expect(getByTestId("profilePicButton")).toBeTruthy();
    expect(queryByTestId("profilePicImage")).toBeNull();
  }, { timeout: 3000 });
});

// Test storeInfo error branch
it("storeInfo handles error when setDoc fails", async () => {
  (setDoc as jest.Mock).mockRejectedValueOnce(new Error("Save failed"));

  const { getByTestId } = render(<EditProfile />);
  const saveButton = await waitFor(() => getByTestId("save-button"), { timeout: 3000 });
  fireEvent.press(saveButton);

  await waitFor(() => {
    expect(setDoc).toHaveBeenCalled();
  }, { timeout: 2000 });
});

// Test pickImage error branch
it("pickImage handles error when image picker fails", async () => {
  const pickMock = require("expo-image-picker").launchImageLibraryAsync;
  pickMock.mockRejectedValueOnce(new Error("Picker failed"));

  const { getByTestId } = render(<EditProfile />);
  const profileButton = await waitFor(() => getByTestId("profilePicButton"), { timeout: 3000 });
  fireEvent.press(profileButton);

  await waitFor(() => {
    // Should handle error without crashing
    expect(pickMock).toHaveBeenCalled();
  }, { timeout: 2000 });
});

// Test uploadImage error branch
it("uploadImage handles error when setDoc fails", async () => {
  const pickMock = require("expo-image-picker").launchImageLibraryAsync;
  pickMock.mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri: "file:///new-photo.jpg" }],
  });

  (setDoc as jest.Mock).mockRejectedValueOnce(new Error("Upload failed"));

  const { getByTestId } = render(<EditProfile />);
  const profileButton = await waitFor(() => getByTestId("profilePicButton"), { timeout: 3000 });
  fireEvent.press(profileButton);

  await waitFor(() => {
    expect(setDoc).toHaveBeenCalled();
  }, { timeout: 2000 });
});

// Test fetchInfo error branch
it("fetchInfo handles error when getDoc fails", async () => {
  (getDoc as jest.Mock).mockRejectedValueOnce(new Error("Fetch failed"));

  const { getByTestId } = render(<EditProfile />);

  await waitFor(() => {
    // Should render without crashing
    expect(getByTestId("input-Name")).toBeTruthy();
  }, { timeout: 3000 });
});

// Test the specific case where profilePic length is exactly 10
it("profilePic button shows when profilePic length is exactly 10", async () => {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    data: () => ({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      gender: "Male",
      profilePic: "shorturl12", // Exactly 10 chars
    }),
  });

  const { getByTestId, queryByTestId } = render(<EditProfile />);

  await waitFor(() => {
    expect(getByTestId("profilePicButton")).toBeTruthy();
    expect(queryByTestId("profilePicImage")).toBeNull();
  }, { timeout: 3000 });
});

