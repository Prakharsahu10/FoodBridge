// Authentication context provider for managing user state
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { User } from "../types";

// Interface defining authentication context methods and state
interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Firebase user to our User type
  const createUserFromFirebase = async (
    firebaseUser: FirebaseUser
  ): Promise<User> => {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || firebaseUser.displayName || "User",
        role: userData.role || "donor",
        phone: userData.phone || "",
        profileImage: userData.profileImage || firebaseUser.photoURL || "",
        isVerified: userData.isVerified || false,
        rating: userData.rating || 4.0,
        totalDonations: userData.totalDonations || 0,
        totalReceived: userData.totalReceived || 0,
        createdAt: userData.createdAt?.toDate() || new Date(),
      };
    } else {
      // Create new user document if it doesn't exist
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || "User",
        role: "donor",
        phone: "",
        profileImage: firebaseUser.photoURL || "",
        isVerified: false,
        rating: 4.0,
        totalDonations: 0,
        totalReceived: 0,
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...newUser,
        createdAt: new Date(),
      });

      return newUser;
    }
  };

  useEffect(() => {
    console.log("AuthContext: Setting up auth state listener");

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log("AuthContext: Timeout reached, setting loading to false");
      setLoading(false);
    }, 10000); // 10 second timeout

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log(
          "AuthContext: Auth state changed",
          firebaseUser ? "User logged in" : "No user"
        );
        clearTimeout(timeout); // Clear timeout when auth state resolves
        setFirebaseUser(firebaseUser);

        if (firebaseUser) {
          try {
            console.log("AuthContext: Creating user from Firebase");
            const userData = await createUserFromFirebase(firebaseUser);
            console.log(
              "AuthContext: User data created successfully",
              userData
            );
            setUser(userData);
          } catch (error) {
            console.error(
              "AuthContext: Error creating user from Firebase:",
              error
            );
            setUser(null);
          }
        } else {
          console.log("AuthContext: No user, setting user to null");
          setUser(null);
        }

        console.log("AuthContext: Setting loading to false");
        setLoading(false);
      },
      (error) => {
        console.error("AuthContext: Auth state listener error:", error);
        clearTimeout(timeout);
        setUser(null);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user document in Firestore
      const newUser: User = {
        id: result.user.uid,
        email: result.user.email!,
        name: userData.name || "User",
        role: userData.role || "donor",
        phone: userData.phone || "",
        profileImage: userData.profileImage || "",
        isVerified: false,
        rating: 4.0,
        totalDonations: 0,
        totalReceived: 0,
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", result.user.uid), {
        ...newUser,
        createdAt: new Date(),
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Logout failed");
    }
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
