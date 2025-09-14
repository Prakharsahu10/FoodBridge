// Mock data for development and testing purposes
import { FoodListing } from "../types";

// ===== SAMPLE FOOD LISTINGS =====
// Sample food listings for UI testing and development
export const mockFoodListings: FoodListing[] = [
  {
    id: "listing-1",
    donorId: "donor-1",
    donorName: "Sarah Kitchen",
    donorRating: 4.8,
    title: "Fresh Vegetable Curry & Rice",
    description:
      "Homemade vegetable curry with basmati rice. Made with organic vegetables and aromatic spices. Perfect for a healthy meal!",
    foodType: "veg",
    quantity: 4,
    expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    pickupLocation: {
      latitude: 12.975,
      longitude: 77.599,
      address: "MG Road, Bangalore, KA 560001",
    },
    images: [
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1563379091339-03246963d4d6?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: "listing-2",
    donorId: "donor-2",
    donorName: "Mumbai Restaurant",
    donorRating: 4.5,
    title: "Chicken Biryani (Large Portion)",
    description:
      "Authentic Mumbai-style chicken biryani with raita and pickle. Freshly prepared this afternoon. Contains dairy and nuts.",
    foodType: "non-veg",
    quantity: 6,
    expiryTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    pickupLocation: {
      latitude: 12.9712,
      longitude: 77.594,
      address: "Brigade Road, Bangalore, KA 560025",
    },
    images: [
      "https://images.unsplash.com/photo-1563379091339-03246963d4d6?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: ["receiver-1"],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
  {
    id: "listing-3",
    donorId: "donor-3",
    donorName: "Green Valley Cafe",
    donorRating: 4.9,
    title: "Vegan Buddha Bowl",
    description:
      "Nutritious vegan buddha bowl with quinoa, roasted vegetables, avocado, and tahini dressing. All organic ingredients.",
    foodType: "vegan",
    quantity: 2,
    expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    pickupLocation: {
      latitude: 12.968,
      longitude: 77.59,
      address: "Indiranagar, Bangalore, KA 560038",
    },
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: [],
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    updatedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
  },
  {
    id: "listing-4",
    donorId: "donor-4",
    donorName: "Family Kitchen",
    donorRating: 4.6,
    title: "Pasta with Marinara Sauce",
    description:
      "Classic spaghetti with homemade marinara sauce and fresh basil. Family recipe passed down for generations.",
    foodType: "veg",
    quantity: 3,
    expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    pickupLocation: {
      latitude: 12.961,
      longitude: 77.584,
      address: "Koramangala, Bangalore, KA 560034",
    },
    images: [
      "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: ["receiver-2", "receiver-3"],
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
  },
  {
    id: "listing-5",
    donorId: "demo-user-123", // Current demo user's listing
    donorName: "Demo User",
    donorRating: 4.8,
    title: "Grilled Salmon with Vegetables",
    description:
      "Fresh grilled salmon with seasonal roasted vegetables. High protein, healthy meal perfect for dinner.",
    foodType: "non-veg",
    quantity: 2,
    expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    pickupLocation: {
      latitude: 12.98,
      longitude: 77.61,
      address: "Whitefield, Bangalore, KA 560066",
    },
    images: [
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: ["receiver-4"],
    createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
  },
  {
    id: "listing-6",
    donorId: "donor-5",
    donorName: "Taco Express",
    donorRating: 4.7,
    title: "Vegetarian Tacos & Salsa",
    description:
      "Fresh corn tortillas filled with black beans, grilled vegetables, cheese, and homemade salsa. Includes chips and guacamole.",
    foodType: "veg",
    quantity: 5,
    expiryTime: new Date(Date.now() + 4.5 * 60 * 60 * 1000), // 4.5 hours from now
    pickupLocation: {
      latitude: 12.9725,
      longitude: 77.5955,
      address: "Church Street, Bangalore, KA 560001",
    },
    images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: [],
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
  },
  {
    id: "listing-7",
    donorId: "donor-6",
    donorName: "Mama's Kitchen",
    donorRating: 4.9,
    title: "Homemade Lasagna",
    description:
      "Traditional Italian lasagna with layers of pasta, meat sauce, ricotta, and mozzarella. Baked fresh this morning.",
    foodType: "non-veg",
    quantity: 8,
    expiryTime: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours from now
    pickupLocation: {
      latitude: 12.965,
      longitude: 77.589,
      address: "Jayanagar, Bangalore, KA 560041",
    },
    images: [
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: ["receiver-5"],
    createdAt: new Date(Date.now() - 40 * 60 * 1000), // 40 mins ago
    updatedAt: new Date(Date.now() - 35 * 60 * 1000),
  },
  {
    id: "listing-8",
    donorId: "donor-7",
    donorName: "Zen Garden Cafe",
    donorRating: 4.6,
    title: "Quinoa Power Bowl",
    description:
      "Superfood bowl with quinoa, kale, chickpeas, roasted sweet potato, and tahini lemon dressing. Gluten-free and vegan.",
    foodType: "vegan",
    quantity: 3,
    expiryTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000), // 3.5 hours from now
    pickupLocation: {
      latitude: 12.97,
      longitude: 77.6,
      address: "Malleshwaram, Bangalore, KA 560003",
    },
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: [],
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
    updatedAt: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "listing-9",
    donorId: "donor-8",
    donorName: "Golden Dragon",
    donorRating: 4.4,
    title: "Fried Rice & Spring Rolls",
    description:
      "Vegetable fried rice with scrambled eggs and fresh spring rolls. Served with sweet and sour sauce.",
    foodType: "veg",
    quantity: 4,
    expiryTime: new Date(Date.now() + 5.5 * 60 * 60 * 1000), // 5.5 hours from now
    pickupLocation: {
      latitude: 12.96,
      longitude: 77.58,
      address: "BTM Layout, Bangalore, KA 560076",
    },
    images: [
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: ["receiver-6", "receiver-7"],
    createdAt: new Date(Date.now() - 55 * 60 * 1000), // 55 mins ago
    updatedAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: "listing-10",
    donorId: "donor-9",
    donorName: "Mediterranean Bistro",
    donorRating: 4.8,
    title: "Falafel Wrap & Hummus Plate",
    description:
      "Fresh falafel wrapped in warm pita with cucumber, tomatoes, and tzatziki sauce. Includes hummus and fresh vegetables.",
    foodType: "veg",
    quantity: 6,
    expiryTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000), // 2.5 hours from now
    pickupLocation: {
      latitude: 12.976,
      longitude: 77.603,
      address: "Ulsoor, Bangalore, KA 560008",
    },
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: [],
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "listing-11",
    donorId: "donor-10",
    donorName: "Spice Route",
    donorRating: 4.7,
    title: "Chicken Tikka Masala & Naan",
    description:
      "Authentic chicken tikka masala with basmati rice and fresh garlic naan. Rich, creamy, and mildly spiced.",
    foodType: "non-veg",
    quantity: 5,
    expiryTime: new Date(Date.now() + 6.5 * 60 * 60 * 1000), // 6.5 hours from now
    pickupLocation: {
      latitude: 37.7649,
      longitude: -122.4194,
      address: "456 Irving St, San Francisco, CA 94122",
    },
    images: [
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: ["receiver-8"],
    createdAt: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "listing-12",
    donorId: "donor-11",
    donorName: "Farm Fresh Bakery",
    donorRating: 4.5,
    title: "Fresh Bread & Pastries",
    description:
      "Assorted fresh baked goods including sourdough bread, croissants, muffins, and Danish pastries. Perfect for breakfast!",
    foodType: "veg",
    quantity: 10,
    expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    pickupLocation: {
      latitude: 37.7749,
      longitude: -122.4094,
      address: "789 Divisadero St, San Francisco, CA 94117",
    },
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1555507036-ab794f1d6230?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: [],
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "listing-13",
    donorId: "donor-12",
    donorName: "Smoothie Haven",
    donorRating: 4.3,
    title: "Acai Bowls & Smoothies",
    description:
      "Fresh acai bowls topped with granola, berries, and honey. Includes green smoothies made with spinach, banana, and mango.",
    foodType: "vegan",
    quantity: 4,
    expiryTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000), // 1.5 hours from now
    pickupLocation: {
      latitude: 37.7549,
      longitude: -122.4094,
      address: "321 Ocean Ave, San Francisco, CA 94112",
    },
    images: [
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
    ],
    status: "available",
    requestedBy: ["receiver-9"],
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    updatedAt: new Date(Date.now() - 2 * 60 * 1000),
  },
];

// ===== MOCK API FUNCTIONS =====
// Simulates API call to fetch nearby food listings based on location
export const getMockNearbyListings = async (
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<FoodListing[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return available listings for demo
  return mockFoodListings.filter((listing) => listing.status === "available");
};

// Simulates API call to fetch user's own food listings
export const getMockUserListings = async (
  userId: string
): Promise<FoodListing[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockFoodListings.filter((listing) => listing.donorId === userId);
};
