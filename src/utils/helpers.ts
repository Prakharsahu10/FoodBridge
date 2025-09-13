// Utility functions for location, time, validation, and other common operations
import * as Location from "expo-location";
import { LocationCoords } from "../types";

/**
 * Location-related utility functions
 * Handles permissions, coordinates, and address operations
 */
export const LocationUtils = {
  // Request device location permissions
  async requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  },

  // Get user's current location coordinates
  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  },

  // Convert coordinates to human-readable address
  async getAddressFromCoords(coords: LocationCoords): Promise<string> {
    try {
      const addressResponse = await Location.reverseGeocodeAsync(coords);
      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        return `${addr.street || ""} ${addr.city || ""}, ${addr.region || ""} ${
          addr.postalCode || ""
        }`.trim();
      }
      return "Unknown location";
    } catch (error) {
      console.error("Error getting address:", error);
      return "Unknown location";
    }
  },

  // Calculate distance between two points using Haversine formula
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
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
  },

  // Convert degrees to radians for distance calculations
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  },

  // Format distance for user-friendly display
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  },
};

/**
 * Time-related utility functions
 * Handles expiry times, relative dates, and time formatting
 */
export const TimeUtils = {
  // Format time remaining until food expires
  formatTimeLeft(expiryTime: Date): string {
    const now = new Date();
    const diff = expiryTime.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }

    return `${minutes}m left`;
  },

  // Check if food has expired
  isExpired(expiryTime: Date): boolean {
    return new Date() > expiryTime;
  },

  // Get relative time string (e.g., "2 hours ago")
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    return "Just now";
  },
};

/**
 * Validation utility functions
 * Handles form validation and data integrity checks
 */
export const ValidationUtils = {
  // Validate email address format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number format
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Validate password strength
  isValidPassword(password: string): boolean {
    return password.length >= 6;
  },

  // Validate food listing form data
  validateFoodListing(data: {
    title: string;
    description: string;
    quantity: string;
    expiryTime: Date;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title.trim()) {
      errors.push("Title is required");
    }

    if (!data.description.trim()) {
      errors.push("Description is required");
    }

    if (!data.quantity.trim() || parseInt(data.quantity) <= 0) {
      errors.push("Quantity must be greater than 0");
    }

    if (data.expiryTime <= new Date()) {
      errors.push("Expiry time must be in the future");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

/**
 * Image processing utility functions
 * Handles image compression and manipulation
 */
export const ImageUtils = {
  // Compress image for efficient upload
  async compressImage(uri: string, quality: number = 0.8): Promise<string> {
    // Placeholder - in production, use proper image compression library
    return uri;
  },

  // Get image dimensions for layout calculations
  getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      // Placeholder - in production, get actual image dimensions
      resolve({ width: 400, height: 300 });
    });
  },
};

/**
 * Notification utility functions
 * Handles notification message formatting
 */
export const NotificationUtils = {
  // Format notification messages based on type
  formatNotificationMessage(type: string, data: any): string {
    switch (type) {
      case "food_request":
        return `${data.requesterName} requested your food: ${data.foodTitle}`;
      case "request_accepted":
        return `Your request for ${data.foodTitle} has been accepted!`;
      case "request_rejected":
        return `Your request for ${data.foodTitle} has been declined.`;
      case "food_expiring":
        return `Your food listing "${data.foodTitle}" expires in 1 hour!`;
      case "new_message":
        return `New message from ${data.senderName}`;
      default:
        return "You have a new notification";
    }
  },
};
