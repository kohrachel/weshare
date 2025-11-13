import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useEffect, useState } from "react";

export const UserContext = createContext<{
  userId: string | null;
  setUserId: (userId: string) => void;
}>({
  userId: null,
  setUserId: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // keep track of all rides
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
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
