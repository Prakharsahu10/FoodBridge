// Firestore API service layer for database operations
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  onSnapshot,
  GeoPoint,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";
import { User, FoodListing, FoodRequest, ChatMessage, Rating } from "../types";

/**
 * Firestore service class for all database operations
 * Provides methods for users, listings, requests, chats, and ratings
 */
export class FirestoreService {
  // User CRUD operations
  static async createUser(
    userId: string,
    userData: Omit<User, "id" | "createdAt">
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...userData,
      createdAt: Timestamp.now(),
    });
  }

  static async getUser(userId: string): Promise<User | null> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  }

  static async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
  }

  // Food listing CRUD operations
  static async createFoodListing(
    listingData: Omit<FoodListing, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const listingsRef = collection(db, "listings");
    const docRef = await addDoc(listingsRef, {
      ...listingData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async getFoodListing(listingId: string): Promise<FoodListing | null> {
    const listingRef = doc(db, "listings", listingId);
    const listingSnap = await getDoc(listingRef);

    if (listingSnap.exists()) {
      return { id: listingSnap.id, ...listingSnap.data() } as FoodListing;
    }
    return null;
  }

  static async updateFoodListing(
    listingId: string,
    updates: Partial<FoodListing>
  ): Promise<void> {
    const listingRef = doc(db, "listings", listingId);
    await updateDoc(listingRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // Get nearby listings with geospatial filtering
  static async getNearbyListings(
    userLat: number,
    userLng: number,
    radiusKm: number = 10
  ): Promise<FoodListing[]> {
    // Simple implementation - in production, use proper geospatial query
    const listingsRef = collection(db, "listings");
    const q = query(
      listingsRef,
      where("status", "==", "available"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const listings: FoodListing[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FoodListing;
      // Calculate distance
      const distance = this.calculateDistance(
        userLat,
        userLng,
        data.pickupLocation.latitude,
        data.pickupLocation.longitude
      );

      if (distance <= radiusKm) {
        listings.push({ ...data, id: doc.id });
      }
    });

    return listings;
  }

  // Get user's own listings
  static async getUserListings(userId: string): Promise<FoodListing[]> {
    const listingsRef = collection(db, "listings");
    const q = query(
      listingsRef,
      where("donorId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const listings: FoodListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() } as FoodListing);
    });

    return listings;
  }

  // Food request operations
  static async createFoodRequest(
    requestData: Omit<FoodRequest, "id" | "createdAt">
  ): Promise<string> {
    const requestsRef = collection(db, "requests");
    const docRef = await addDoc(requestsRef, {
      ...requestData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async updateFoodRequest(
    requestId: string,
    updates: Partial<FoodRequest>
  ): Promise<void> {
    const requestRef = doc(db, "requests", requestId);
    await updateDoc(requestRef, updates);
  }

  static async getListingRequests(listingId: string): Promise<FoodRequest[]> {
    const requestsRef = collection(db, "requests");
    const q = query(
      requestsRef,
      where("listingId", "==", listingId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const requests: FoodRequest[] = [];

    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as FoodRequest);
    });

    return requests;
  }

  // Chat message operations
  static async sendMessage(
    messageData: Omit<ChatMessage, "id" | "timestamp">
  ): Promise<string> {
    const messagesRef = collection(db, "messages");
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      timestamp: Timestamp.now(),
    });
    return docRef.id;
  }

  // Real-time message subscription
  static subscribeToMessages(
    listingId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("listingId", "==", listingId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      callback(messages);
    });
  }

  // Image upload to Firebase Storage
  static async uploadImage(uri: string, path: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();

    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, blob);

    return await getDownloadURL(imageRef);
  }

  // Rating and review operations
  static async createRating(
    ratingData: Omit<Rating, "id" | "createdAt">
  ): Promise<string> {
    const ratingsRef = collection(db, "ratings");
    const docRef = await addDoc(ratingsRef, {
      ...ratingData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async getUserRatings(userId: string): Promise<Rating[]> {
    const ratingsRef = collection(db, "ratings");
    const q = query(
      ratingsRef,
      where("ratedUserId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const ratings: Rating[] = [];

    querySnapshot.forEach((doc) => {
      ratings.push({ id: doc.id, ...doc.data() } as Rating);
    });

    return ratings;
  }

  // Calculate distance between two geographic points using Haversine formula
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
