// Main feed screen showing food listings based on user role (donor/receiver)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { getFoodListings } from "../services/database";
import { FoodListing } from "../types";
import { StackNavigationProp } from "@react-navigation/stack";
import { NavigationParamList } from "../types";

type HomeScreenNavigationProp = StackNavigationProp<
  NavigationParamList,
  "Home"
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = async () => {
    try {
      console.log("Loading listings from Firebase...");
      // Load all available listings from Firebase
      const availableListings = await getFoodListings(50); // Get up to 50 listings
      console.log("Loaded listings:", availableListings.length);
      setListings(availableListings);
    } catch (error) {
      console.error("Error loading listings:", error);
      Alert.alert("Error", "Failed to load food listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [user]);

  // Refresh listings when screen comes into focus (e.g., after creating a new listing)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("HomeScreen focused, refreshing listings...");
      loadListings();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const handleRequestFood = async (listingId: string) => {
    if (!user) return;

    try {
      // Mock food request - just show success message
      console.log("Mock food request:", {
        listingId,
        requesterId: user.id,
        requesterName: user.name,
        status: "pending",
      });

      Alert.alert("Success", "Your request has been sent!");
      loadListings(); // Refresh to show updated status
    } catch (error) {
      console.error("Error requesting food:", error);
      Alert.alert("Error", "Failed to send request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "#2E8B57";
      case "requested":
        return "#FF8C00";
      case "claimed":
        return "#DC143C";
      case "completed":
        return "#808080";
      default:
        return "#808080";
    }
  };

  const formatTimeLeft = (expiryTime: Date) => {
    const now = new Date();
    const diff = expiryTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff <= 0) return "Expired";
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const renderListingItem = ({ item }: { item: FoodListing }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "white", // bg-white
        marginHorizontal: 15, // mx-4
        marginVertical: 8, // my-2
        borderRadius: 12, // rounded-xl
        shadowColor: "#000", // shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() =>
        navigation.navigate("ListingDetail", { listingId: item.id })
      }
    >
      {item.images && item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0] }}
          style={{
            width: "100%", // w-full
            height: 200, // h-48
            borderTopLeftRadius: 12, // rounded-t-xl
            borderTopRightRadius: 12,
          }}
        />
      )}

      <View
        style={{
          padding: 15, // p-4
        }}
      >
        <View
          style={{
            flexDirection: "row", // flex-row
            justifyContent: "space-between", // justify-between
            alignItems: "center", // items-center
            marginBottom: 8, // mb-2
          }}
        >
          <Text
            style={{
              fontSize: 18, // text-lg
              fontWeight: "bold", // font-bold
              color: "#333", // text-gray-800
              flex: 1,
            }}
          >
            {item.title}
          </Text>
          <View
            style={{
              paddingHorizontal: 8, // px-2
              paddingVertical: 4, // py-1
              borderRadius: 12, // rounded-xl
              backgroundColor: getStatusColor(item.status),
            }}
          >
            <Text
              style={{
                color: "white", // text-white
                fontSize: 12, // text-xs
                fontWeight: "bold", // font-bold
              }}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 14, // text-sm
            color: "#666", // text-gray-600
            marginBottom: 12, // mb-3
          }}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View
          style={{
            flexDirection: "row", // flex-row
            justifyContent: "space-between", // justify-between
            marginBottom: 12, // mb-3
          }}
        >
          <View
            style={{
              flexDirection: "row", // flex-row
              alignItems: "center", // items-center
            }}
          >
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text
              style={{
                fontSize: 12, // text-xs
                color: "#666", // text-gray-600
                marginLeft: 4, // ml-1
              }}
            >
              Serves {item.quantity}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row", // flex-row
              alignItems: "center", // items-center
            }}
          >
            <Ionicons name="leaf-outline" size={16} color="#666" />
            <Text
              style={{
                fontSize: 12, // text-xs
                color: "#666", // text-gray-600
                marginLeft: 4, // ml-1
              }}
            >
              {item.foodType}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row", // flex-row
              alignItems: "center", // items-center
            }}
          >
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text
              style={{
                fontSize: 12, // text-xs
                color: "#FF6B35", // text-orange-500
                marginLeft: 4, // ml-1
              }}
            >
              {formatTimeLeft(item.expiryTime)}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row", // flex-row
            alignItems: "center", // items-center
            marginBottom: 12, // mb-3
          }}
        >
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text
            style={{
              fontSize: 14, // text-sm
              color: "#666", // text-gray-600
              marginLeft: 4, // ml-1
              flex: 1,
            }}
          >
            {item.donorName}
          </Text>
          <View
            style={{
              flexDirection: "row", // flex-row
              alignItems: "center", // items-center
            }}
          >
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text
              style={{
                fontSize: 12, // text-xs
                color: "#666", // text-gray-600
                marginLeft: 2, // ml-0.5
              }}
            >
              {item.donorRating.toFixed(1)}
            </Text>
          </View>
        </View>

        {user?.role === "receiver" && item.status === "available" && (
          <TouchableOpacity
            style={{
              backgroundColor: "#2E8B57", // bg-green-600
              paddingVertical: 12, // py-3
              borderRadius: 8, // rounded-lg
              alignItems: "center", // items-center
            }}
            onPress={() => handleRequestFood(item.id)}
          >
            <Text
              style={{
                color: "white", // text-white
                fontSize: 16, // text-base
                fontWeight: "bold", // font-bold
              }}
            >
              Request Food
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const EmptyComponent = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center", // justify-center
        alignItems: "center", // items-center
        padding: 40, // p-10
      }}
    >
      <Ionicons name="fast-food-outline" size={64} color="#CCC" />
      <Text
        style={{
          fontSize: 20, // text-xl
          fontWeight: "bold", // font-bold
          color: "#666", // text-gray-600
          marginTop: 20, // mt-5
          marginBottom: 10, // mb-2.5
        }}
      >
        {user?.role === "donor"
          ? "No donations yet"
          : "No food available nearby"}
      </Text>
      <Text
        style={{
          fontSize: 16, // text-base
          color: "#999", // text-gray-500
          textAlign: "center", // text-center
          lineHeight: 24, // leading-6
        }}
      >
        {user?.role === "donor"
          ? "Start making a difference by sharing surplus food!"
          : "Check back later or explore the map view."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F0F8FF", // bg-blue-50
      }}
    >
      <View
        style={{
          padding: 20, // p-5
          backgroundColor: "white", // bg-white
          borderBottomWidth: 1, // border-b
          borderBottomColor: "#E0E0E0", // border-gray-300
        }}
      >
        <Text
          style={{
            fontSize: 24, // text-2xl
            fontWeight: "bold", // font-bold
            color: "#2E8B57", // text-green-600
          }}
        >
          {user?.role === "donor" ? "My Donations" : "Available Food"}
        </Text>
        <Text
          style={{
            fontSize: 16, // text-base
            color: "#666", // text-gray-600
            marginTop: 5, // mt-1
          }}
        >
          Welcome back, {user?.name}!
        </Text>
      </View>

      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        style={{
          flex: 1,
        }}
        contentContainerStyle={
          listings.length === 0
            ? {
                flexGrow: 1,
                justifyContent: "center", // justify-center
              }
            : undefined
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? <EmptyComponent /> : null}
      />
    </SafeAreaView>
  );
}
