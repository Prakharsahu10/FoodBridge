// Authentication context provider for managing user state
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";

// Interface defining authentication context methods and state
interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component
 * Manages user authentication state and provides auth methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user setup for development/testing purposes
    const mockUser: User = {
      id: "demo-user-123",
      email: "demo@foodbridge.com",
      name: "Demo User",
      role: "donor", // Change to 'receiver' if you want to test receiver features
      phone: "+1234567890",
      profileImage:
        "https://ui-avatars.com/api/?name=Demo+User&background=2E8B57&color=fff",
      isVerified: true,
      rating: 4.8,
      totalDonations: 15,
      totalReceived: undefined,
      createdAt: new Date(),
    };

    // Set mock user immediately for testing
    setUser(mockUser);
    setLoading(false);
  }, []);

  // Placeholder login function for development
  const login = async (email: string, password: string) => {
    console.log("Login disabled for UI testing");
  };

  // Placeholder register function for development
  const register = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    console.log("Register disabled for UI testing");
  };

  // Placeholder logout function for development
  const logout = async () => {
    console.log("Logout disabled for UI testing");
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
