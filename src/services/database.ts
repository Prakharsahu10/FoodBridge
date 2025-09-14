// Firebase Firestore database operations for FoodBridge app
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { FoodListing, FoodRequest, ChatMessage, Rating, User } from "../types";

// ===== FOOD LISTINGS OPERATIONS =====
// Create new food listing in Firestore
export const createFoodListing = async (
  listing: Omit<FoodListing, "id" | "createdAt" | "updatedAt">
) => {
  const docRef = await addDoc(collection(db, "listings"), {
    ...listing,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

// Fetch available food listings with pagination
export const getFoodListings = async (limitCount: number = 20) => {
  try {
    console.log("Database: Getting food listings from Firestore...");
    // Query listings ordered by creation date (newest first)
    const q = query(
      collection(db, "listings"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    console.log(
      "Database: Query returned",
      querySnapshot.docs.length,
      "documents"
    );

    // Convert Firestore timestamps to Date objects and filter available listings
    const listings = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        console.log(
          "Database: Processing document",
          doc.id,
          "with data:",
          data
        );
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          expiryTime: data.expiryTime.toDate(),
        } as FoodListing;
      })
      .filter((listing) => listing.status === "available");

    console.log("Database: Returning", listings.length, "listings");
    return listings;
  } catch (error) {
    console.error("Database: Error getting food listings:", error);
    throw error;
  }
};

// Get single food listing by ID
export const getFoodListingById = async (id: string) => {
  const docRef = doc(db, "listings", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      expiryTime: data.expiryTime.toDate(),
    } as FoodListing;
  }
  return null;
};

// Update existing food listing
export const updateFoodListing = async (
  id: string,
  updates: Partial<FoodListing>
) => {
  const docRef = doc(db, "listings", id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

// Delete food listing permanently
export const deleteFoodListing = async (id: string) => {
  const docRef = doc(db, "listings", id);
  await deleteDoc(docRef);
};

// ===== FOOD REQUESTS OPERATIONS =====
// Create new food request from receiver to donor
export const createFoodRequest = async (
  request: Omit<FoodRequest, "id" | "createdAt">
) => {
  const docRef = await addDoc(collection(db, "requests"), {
    ...request,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

// Get all requests for a specific food listing
export const getFoodRequestsByListing = async (listingId: string) => {
  const q = query(
    collection(db, "requests"),
    where("listingId", "==", listingId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as FoodRequest[];
};

// ===== CHAT MESSAGES OPERATIONS =====
// Send new chat message between donor and receiver
export const sendChatMessage = async (
  message: Omit<ChatMessage, "id" | "timestamp">
) => {
  const docRef = await addDoc(collection(db, "chats"), {
    ...message,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
};

// Get chat messages for a specific listing
export const getChatMessages = async (
  listingId: string,
  limitCount: number = 50
) => {
  const q = query(
    collection(db, "chats"),
    where("listingId", "==", listingId),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
  })) as ChatMessage[];
};

// ===== USER MANAGEMENT OPERATIONS =====
// Update user profile information
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
) => {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

// Get user profile by ID
export const getUserById = async (userId: string) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as User;
  }
  return null;
};
