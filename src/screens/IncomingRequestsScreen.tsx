// Screen to show incoming requests for donor's listings
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services/api";
import { FoodRequest, FoodListing } from "../types";

export default function IncomingRequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // 1. Get all listings created by this user
      const listings = await FirestoreService.getUserListings(user.id);
      console.log("Listings for donor:", listings);
      const listingIds = listings.map((l: FoodListing) => l.id);
      // 2. Get all requests for these listings
      let allRequests: FoodRequest[] = [];
      for (const listingId of listingIds) {
        const reqs = await FirestoreService.getListingRequests(listingId);
        console.log(`Requests for listing ${listingId}:`, reqs);
        allRequests = allRequests.concat(reqs);
      }
      console.log("All requests for donor:", allRequests);
      setRequests(allRequests);
    } catch (error) {
      Alert.alert("Error", "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await FirestoreService.updateFoodRequest(requestId, { status });
      Alert.alert("Success", `Request ${status}`);
      fetchRequests(); // Refresh list
    } catch (error) {
      Alert.alert("Error", `Failed to update request status`);
    }
  };

  const renderRequest = ({ item }: { item: FoodRequest }) => (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#eee" }}>
      <Text style={{ fontWeight: "bold" }}>
        Request from: {item.requesterName}
      </Text>
      <Text>Status: {item.status}</Text>
      <Text>Listing ID: {item.listingId}</Text>
      {item.status === "pending" && (
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#4CAF50",
              padding: 8,
              borderRadius: 4,
              marginRight: 8,
            }}
            onPress={() => handleUpdateStatus(item.id, "accepted")}
          >
            <Text style={{ color: "#fff" }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "#F44336", padding: 8, borderRadius: 4 }}
            onPress={() => handleUpdateStatus(item.id, "rejected")}
          >
            <Text style={{ color: "#fff" }}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", margin: 16 }}>
        Incoming Requests
      </Text>
      {loading ? (
        <Text style={{ margin: 16 }}>Loading...</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          ListEmptyComponent={
            <Text style={{ margin: 16 }}>No requests found.</Text>
          }
        />
      )}
    </View>
  );
}
