// Mock authentication service for development and testing
import { User } from "../types";

let currentUser: User | null = null;
let authListeners: ((user: User | null) => void)[] = [];

/**
 * Mock authentication service for development purposes
 * Simulates Firebase Auth behavior without actual backend
 */
export const mockAuthService = {
  // Simulate user sign in
  signIn: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create mock user based on email
    const user: User = {
      id: "mock-user-" + Date.now(),
      name: email.split("@")[0], // Use part before @ as name
      email: email,
      role: email.includes("donor") ? "donor" : "receiver",
      phone: "+1234567890",
      profileImage: `https://ui-avatars.com/api/?name=${
        email.split("@")[0]
      }&background=2E8B57&color=fff`,
      createdAt: new Date(),
      isVerified: true,
      rating: 4.5,
      totalDonations: email.includes("donor") ? 12 : undefined,
      totalReceived: email.includes("receiver") ? 8 : undefined,
    };

    currentUser = user;
    // Notify all listeners of auth state change
    authListeners.forEach((listener) => listener(user));

    return user;
  },

  // Simulate user registration
  signUp: async (
    email: string,
    password: string,
    name: string,
    role: "donor" | "receiver"
  ): Promise<User> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const user: User = {
      id: "mock-user-" + Date.now(),
      name: name,
      email: email,
      role: role,
      phone: "+1234567890",
      profileImage: `https://ui-avatars.com/api/?name=${name}&background=2E8B57&color=fff`,
      createdAt: new Date(),
      isVerified: true,
      rating: 4.0,
      totalDonations: role === "donor" ? 0 : undefined,
      totalReceived: role === "receiver" ? 0 : undefined,
    };

    currentUser = user;
    // Notify all listeners of auth state change
    authListeners.forEach((listener) => listener(user));

    return user;
  },

  // Simulate user sign out
  signOut: async (): Promise<void> => {
    currentUser = null;
    // Notify all listeners of auth state change
    authListeners.forEach((listener) => listener(null));
  },

  // Get current authenticated user
  getCurrentUser: (): User | null => {
    return currentUser;
  },

  // Listen for authentication state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    authListeners.push(callback);
    // Immediately call with current user state
    callback(currentUser);

    // Return unsubscribe function
    return () => {
      authListeners = authListeners.filter((listener) => listener !== callback);
    };
  },
};
