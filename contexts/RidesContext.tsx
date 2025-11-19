import { RideDataType } from "@/app/rsvp";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";

export const RidesContext = createContext<{
  rides: RideDataType[];
  setRides: Dispatch<SetStateAction<RideDataType[]>>;
  getSingleRide: (rideId: string) => RideDataType | undefined;
  setSingleRide: (rideId: string, rideData: Partial<RideDataType>) => void;
}>({
  rides: [],
  setRides: () => {},
  getSingleRide: () => undefined,
  setSingleRide: () => {},
});

export const RidesProvider = ({ children }: { children: ReactNode }) => {
  // keep track of all rides
  const [rides, setRides] = useState<RideDataType[]>([]);

  const getSingleRide = useCallback(
    (rideId: string) => {
      return rides.find((ride) => ride.id === rideId);
    },
    [rides],
  );

  // helper function to set a single ride in the rides array
  const setSingleRide = useCallback(
    (rideId: string, rideData: Partial<RideDataType>) => {
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
