/**
 Contributors
 Emma Reid: 3.5 hours
 */

import React from "react";
import { render, act, waitFor, fireEvent } from "@testing-library/react-native";
import Login from "../app/Login";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as AuthSession from "expo-auth-session";
import { setDoc, getDoc, doc } from "firebase/firestore";

// Mocks
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock("expo-auth-session", () => ({
  useAutoDiscovery: jest.fn(),
  useAuthRequest: jest.fn(),
  makeRedirectUri: jest.fn(() => "mockRedirectUri"),
  exchangeCodeAsync: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  setDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("@/firebaseConfig", () => ({
  db: {},
}));

jest.mock("../components/buttonGreen", () => {
  return ({ title, onPress }: any) => (
    <button onClick={onPress} testID="login-button">
      {title}
    </button>
  );
});

global.fetch = jest.fn();

// Tests
describe("Login Screen", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders loading indicator initially", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([{}, {}, jest.fn()]);
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue({});

    const { getByTestId, queryByTestId } = render(<Login />);

    await waitFor(() => {
      expect(queryByTestId("login-button")).toBeNull();
    });
  });

  it("sets loading to false if no user ID is found", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("123");
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

    const { getByTestId } = render(<Login />);

    await waitFor(() => {
      expect(getByTestId("login-button")).toBeTruthy();
    });
  });

  it("calls promptAsync() when login button is pressed", async () => {
    const mockPromptAsync = jest.fn();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("");
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([{}, {}, mockPromptAsync]);
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue({});

    const { getByTestId } = render(<Login />);
    await waitFor(() => {
      fireEvent.press(getByTestId("login-button"));
      expect(mockPromptAsync).toHaveBeenCalled();
    });
  });

  it("navigates to /feedPage if user is already logged in and exists in Firestore", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("existing-user");
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([{}, {}, jest.fn()]);
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue({});
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });

    render(<Login />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/feedPage");
    });
  });


  it("handles successful Microsoft login with Vanderbilt email", async () => {
    const mockDiscovery = { userInfoEndpoint: "https://example.com/userinfo" };
    const mockPromptAsync = jest.fn();
    const mockResponse = { type: "success", params: { code: "123" } };
    const mockRequest = { codeVerifier: "mockVerifier" };

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("");
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue(mockDiscovery);
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([
      mockRequest,
      mockResponse,
      mockPromptAsync,
    ]);
    (AuthSession.exchangeCodeAsync as jest.Mock).mockResolvedValue({
      accessToken: "fake-token",
    });

    (fetch as jest.Mock).mockResolvedValue({
      json: () =>
        Promise.resolve({
          sub: "123",
          email: "student@vanderbilt.edu",
          name: "Test User",
        }),
    });

    const { getByTestId } = render(<Login />);

    await act(async () => {});

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userid", "123");
      expect(setDoc).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/feedPage");
    });
  });

  it("handles successful Microsoft login with upn", async () => {
    const mockDiscovery = { userInfoEndpoint: "https://example.com/userinfo" };
    const mockPromptAsync = jest.fn();
    const mockResponse = { type: "success", params: { code: "123" } };
    const mockRequest = { codeVerifier: "mockVerifier" };

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("");
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue(mockDiscovery);
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([
      mockRequest,
      mockResponse,
      mockPromptAsync,
    ]);
    (AuthSession.exchangeCodeAsync as jest.Mock).mockResolvedValue({
      accessToken: "fake-token",
    });

    (fetch as jest.Mock).mockResolvedValue({
      json: () =>
        Promise.resolve({
          sub: "123",
          upn: "student@vanderbilt.edu",
          name: "Test User",
        }),
    });

    const { getByTestId } = render(<Login />);

    await act(async () => {});

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userid", "123");
      expect(setDoc).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/feedPage");
    });
  });

  it("handles successful Microsoft login with unique_name", async () => {
    const mockDiscovery = { userInfoEndpoint: "https://example.com/userinfo" };
    const mockPromptAsync = jest.fn();
    const mockResponse = { type: "success", params: { code: "123" } };
    const mockRequest = { codeVerifier: "mockVerifier" };

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("");
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue(mockDiscovery);
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([
      mockRequest,
      mockResponse,
      mockPromptAsync,
    ]);
    (AuthSession.exchangeCodeAsync as jest.Mock).mockResolvedValue({
      accessToken: "fake-token",
    });

    (fetch as jest.Mock).mockResolvedValue({
      json: () =>
        Promise.resolve({
          sub: "123",
          unique_name: "student@vanderbilt.edu",
          name: "Test User",
        }),
    });

    const { getByTestId } = render(<Login />);

    await act(async () => {});

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userid", "123");
      expect(setDoc).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/feedPage");
    });
  });

  it("shows error for non-Vanderbilt email", async () => {
    const mockDiscovery = { userInfoEndpoint: "https://example.com/userinfo" };
    const mockResponse = { type: "success", params: { code: "123" } };
    const mockRequest = { codeVerifier: "mockVerifier" };

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("");
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue(mockDiscovery);
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([
      mockRequest,
      mockResponse,
      jest.fn(),
    ]);
    (AuthSession.exchangeCodeAsync as jest.Mock).mockResolvedValue({
      accessToken: "fake-token",
    });

    (fetch as jest.Mock).mockResolvedValue({
      json: () =>
        Promise.resolve({
          sub: "123",
          email: "someone@gmail.com",
          name: "Test User",
        }),
    });

    const { queryByText } = render(<Login />);

    await act(async () => {});

    await waitFor(() => {
      expect(queryByText(/error/i)).toBeTruthy();
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith("/feedPage");
    });
  });

  it("handles storeUser error gracefully", async () => {
    const mockDiscovery = { userInfoEndpoint: "https://example.com/userinfo" };
    const mockResponse = { type: "success", params: { code: "123" } };
    const mockRequest = { codeVerifier: "mockVerifier" };

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("");
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue(mockDiscovery);
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([
      mockRequest,
      mockResponse,
      jest.fn(),
    ]);
    (AuthSession.exchangeCodeAsync as jest.Mock).mockResolvedValue({
      accessToken: "fake-token",
    });

    (fetch as jest.Mock).mockResolvedValue({
      json: () =>
        Promise.resolve({
          sub: "123",
          email: "student@vanderbilt.edu",
          name: "Test User",
        }),
    });

    (setDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore failed"));
    global.alert = jest.fn();

    render(<Login />);
    await act(async () => {});

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "User info not saved. Please try signing in again."
      );
    });
  });

  it("handles SecureStore.getItemAsync throwing an error", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error("SecureStore failed"));
    (AuthSession.useAuthRequest as jest.Mock).mockReturnValue([{}, {}, jest.fn()]);
    (AuthSession.useAutoDiscovery as jest.Mock).mockReturnValue({});

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<Login />);
    await act(async () => {});
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });
});
