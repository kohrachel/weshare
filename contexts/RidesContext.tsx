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

export const RidesProvider = ({ children }: { children: ReactNode }) => {
  // keep track of all rides
  const [rides, setRides] = useState<RideWithCreatorName[]>([]);

  const getSingleRide = useCallback(
    (rideId: string) => {
      return rides.find((ride) => ride.id === rideId);
    },
    [rides],
  );

  // helper function to set a single ride in the rides array
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
