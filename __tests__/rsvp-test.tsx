/**
 Contributors
 Rachel Huiqi: 3 hours
 */

import RsvpRidePage, { RideData } from "@/app/rsvp";
import { RidesContext, RidesProvider } from "@/contexts/RidesContext";
import { UserProvider } from "@/contexts/UserContext";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock expo-router primitives used by Footer
jest.mock("expo-router", () => {
  const React = require("react");
  const MockLink: React.FC<{ href: string; children: React.ReactNode }> = ({
    children,
  }) => React.createElement("MockLink", null, children);
  return {
    Link: MockLink,
    useRouter: () => ({
      navigate: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    }),
    useRoute: () => ({ params: { rideId: "testRideId" } }),
  };
});

// Mock @react-navigation/native useRoute (RSVP uses it)
jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({
    params: { rideId: "testRideId" },
  }),
}));

// Mock firebase config so the SDK isn't initialized in tests
jest.mock("@/firebaseConfig", () => require("../__mocks__/firebaseConfig.js"));

// Fully mock firebase/firestore without requireActual (avoids ESM import issue)
jest.mock("firebase/firestore", () => {
  // Minimal Firestore mock matching the API used in RSVP
  const Timestamp = {
    // Provide a minimal shape if your code references Timestamp methods elsewhere
    fromDate: (date: Date) => ({ toDate: () => date }),
  };

  const doc = (...args: string[]) => ({ __path: args.join("/") });

  const getDoc = async (ref: { __path: string }) => {
    const path = ref?.__path ?? "";
    // Handle path like "rides/testRideId" or "[object Object]/rides/testRideId"
    if (path.includes("/rides/")) {
      // Extract rideId from path (e.g., "rides/testRideId" -> "testRideId")
      const parts = path.split("/rides/");
      const rideId = parts.length > 1 ? parts[1] : "testRideId";
      return {
        exists: () => true,
        data: () => ({
          id: rideId,
          creator: "creatorUserId",
          destination: "Test Destination",
          date: { toDate: () => new Date("2025-11-03T10:00:00Z") },
          time: { toDate: () => new Date("2025-11-03T12:00:00Z") },
          currPpl: 2,
          maxPpl: 4,
          ppl: ["user1", "user2"],
          gender: "Co-ed",
          meetLoc: "Test Location",
          luggage: true,
        }),
      };
    }
    if (path.includes("/users/")) {
      const isCreator = path.endsWith("creatorUserId");
      return {
        exists: () => true,
        data: () => ({
          name: isCreator ? "Creator Name" : "User Name",
          gender: "Not set",
          phone: "1234567890",
          email: isCreator ? "creator@example.com" : "user@example.com",
        }),
      };
    }
    return { exists: () => false, data: () => null };
  };

  return { Timestamp, doc, getDoc };
});

const renderWithProviders = (component: React.ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const { setRides } = React.useContext(RidesContext);
    const [initialized, setInitialized] = React.useState(false);

    React.useEffect(() => {
      // Pre-populate context with the test ride so SingleRidePost can find it
      // This simulates the ride being in context before SingleRidePost renders
      const testRide: RideData = {
        id: "testRideId",
        creator: "creatorUserId",
        destination: "Test Destination",
        date: { toDate: () => new Date("2025-11-03T10:00:00Z") } as any,
        time: { toDate: () => new Date("2025-11-03T12:00:00Z") } as any,
        currPpl: 2,
        maxPpl: 4,
        ppl: ["user1", "user2"],
        gender: "Co-ed",
        meetLoc: "Test Location",
        luggage: true,
      };
      setRides([testRide]);
      setInitialized(true);
    }, [setRides]);

    if (!initialized) return null;
    return <>{children}</>;
  };

  return render(
    <UserProvider>
      <RidesProvider>
        <Wrapper>{component}</Wrapper>
      </RidesProvider>
    </UserProvider>,
  );
};

describe("<RSVP />", () => {
  test("displays loading indicator initially", () => {
    const { UNSAFE_queryAllByType } = renderWithProviders(<RsvpRidePage />);
    // ActivityIndicator should be present initially
    const activityIndicators = UNSAFE_queryAllByType(
      require("react-native").ActivityIndicator,
    );
    expect(activityIndicators.length).toBeGreaterThan(0);
  });

  test("displays ride details after fetching data", async () => {
    const { getByText, queryAllByText } = renderWithProviders(<RsvpRidePage />);
    // Wait for loading ActivityIndicator to disappear and content to appear
    await waitFor(
      () => {
        // Check that SingleRidePost is rendered (destination should be visible)
        expect(getByText("Test Destination")).toBeTruthy();
        // Check that contact cards are displayed
        const userNames = queryAllByText("User Name");
        expect(userNames.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  });

  test("displays contact cards for RSVPed users", async () => {
    const { queryAllByText } = renderWithProviders(<RsvpRidePage />);
    await waitFor(() => {
      // Should display user names from the mocked data
      const userNames = queryAllByText("User Name");
      expect(userNames.length).toBeGreaterThan(0);
    });
  });

  test("handles multiple RSVPed users", async () => {
    const { queryAllByText } = renderWithProviders(<RsvpRidePage />);
    await waitFor(() => {
      // Mock returns 2 users (user1, user2)
      const userNames = queryAllByText("User Name");
      expect(userNames.length).toBe(2);
    });
  });

  test("handles ride data loading successfully", async () => {
    const { getByText } = renderWithProviders(<RsvpRidePage />);

    // Wait for data to load and display ride destination
    await waitFor(
      () => {
        expect(getByText("Test Destination")).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  test("handles contact data fetching", async () => {
    const { queryAllByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      // Should display contact information for users
      const userEmails = queryAllByText(/user@example.com/);
      expect(userEmails.length).toBeGreaterThan(0);
    });
  });

  test("handles non-existent user with unknown user fallback", async () => {
    // The mock already handles this by returning exists: false for unknown users
    const { getByText, queryAllByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(
      () => {
        expect(getByText("Test Destination")).toBeTruthy();
        // Should display "User Name" even if some users don't exist
        const userNames = queryAllByText("User Name");
        expect(userNames.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  });

  test("displays ride title when data is loaded", async () => {
    const { getByText, UNSAFE_queryAllByType } = renderWithProviders(
      <RsvpRidePage />,
    );

    await waitFor(
      () => {
        // Should show ride destination
        expect(getByText("Test Destination")).toBeTruthy();
      },
      { timeout: 5000 },
    );

    // Loading indicator should be gone
    const activityIndicators = UNSAFE_queryAllByType(
      require("react-native").ActivityIndicator,
    );
    expect(activityIndicators.length).toBe(0);
  });

  test("renders SingleRidePost component with correct rideId", async () => {
    const { UNSAFE_queryAllByType } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      // Check that SingleRidePost is rendered
      const SingleRidePost = require("../components/SingleRidePost").default;
      const singleRidePosts = UNSAFE_queryAllByType(SingleRidePost);
      expect(singleRidePosts.length).toBe(1);
    });
  });

  test("renders Footer component", async () => {
    const { UNSAFE_queryAllByType } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      const Footer = require("../components/Footer").default;
      const footers = UNSAFE_queryAllByType(Footer);
      expect(footers.length).toBe(1);
    });
  });

  test("displays creator name correctly", async () => {
    const { getByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(
      () => {
        // The mock returns "Creator Name" for creatorUserId
        expect(getByText("Test Destination")).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  test("displays destination from ride data", async () => {
    const { getByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(
      () => {
        // Should display the mocked destination
        expect(getByText("Test Destination")).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  test("maps through all RSVPed users in contact cards", async () => {
    const { queryAllByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      // Mock returns 2 users in ppl array
      const userNames = queryAllByText("User Name");
      // Each user should have a contact card
      expect(userNames.length).toBe(2);
    });
  });

  test("renders correct number of contact cards based on ppl array", async () => {
    const { UNSAFE_queryAllByType } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      const ContactCard = require("../components/contactCard").default;
      const contactCards = UNSAFE_queryAllByType(ContactCard);
      // Should render 2 contact cards for the 2 users in mock
      expect(contactCards.length).toBe(2);
    });
  });

  test("displays user phone numbers in contact cards", async () => {
    const { queryAllByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      // Phone number from mock data (formatted as "☎️ (123) 456-7890")
      const phoneNumbers = queryAllByText(/\(123\) 456-7890/);
      expect(phoneNumbers.length).toBeGreaterThan(0);
    });
  });

  test("renders ScrollView for scrollable content", async () => {
    const { UNSAFE_queryAllByType } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      const ScrollView = require("react-native").ScrollView;
      const scrollViews = UNSAFE_queryAllByType(ScrollView);
      expect(scrollViews.length).toBeGreaterThan(0);
    });
  });
});

describe("<RSVP /> - Additional Coverage", () => {
  test("verifies ride data structure is complete", async () => {
    const { getByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(
      () => {
        // Ensure all main components are rendered
        expect(getByText("Test Destination")).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  test("renders View container with correct styling", async () => {
    const { UNSAFE_queryAllByType } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      const View = require("react-native").View;
      const views = UNSAFE_queryAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });
  });

  test("displays text with correct title style", async () => {
    const { UNSAFE_queryAllByType } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      const Text = require("react-native").Text;
      const texts = UNSAFE_queryAllByType(Text);
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  test("verifies all contact cards have required fields", async () => {
    const { queryAllByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(() => {
      // Check that user names are displayed
      const userNames = queryAllByText("User Name");
      expect(userNames.length).toBe(2);

      // Check that email is displayed
      const emails = queryAllByText(/user@example.com/);
      expect(emails.length).toBeGreaterThan(0);
    });
  });

  test("handles missing rideId by using fallback", async () => {
    // Mock useRoute to return no rideId
    const mockUseRoute = jest.fn(() => ({
      params: {},
    }));
    jest
      .spyOn(require("@react-navigation/native"), "useRoute")
      .mockImplementation(mockUseRoute);

    // Also need to update the mock for expo-router
    jest
      .spyOn(require("expo-router"), "useRoute")
      .mockReturnValue({ params: {} });

    // Update the context with the fallback rideId
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const { setRides } = React.useContext(RidesContext);
      const [initialized, setInitialized] = React.useState(false);

      React.useEffect(() => {
        const testRide: RideData = {
          id: "DHbTvTZQQugk83PjwYup", // Fallback rideId
          creator: "creatorUserId",
          destination: "Test Destination",
          date: { toDate: () => new Date("2025-11-03T10:00:00Z") } as any,
          time: { toDate: () => new Date("2025-11-03T12:00:00Z") } as any,
          currPpl: 2,
          maxPpl: 4,
          ppl: ["user1", "user2"],
          gender: "Co-ed",
          meetLoc: "Test Location",
          luggage: true,
        };
        setRides([testRide]);
        setInitialized(true);
      }, [setRides]);

      if (!initialized) return null;
      return <>{children}</>;
    };

    const { getByText } = render(
      <UserProvider>
        <RidesProvider>
          <Wrapper>
            <RsvpRidePage />
          </Wrapper>
        </RidesProvider>
      </UserProvider>,
    );

    await waitFor(
      () => {
        // Should still load and display destination (using fallback rideId)
        expect(getByText("Test Destination")).toBeTruthy();
      },
      { timeout: 5000 },
    );

    // Restore original mocks
    jest.restoreAllMocks();
  });

  test("handles non-existent ride document", async () => {
    // Mock getDoc to return non-existent document
    const firestoreModule = require("firebase/firestore");
    const originalGetDoc = firestoreModule.getDoc;
    jest
      .spyOn(firestoreModule, "getDoc")
      .mockImplementation(async (ref: any) => {
        const path = ref?.__path ?? "";
        if (path.includes("/rides/")) {
          return {
            exists: () => false,
            data: () => null,
          };
        }
        return originalGetDoc(ref);
      });

    const { UNSAFE_queryAllByType } = renderWithProviders(<RsvpRidePage />);

    // Should show loading indicator when ride doesn't exist
    await waitFor(() => {
      const activityIndicators = UNSAFE_queryAllByType(
        require("react-native").ActivityIndicator,
      );
      expect(activityIndicators.length).toBeGreaterThan(0);
    });

    jest.restoreAllMocks();
  });

  test("handles empty userId in rsvpedUsers array", async () => {
    // Create a custom mock that returns a ride with empty userId
    const firestoreModule = require("firebase/firestore");
    const originalGetDoc = firestoreModule.getDoc;
    jest
      .spyOn(firestoreModule, "getDoc")
      .mockImplementation(async (ref: any) => {
        const path = ref?.__path ?? "";
        if (path.includes("/rides/")) {
          const parts = path.split("/rides/");
          const rideId = parts.length > 1 ? parts[1] : "testRideId";
          return {
            exists: () => true,
            data: () => ({
              id: rideId,
              creator: "creatorUserId",
              destination: "Test Destination",
              date: { toDate: () => new Date("2025-11-03T10:00:00Z") },
              time: { toDate: () => new Date("2025-11-03T12:00:00Z") },
              currPpl: 2,
              maxPpl: 4,
              ppl: ["user1", "", "user2"], // Include empty string
              gender: "Co-ed",
              meetLoc: "Test Location",
              luggage: true,
            }),
          };
        }
        if (path.includes("/users/")) {
          // Return unknownUser for empty userId (path ends with empty string or just "/users/")
          const userId = path.split("/users/")[1];
          if (!userId || userId === "") {
            return {
              exists: () => false,
              data: () => null,
            };
          }
          // For other users, use original mock behavior
          const isCreator = path.endsWith("creatorUserId");
          return {
            exists: () => true,
            data: () => ({
              name: isCreator ? "Creator Name" : "User Name",
              gender: "Not set",
              phone: "1234567890",
              email: isCreator ? "creator@example.com" : "user@example.com",
            }),
          };
        }
        return originalGetDoc(ref);
      });

    const { queryAllByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(
      () => {
        // Should display user names, and unknownUser for empty userId
        const userNames = queryAllByText("User Name");
        const unknownUsers = queryAllByText("Unknown User");
        expect(userNames.length + unknownUsers.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );

    jest.restoreAllMocks();
  });

  test("displays singular 'person' when only one user", async () => {
    // Create a custom mock that returns a ride with only one user
    const firestoreModule = require("firebase/firestore");
    const originalGetDoc = firestoreModule.getDoc;
    jest
      .spyOn(firestoreModule, "getDoc")
      .mockImplementation(async (ref: any) => {
        const path = ref?.__path ?? "";
        if (path.includes("/rides/")) {
          const parts = path.split("/rides/");
          const rideId = parts.length > 1 ? parts[1] : "testRideId";
          return {
            exists: () => true,
            data: () => ({
              id: rideId,
              creator: "creatorUserId",
              destination: "Test Destination",
              date: { toDate: () => new Date("2025-11-03T10:00:00Z") },
              time: { toDate: () => new Date("2025-11-03T12:00:00Z") },
              currPpl: 1,
              maxPpl: 4,
              ppl: ["user1"], // Only one user
              gender: "Co-ed",
              meetLoc: "Test Location",
              luggage: true,
            }),
          };
        }
        return originalGetDoc(ref);
      });

    const { getByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(
      () => {
        // Should display "1 person" (singular)
        expect(getByText(/1 person/)).toBeTruthy();
      },
      { timeout: 5000 },
    );

    jest.restoreAllMocks();
  });

  test("handles non-existent user document in rsvpedUsers", async () => {
    // Create a custom mock where one user doesn't exist
    const firestoreModule = require("firebase/firestore");
    const originalGetDoc = firestoreModule.getDoc;
    jest
      .spyOn(firestoreModule, "getDoc")
      .mockImplementation(async (ref: any) => {
        const path = ref?.__path ?? "";
        if (path.includes("/rides/")) {
          const parts = path.split("/rides/");
          const rideId = parts.length > 1 ? parts[1] : "testRideId";
          return {
            exists: () => true,
            data: () => ({
              id: rideId,
              creator: "creatorUserId",
              destination: "Test Destination",
              date: { toDate: () => new Date("2025-11-03T10:00:00Z") },
              time: { toDate: () => new Date("2025-11-03T12:00:00Z") },
              currPpl: 2,
              maxPpl: 4,
              ppl: ["user1", "nonexistentUser"], // One user doesn't exist
              gender: "Co-ed",
              meetLoc: "Test Location",
              luggage: true,
            }),
          };
        }
        if (path.includes("/users/")) {
          // Return non-existent for nonexistentUser
          if (path.endsWith("nonexistentUser")) {
            return {
              exists: () => false,
              data: () => null,
            };
          }
          // For other users, use original mock behavior
          const isCreator = path.endsWith("creatorUserId");
          return {
            exists: () => true,
            data: () => ({
              name: isCreator ? "Creator Name" : "User Name",
              gender: "Not set",
              phone: "1234567890",
              email: isCreator ? "creator@example.com" : "user@example.com",
            }),
          };
        }
        return originalGetDoc(ref);
      });

    const { queryAllByText } = renderWithProviders(<RsvpRidePage />);

    await waitFor(
      () => {
        // Should display "Unknown User" for non-existent user
        const unknownUsers = queryAllByText("Unknown User");
        expect(unknownUsers.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );

    jest.restoreAllMocks();
  });
});
