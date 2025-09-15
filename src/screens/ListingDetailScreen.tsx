// Detailed view screen for individual food listings with request functionality
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services/api";
import { deleteFoodListing } from "../services/database";
import { FoodListing, FoodRequest, NavigationParamList } from "../types";

type ListingDetailScreenRouteProp = RouteProp<
  NavigationParamList,
  "ListingDetail"
>;
type ListingDetailScreenNavigationProp = StackNavigationProp<
  NavigationParamList,
  "ListingDetail"
>;

interface Props {
  route: ListingDetailScreenRouteProp;
  navigation: ListingDetailScreenNavigationProp;
}

export default function ListingDetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const { user } = useAuth();
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListingDetails();
  }, [listingId]);

  // Load detailed information for the selected food listing
  const loadListingDetails = async () => {
    try {
      const listingData = await FirestoreService.getFoodListing(listingId);
      if (listingData) {
        setListing(listingData);

        // Load requests if user is the donor
        if (user?.id === listingData.donorId) {
          const requestsData = await FirestoreService.getListingRequests(
            listingId
          );
          setRequests(requestsData);
        }
      } else {
        Alert.alert("Error", "Listing not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading listing details:", error);
      Alert.alert("Error", "Failed to load listing details");
    } finally {
      setLoading(false);
    }
  };

  // Handle food request from receiver to donor
  const handleRequestFood = async () => {
    if (!user || !listing) return;

    try {
      await FirestoreService.createFoodRequest({
        listingId: listing.id,
        requesterId: user.id,
        requesterName: user.name,
        status: "pending",
      });
      Alert.alert("Success", "Your request has been sent!");
      loadListingDetails(); // Refresh to show updated status
    } catch (error) {
      console.error("Error requesting food:", error);
      Alert.alert("Error", "Failed to send request");
    }
  };

  // Accept food request and mark listing as claimed
  const handleAcceptRequest = async (
    requestId: string,
    requesterId: string
  ) => {
    if (!listing) return;

    try {
      // Update request status
      await FirestoreService.updateFoodRequest(requestId, {
        status: "accepted",
      });

      // Update listing status
      await FirestoreService.updateFoodListing(listing.id, {
        status: "claimed",
        claimedBy: requesterId,
      });

      Alert.alert(
        "Success",
        "Request accepted! You can now chat with the requester."
      );
      loadListingDetails();
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  // Reject food request from receiver
  const handleRejectRequest = async (requestId: string) => {
    try {
      await FirestoreService.updateFoodRequest(requestId, {
        status: "rejected",
      });
      Alert.alert("Success", "Request rejected.");
      loadListingDetails();
    } catch (error) {
      console.error("Error rejecting request:", error);
      Alert.alert("Error", "Failed to reject request");
    }
  };

  // Navigate to chat screen with the other user
  const handleStartChat = () => {
    if (!listing) return;

    const otherUserId =
      user?.role === "donor" ? listing.claimedBy : listing.donorId;
    if (otherUserId) {
      navigation.navigate("Chat", { listingId: listing.id, otherUserId });
    }
  };

  // Delete food listing with confirmation dialog
  const handleDeleteListing = () => {
    if (!listing) return;

    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this food listing? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFoodListing(listing.id);
              Alert.alert("Success", "Listing deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting listing:", error);
              Alert.alert("Error", "Failed to delete listing");
            }
          },
        },
      ]
    );
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

  const renderRequest = ({ item }: { item: FoodRequest }) => (
    <View
      style={{
        // requestCard - backgroundColor: "white", padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: "#E5E5E5"
        backgroundColor: "white",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E5E5",
      }}
    >
      <View
        style={{
          // requestHeader - flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            // requesterName - fontSize: 16, fontWeight: "600", color: "#333"
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
          }}
        >
          {item.requesterName}
        </Text>
        <View
          style={[
            {
              // requestStatus - paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            },
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text
            style={{
              // requestStatusText - fontSize: 12, fontWeight: "600", color: "white"
              fontSize: 12,
              fontWeight: "600",
              color: "white",
            }}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {item.message && (
        <Text
          style={{
            // requestMessage - fontSize: 14, color: "#666", marginBottom: 10
            fontSize: 14,
            color: "#666",
            marginBottom: 10,
          }}
        >
          {item.message}
        </Text>
      )}

      {item.status === "pending" && (
        <View
          style={{
            // requestActions - flexDirection: "row", justifyContent: "flex-end", gap: 10
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <TouchableOpacity
            style={{
              // rejectButton - backgroundColor: "#FF4444", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8
              backgroundColor: "#FF4444",
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={() => handleRejectRequest(item.id)}
          >
            <Text
              style={{
                // rejectButtonText - color: "white", fontSize: 14, fontWeight: "600"
                color: "white",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Reject
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              // acceptButton - backgroundColor: "#2E8B57", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8
              backgroundColor: "#2E8B57",
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={() => handleAcceptRequest(item.id, item.requesterId)}
          >
            <Text
              style={{
                // acceptButtonText - color: "white", fontSize: 14, fontWeight: "600"
                color: "white",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading || !listing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center", // justify-center
          alignItems: "center", // items-center
          backgroundColor: "#F0F8FF", // bg-blue-50
        }}
      >
        <Text
          style={{
            fontSize: 16, // text-base
            color: "#666", // text-gray-600
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  const isDonor = user?.id === listing.donorId;
  const isReceiver = user?.role === "receiver";
  const canRequest =
    isReceiver &&
    listing.status === "available" &&
    !listing.requestedBy.includes(user?.id || "");
  const canChat =
    listing.status === "claimed" && (isDonor || listing.claimedBy === user?.id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F8FF" }}>
      <ScrollView style={{ flex: 1 }}>
        {listing.images && listing.images.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            style={{
              height: 250, // h-64
            }}
          >
            {listing.images.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{
                  width: 400, // w-96
                  height: 250, // h-64
                  resizeMode: "cover",
                }}
              />
            ))}
          </ScrollView>
        )}

        <View
          style={{
            padding: 20, // p-5
            backgroundColor: "white", // bg-white
            marginTop: -10, // -mt-2.5
            borderTopLeftRadius: 20, // rounded-tl-2xl
            borderTopRightRadius: 20, // rounded-tr-2xl
          }}
        >
          <View
            style={{
              flexDirection: "row", // flex-row
              justifyContent: "space-between", // justify-between
              alignItems: "center", // items-center
              marginBottom: 15, // mb-4
            }}
          >
            <Text
              style={{
                fontSize: 24, // text-2xl
                fontWeight: "bold", // font-bold
                color: "#333", // text-gray-800
                flex: 1,
              }}
            >
              {listing.title}
            </Text>
            <View
              style={{
                paddingHorizontal: 12, // px-3
                paddingVertical: 6, // py-1.5
                borderRadius: 15, // rounded-full
                backgroundColor: getStatusColor(listing.status),
              }}
            >
              <Text
                style={{
                  color: "white", // text-white
                  fontSize: 12, // text-xs
                  fontWeight: "bold", // font-bold
                }}
              >
                {listing.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 16, // text-base
              color: "#666", // text-gray-600
              lineHeight: 24, // leading-6
              marginBottom: 20, // mb-5
            }}
          >
            {listing.description}
          </Text>

          <View
            style={{
              marginBottom: 20, // mb-5
            }}
          >
            <View
              style={{
                flexDirection: "row", // flex-row
                alignItems: "center", // items-center
                marginBottom: 10, // mb-2.5
              }}
            >
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text
                style={{
                  fontSize: 16, // text-base
                  color: "#333", // text-gray-800
                  marginLeft: 10, // ml-2.5
                }}
              >
                Serves {listing.quantity} people
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row", // flex-row
                alignItems: "center", // items-center
                marginBottom: 10, // mb-2.5
              }}
            >
              <Ionicons name="leaf-outline" size={20} color="#666" />
              <Text
                style={{
                  fontSize: 16, // text-base
                  color: "#333", // text-gray-800
                  marginLeft: 10, // ml-2.5
                }}
              >
                {listing.foodType}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row", // flex-row
                alignItems: "center", // items-center
                marginBottom: 10, // mb-2.5
              }}
            >
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text
                style={{
                  fontSize: 16, // text-base
                  color: "#FF6B35", // text-orange-500
                  marginLeft: 10, // ml-2.5
                }}
              >
                {formatTimeLeft(listing.expiryTime)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row", // flex-row
                alignItems: "center", // items-center
                marginBottom: 10, // mb-2.5
              }}
            >
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text
                style={{
                  fontSize: 16, // text-base
                  color: "#333", // text-gray-800
                  marginLeft: 10, // ml-2.5
                }}
              >
                {listing.pickupLocation.address}
              </Text>
            </View>
          </View>

          <View
            style={{
              // donorSection - backgroundColor: "white", padding: 20, marginTop: 15, borderRadius: 10
              backgroundColor: "white",
              padding: 20,
              marginTop: 15,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                // sectionTitle - fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15
                fontSize: 18,
                fontWeight: "bold",
                color: "#333",
                marginBottom: 15,
              }}
            >
              Donor Information
            </Text>
            <View
              style={{
                // donorInfo - flexDirection: "row", alignItems: "center"
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="person-circle-outline" size={40} color="#666" />
              <View
                style={{
                  // donorDetails - marginLeft: 15
                  marginLeft: 15,
                }}
              >
                <Text
                  style={{
                    // donorName - fontSize: 16, fontWeight: "600", color: "#333"
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {listing.donorName}
                </Text>
                <View
                  style={{
                    // rating - flexDirection: "row", alignItems: "center", marginTop: 2
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text
                    style={{
                      // ratingText - fontSize: 14, color: "#666", marginLeft: 4
                      fontSize: 14,
                      color: "#666",
                      marginLeft: 4,
                    }}
                  >
                    {listing.donorRating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {isDonor && requests.length > 0 && (
            <View
              style={{
                // requestsSection - backgroundColor: "white", padding: 20, marginTop: 15, borderRadius: 10
                backgroundColor: "white",
                padding: 20,
                marginTop: 15,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  // sectionTitle - fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: 15,
                }}
              >
                Requests ({requests.length})
              </Text>
              <FlatList
                data={requests}
                renderItem={renderRequest}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          <View
            style={{
              // actions - flexDirection: "row", gap: 10, marginTop: 20
              flexDirection: "row",
              gap: 10,
              marginTop: 20,
            }}
          >
            {canRequest && (
              <TouchableOpacity
                style={{
                  // requestButton - flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#2E8B57", paddingVertical: 15, borderRadius: 10, gap: 8
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#2E8B57",
                  paddingVertical: 15,
                  borderRadius: 10,
                  gap: 8,
                }}
                onPress={handleRequestFood}
              >
                <Ionicons name="restaurant-outline" size={20} color="white" />
                <Text
                  style={{
                    // requestButtonText - color: "white", fontSize: 16, fontWeight: "600"
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Request This Food
                </Text>
              </TouchableOpacity>
            )}

            {canChat && (
              <TouchableOpacity
                style={{
                  // chatButton - flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#007AFF", paddingVertical: 15, borderRadius: 10, gap: 8
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#007AFF",
                  paddingVertical: 15,
                  borderRadius: 10,
                  gap: 8,
                }}
                onPress={handleStartChat}
              >
                <Ionicons name="chatbubble-outline" size={20} color="white" />
                <Text
                  style={{
                    // chatButtonText - color: "white", fontSize: 16, fontWeight: "600"
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Start Chat
                </Text>
              </TouchableOpacity>
            )}

            {isDonor && (
              <TouchableOpacity
                style={{
                  // deleteButton - flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#DC2626", paddingVertical: 15, borderRadius: 10, gap: 8
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#DC2626",
                  paddingVertical: 15,
                  borderRadius: 10,
                  gap: 8,
                }}
                onPress={handleDeleteListing}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text
                  style={{
                    // deleteButtonText - color: "white", fontSize: 16, fontWeight: "600"
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Delete Listing
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
