/**
 Contributors
 Rachel Huiqi: 2 hours
 */

import { UserContext, UserProvider } from "@/contexts/UserContext";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useContext } from "react";

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe("UserContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("provides initial null userId", () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    expect(result.current.userId).toBeNull();
  });

  test("fetches userId from SecureStore on mount", async () => {
    const { getItemAsync } = require("expo-secure-store");
    const mockUserId = "testUserId123";
    getItemAsync.mockResolvedValue(mockUserId);

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userId).toBe(mockUserId);
    });

    expect(getItemAsync).toHaveBeenCalledWith("userid");
  });

  test("uses fallback userId when SecureStore returns null", async () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userId).toBe(
        "iuTXJmjktD4jFvE9_HiehLbLnMwsZ9F5svHy1iGWB0c",
      );
    });
  });

  test("setUserId updates the userId", async () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    const newUserId = "newUserId456";

    await waitFor(() => {
      expect(result.current.userId).not.toBeNull();
    });

    act(() => {
      result.current.setUserId(newUserId);
    });

    expect(result.current.userId).toBe(newUserId);
  });

  test("setUserId can be called multiple times", async () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue("initialUserId");

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userId).toBe("initialUserId");
    });

    act(() => {
      result.current.setUserId("userId1");
    });

    expect(result.current.userId).toBe("userId1");

    act(() => {
      result.current.setUserId("userId2");
    });

    expect(result.current.userId).toBe("userId2");
  });

  test("context provides both userId and setUserId", () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    expect(result.current.userId).toBeDefined();
    expect(result.current.setUserId).toBeDefined();
    expect(typeof result.current.setUserId).toBe("function");
  });

  test("provides setUserId function", () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue("testUserId");

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    expect(typeof result.current.setUserId).toBe("function");
    expect(result.current.setUserId).toBeDefined();
  });

  test("userId persists after setUserId call", async () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue("originalUserId");

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userId).toBe("originalUserId");
    });

    const customUserId = "customUserId789";

    act(() => {
      result.current.setUserId(customUserId);
    });

    expect(result.current.userId).toBe(customUserId);

    // Wait a bit and verify it's still the custom ID
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(result.current.userId).toBe(customUserId);
  });

  test("SecureStore is only called once on mount", async () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue("testUserId");

    renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(getItemAsync).toHaveBeenCalledTimes(1);
    });

    // Wait a bit more to ensure it's not called again
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(getItemAsync).toHaveBeenCalledTimes(1);
  });

  test("empty string userId from SecureStore triggers fallback", async () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue("");

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userId).toBe(
        "iuTXJmjktD4jFvE9_HiehLbLnMwsZ9F5svHy1iGWB0c",
      );
    });
  });

  test("undefined userId from SecureStore triggers fallback", async () => {
    const { getItemAsync } = require("expo-secure-store");
    getItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useContext(UserContext), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userId).toBe(
        "iuTXJmjktD4jFvE9_HiehLbLnMwsZ9F5svHy1iGWB0c",
      );
    });
  });
});
