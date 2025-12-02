import { RideWithCreatorName } from "@/app/rsvp";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";

export const RidesContext = createContext<{
  rides: RideWithCreatorName[];
  setRides: Dispatch<SetStateAction<RideWithCreatorName[]>>;
  getSingleRide: (rideId: string) => RideWithCreatorName | undefined;
  setSingleRide: (
    rideId: string,
    rideData: Partial<RideWithCreatorName>,
  ) => void;
}>({
  rides: [],
  setRides: () => {},
  getSingleRide: () => undefined,
  setSingleRide: () => {},
});

/**
 * Provides a centralized state management for ride data throughout the application.
 * This provider component wraps parts of the app that need access to the rides list,
 * offering functions to get and update ride information.
 * @param {{ children: ReactNode }} props The component props.
 * @param {ReactNode} props.children The child components that will have access to this context.
 * @returns {JSX.Element} The RidesProvider component.
 */
export const RidesProvider = ({ children }: { children: ReactNode }) => {
  // keep track of all rides
  const [rides, setRides] = useState<RideWithCreatorName[]>([]);

  /**
   * Retrieves a single ride from the context by its ID.
   * This function is memoized with useCallback to optimize performance by returning a stable function reference
   * as long as the rides array has not changed.
   * @param {string} rideId The ID of the ride to find.
   * @returns {RideWithCreatorName | undefined} The ride object if found, otherwise undefined.
   */
  const getSingleRide = useCallback(
    (rideId: string) => {
      return rides.find((ride) => ride.id === rideId);
    },
    [rides],
  );

  /**
   * Updates a single ride in the state with new data.
   * This function finds a ride by its ID and merges the new data with the existing ride data.
   * It is memoized with useCallback to ensure it has a stable reference across re-renders.
   * @param {string} rideId The ID of the ride to update.
   * @param {Partial<RideWithCreatorName>} rideData An object containing the new data to merge with the existing ride.
   */
  const setSingleRide = useCallback(
    (rideId: string, rideData: Partial<RideWithCreatorName>) => {
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride.id === rideId ? { ...ride, ...rideData } : ride,
        ),
      );
    },
    [],
  );

  return (
    <RidesContext value={{ rides, setRides, getSingleRide, setSingleRide }}>
      {children}
    </RidesContext>
  );
};
