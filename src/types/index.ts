// Type definitions for FoodBridge application

// User account and profile interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: "donor" | "receiver";
  phone?: string;
  profileImage?: string;
  isVerified: boolean;
  rating: number;
  totalDonations?: number;
  totalReceived?: number;
  createdAt: Date;
}

// Food listing/donation interface
export interface FoodListing {
  id: string;
  donorId: string;
  donorName: string;
  donorRating: number;
  title: string;
  description: string;
  foodType: "veg" | "non-veg" | "vegan";
  quantity: number; // approx number of people
  expiryTime: Date;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images: string[];
  status: "available" | "requested" | "claimed" | "completed" | "expired";
  claimedBy?: string;
  requestedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Food request interface for claiming listings
export interface FoodRequest {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Date;
}

// Chat message interface for user communication
export interface ChatMessage {
  id: string;
  listingId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: "text" | "image" | "location";
}

// Rating and feedback interface
export interface Rating {
  id: string;
  listingId: string;
  raterId: string;
  ratedUserId: string;
  rating: number; // 1-5
  comment?: string;
  type: "donor" | "receiver";
  createdAt: Date;
}

// React Navigation parameter list
export interface NavigationParamList {
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  HomeTabs: undefined;
  Map: undefined;
  CreateListing: undefined;
  ListingDetail: { listingId: string };
  Chat: { listingId: string; otherUserId: string };
  Profile: undefined;
  Settings: undefined;
  [key: string]: undefined | object;
}

// Geographic coordinates interface
export interface LocationCoords {
  latitude: number;
  longitude: number;
}
