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
 * Firestore service class for all database operations.
 * Provides methods for users, listings, requests, chats, and ratings.
 * Each method interacts with Firestore or Firebase Storage to perform CRUD and query operations.
 */
export class FirestoreService {
  /**
   * Creates or updates a user document in Firestore.
   * @param userId - The unique user ID.
   * @param userData - User data excluding id and createdAt.
   */
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

  /**
   * Retrieves a user document by userId.
   * @param userId - The unique user ID.
   * @returns User object or null if not found.
   */
  static async getUser(userId: string): Promise<User | null> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  }

  /**
   * Updates a user document with provided fields.
   * @param userId - The unique user ID.
   * @param updates - Partial user fields to update.
   */
  static async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
  }

  /**
   * Creates a new food listing document.
   * @param listingData - Listing data excluding id, createdAt, updatedAt.
   * @returns The new listing's document ID.
   */
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

  /**
   * Retrieves a food listing by its ID.
   * @param listingId - The listing's document ID.
   * @returns FoodListing object or null if not found.
   */
  static async getFoodListing(listingId: string): Promise<FoodListing | null> {
    const listingRef = doc(db, "listings", listingId);
    const listingSnap = await getDoc(listingRef);

    if (listingSnap.exists()) {
      return { id: listingSnap.id, ...listingSnap.data() } as FoodListing;
    }
    return null;
  }

  /**
   * Updates a food listing document with provided fields.
   * @param listingId - The listing's document ID.
   * @param updates - Partial listing fields to update.
   */
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

  /**
   * Gets nearby food listings within a radius from the user's location.
   * Uses a simple Haversine filter on the client side.
   * @param userLat - User's latitude.
   * @param userLng - User's longitude.
   * @param radiusKm - Search radius in kilometers (default 10).
   * @returns Array of FoodListing objects within the radius.
   */
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

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      // Convert Firestore Timestamp to JS Date for expiryTime, createdAt, updatedAt
      const expiryTime =
        data.expiryTime && data.expiryTime.toDate
          ? data.expiryTime.toDate()
          : data.expiryTime;
      const createdAt =
        data.createdAt && data.createdAt.toDate
          ? data.createdAt.toDate()
          : data.createdAt;
      const updatedAt =
        data.updatedAt && data.updatedAt.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt;
      // Calculate distance from user to listing
      const distance = this.calculateDistance(
        userLat,
        userLng,
        data.pickupLocation.latitude,
        data.pickupLocation.longitude
      );
      if (distance <= radiusKm) {
        listings.push({
          ...data,
          id: docSnap.id,
          expiryTime,
          createdAt,
          updatedAt,
        });
      }
    });

    return listings;
  }

  /**
   * Gets all listings created by a specific user.
   * @param userId - The user's ID (donor).
   * @returns Array of FoodListing objects.
   */
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

  /**
   * Creates a new food request document.
   * @param requestData - Request data excluding id and createdAt.
   * @returns The new request's document ID.
   */
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

  /**
   * Updates a food request document with provided fields.
   * @param requestId - The request's document ID.
   * @param updates - Partial request fields to update.
   */
  static async updateFoodRequest(
    requestId: string,
    updates: Partial<FoodRequest>
  ): Promise<void> {
    const requestRef = doc(db, "requests", requestId);
    await updateDoc(requestRef, updates);
  }

  /**
   * Gets all requests for a specific listing.
   * @param listingId - The listing's document ID.
   * @returns Array of FoodRequest objects.
   */
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

  /**
   * Sends a chat message by creating a new message document.
   * @param messageData - Message data excluding id and timestamp.
   * @returns The new message's document ID.
   */
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

  /**
   * Subscribes to real-time chat messages for a listing.
   * Calls the callback with the latest messages on update.
   * @param listingId - The listing's document ID.
   * @param callback - Function to call with array of ChatMessage objects.
   * @returns Unsubscribe function.
   */
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

  /**
   * Uploads an image to Firebase Storage and returns its download URL.
   * @param uri - The local URI of the image.
   * @param path - The storage path in Firebase.
   * @returns The download URL of the uploaded image.
   */
  static async uploadImage(uri: string, path: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();

    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, blob);

    return await getDownloadURL(imageRef);
  }

  /**
   * Creates a new rating document.
   * @param ratingData - Rating data excluding id and createdAt.
   * @returns The new rating's document ID.
   */
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

  /**
   * Gets all ratings for a specific user.
   * @param userId - The user who was rated.
   * @returns Array of Rating objects.
   */
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

  /**
   * Calculates the distance between two geographic points using the Haversine formula.
   * @param lat1 - Latitude of point 1.
   * @param lng1 - Longitude of point 1.
   * @param lat2 - Latitude of point 2.
   * @param lng2 - Longitude of point 2.
   * @returns Distance in kilometers.
   */
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

  /**
   * Converts degrees to radians.
   * @param deg - Angle in degrees.
   * @returns Angle in radians.
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
