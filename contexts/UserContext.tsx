import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useEffect, useState } from "react";

export const UserContext = createContext<{
  userId: string | null;
  setUserId: (userId: string) => void;
}>({
  userId: null,
  setUserId: () => {},
});

/**
 * Provides user-related data to all components wrapped within it.
 * This component fetches the current user's ID from secure storage and makes it
 * available through the UserContext.
 * @param {{ children: ReactNode }} props The component props.
 * @param {ReactNode} props.children The child components that will consume the context.
 * @returns {JSX.Element} The UserProvider component.
 */
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // keep track of all rides
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches the user ID from the device's secure storage.
     * If a user ID is found, it updates the state. Otherwise, it sets a default
     * user ID for testing purposes.
     * @async
     */
    const fetchUserId = async () => {
      const userId = await SecureStore.getItemAsync("userid");
      if (!userId) {
        // TODO: remove this after testing
        setUserId("iuTXJmjktD4jFvE9_HiehLbLnMwsZ9F5svHy1iGWB0c");
        return;
      }
      setUserId(userId);
    };
    fetchUserId();
  }, []);

  return <UserContext value={{ userId, setUserId }}>{children}</UserContext>;
};
