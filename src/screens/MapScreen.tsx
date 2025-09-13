// Map view screen showing nearby food listings with location-based filtering
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useAuth } from "../contexts/AuthContext";
import { getMockNearbyListings } from "../data/mockData";
import { FoodCard } from "../components";
import { FoodListing, LocationCoords } from "../types";
import { StackNavigationProp } from "@react-navigation/stack";
import { NavigationParamList } from "../types";

type MapScreenNavigationProp = StackNavigationProp<NavigationParamList, "Map">;

interface Props {
  navigation: MapScreenNavigationProp;
}

export default function MapScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getCurrentLocation();

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("Location timeout reached, using default location");
        setUserLocation({
          latitude: 12.9716, // Bangalore latitude
          longitude: 77.5946, // Bangalore longitude
        });
        setLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (userLocation) {
      loadNearbyListings();
    }
  }, [userLocation]);

  const getCurrentLocation = async () => {
    try {
      console.log("Requesting location permission...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Permission status:", status);

      if (status !== "granted") {
        console.log("Permission denied");
        Alert.alert(
          "Permission Denied",
          "Location permission is needed to show nearby food listings."
        );
        setLoading(false);
        return;
      }

      console.log("Getting current position...");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log("Location received:", location.coords);

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
      console.log("User location set:", coords);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Error",
        "Failed to get your location. Using default location for demo."
      );
      // Set a default location for testing
      setUserLocation({
        latitude: 12.9716, // Bangalore latitude
        longitude: 77.5946, // Bangalore longitude
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyListings = async () => {
    if (!userLocation) return;

    console.log("Loading nearby listings for location:", userLocation);
    setRefreshing(true);
    try {
      const nearbyListings = await getMockNearbyListings(
        userLocation.latitude,
        userLocation.longitude,
        25 // 25km radius
      );
      console.log("Nearby listings received:", nearbyListings.length);

      const availableListings = nearbyListings.filter(
        (listing: FoodListing) => listing.status === "available"
      );
      console.log("Available listings:", availableListings.length);

      setListings(availableListings);
    } catch (error) {
      console.error("Error loading nearby listings:", error);
      Alert.alert("Error", "Failed to load nearby food listings");
      // For testing, set empty array
      setListings([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRequestFood = async (listing: FoodListing) => {
    if (!user) return;

    try {
      // Mock food request - just show success message
      console.log("Mock food request:", {
        listingId: listing.id,
        requesterId: user.id,
        requesterName: user.name,
        status: "pending",
      });

      Alert.alert("Success", "Your request has been sent!");
      loadNearbyListings(); // Refresh listings
    } catch (error) {
      console.error("Error requesting food:", error);
      Alert.alert("Error", "Failed to send request");
    }
  };

  const calculateDistance = (listing: FoodListing): string => {
    if (
      !userLocation ||
      !listing.pickupLocation ||
      typeof userLocation.latitude !== "number" ||
      typeof userLocation.longitude !== "number" ||
      typeof listing.pickupLocation.latitude !== "number" ||
      typeof listing.pickupLocation.longitude !== "number"
    ) {
      return "Distance unknown";
    }

    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(
      listing.pickupLocation.latitude - userLocation.latitude
    );
    const dLng = deg2rad(
      listing.pickupLocation.longitude - userLocation.longitude
    );
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(userLocation.latitude)) *
        Math.cos(deg2rad(listing.pickupLocation.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    // If distance is abnormally large, show unknown
    if (!isFinite(distance) || distance > 1000) {
      return "Distance unknown";
    }
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const renderFoodCard = ({ item }: { item: FoodListing }) => (
    <View style={{ marginBottom: 10 }}>
      <FoodCard
        listing={item}
        onPress={() =>
          navigation.navigate("ListingDetail", { listingId: item.id })
        }
        onRequestPress={() => handleRequestFood(item)}
        showRequestButton={user?.role === "receiver"}
        distance={calculateDistance(item)}
      />
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center", // justify-center
          alignItems: "center", // items-center
          backgroundColor: "#f5f5f5", // bg-gray-100
        }}
      >
        <Ionicons name="location-outline" size={64} color="#2E8B57" />
        <Text
          style={{
            fontSize: 16, // text-base
            color: "#666", // text-gray-600
            marginTop: 16, // mt-4
          }}
        >
          Getting your location...
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#2E8B57", // bg-green-600
            paddingHorizontal: 24, // px-6
            paddingVertical: 12, // py-3
            borderRadius: 8, // rounded-lg
            marginTop: 20, // mt-5
          }}
          onPress={() => {
            console.log("Skipping location, using default");
            setUserLocation({
              latitude: 37.7749,
              longitude: -122.4194,
            });
            setLoading(false);
          }}
        >
          <Text
            style={{
              color: "white", // text-white
              fontWeight: "600", // font-semibold
            }}
          >
            Skip & Use Default Location
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f5f5f5", // bg-gray-100
      }}
    >
      <View
        style={{
          backgroundColor: "white", // bg-white
          paddingHorizontal: 20, // px-5
          paddingVertical: 15, // py-4
          borderBottomWidth: 1, // border-b
          borderBottomColor: "#E5E5E5", // border-gray-200
          flexDirection: "row", // flex-row
          justifyContent: "space-between", // justify-between
          alignItems: "center", // items-center
        }}
      >
        <View
          style={{
            flexDirection: "row", // flex-row
            alignItems: "center", // items-center
          }}
        >
          <Ionicons name="map-outline" size={24} color="#2E8B57" />
          <View
            style={{
              marginLeft: 12, // ml-3
            }}
          >
            <Text
              style={{
                fontSize: 18, // text-lg
                fontWeight: "bold", // font-bold
                color: "#2E8B57", // text-green-600
              }}
            >
              Nearby Food
            </Text>
            <Text
              style={{
                fontSize: 14, // text-sm
                color: "#666", // text-gray-600
              }}
            >
              {listings.length} listings within 25km
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            padding: 8, // p-2
            borderRadius: 8, // rounded-lg
            backgroundColor: "#F0F8F0", // bg-green-50
          }}
          onPress={loadNearbyListings}
        >
          <Ionicons name="refresh" size={20} color="#2E8B57" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listings}
        renderItem={renderFoodCard}
        keyExtractor={(item) => item.id}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          padding: 15, // p-4
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadNearbyListings}
            colors={["#2E8B57"]}
            tintColor="#2E8B57"
          />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center", // justify-center
              alignItems: "center", // items-center
              paddingVertical: 80, // py-20
            }}
          >
            <Ionicons name="location-outline" size={64} color="#CCC" />
            <Text
              style={{
                fontSize: 20, // text-xl
                fontWeight: "bold", // font-bold
                color: "#666", // text-gray-600
                marginTop: 16, // mt-4
                marginBottom: 8, // mb-2
              }}
            >
              No Food Available Nearby
            </Text>
            <Text
              style={{
                fontSize: 16, // text-base
                color: "#999", // text-gray-500
                textAlign: "center", // text-center
                lineHeight: 24, // leading-6
                paddingHorizontal: 40, // px-10
              }}
            >
              Try expanding your search radius or check back later for new
              listings.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
