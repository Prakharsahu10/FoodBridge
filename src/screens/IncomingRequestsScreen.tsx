// Screen to show incoming requests for donor's listings
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services/api";
import { FoodRequest, FoodListing } from "../types";
import { FoodCard } from "../components";

export default function IncomingRequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!user) return;
    if (isFocused) {
      // Fallback fetch to populate quickly when screen gains focus
      fetchRequests();
    }
    // Real-time subscription to donor requests
    const unsubscribe = FirestoreService.subscribeToDonorRequests(
      user.id,
      (liveRequests) => {
        console.log("[DEBUG] RT donor requests:", liveRequests?.length || 0);
        // Merge with derived pending from requestedBy
        void (async () => {
          try {
            const donorListings = await FirestoreService.getUserListings(
              user.id
            );
            setListings(donorListings);
            const index = new Set(
              liveRequests.map((r) => `${r.listingId}::${r.requesterId}`)
            );
            const derived: FoodRequest[] = [];
            const requesterIds = new Set<string>();
            donorListings.forEach((listing) => {
              (listing.requestedBy || []).forEach((rid) => {
                const key = `${listing.id}::${rid}`;
                if (!index.has(key)) {
                  requesterIds.add(rid);
                  derived.push({
                    id: `synthetic-${listing.id}-${rid}`,
                    listingId: listing.id,
                    requesterId: rid,
                    requesterName: rid,
                    donorId: user.id,
                    donorName: user.name,
                    status: "pending",
                    createdAt: new Date(),
                  } as FoodRequest);
                }
              });
            });
            if (derived.length) {
              const idToName = new Map<string, string>();
              await Promise.all(
                Array.from(requesterIds).map(async (rid) => {
                  try {
                    const u = await FirestoreService.getUser(rid);
                    if (u?.name) idToName.set(rid, u.name);
                  } catch {}
                })
              );
              derived.forEach((d) => {
                const name = idToName.get(d.requesterId);
                if (name) d.requesterName = name;
              });
            }
            const combined = [...liveRequests, ...derived];
            combined.sort(
              (a, b) => (b.createdAt as any) - (a.createdAt as any)
            );
            setRequests(combined);
            setLoading(false);
          } catch (e) {
            // fallback
            setRequests(liveRequests);
            setLoading(false);
          }
        })();
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [user, isFocused]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // 1. Get all listings created by this user
      if (!user) return;
      const donorListings = await FirestoreService.getUserListings(user.id);
      setListings(donorListings);
      console.log("[DEBUG] Listings for donor:", donorListings);
      if (!donorListings.length) {
        console.log("[DEBUG] No listings found for this donor.");
      }
      // Prefer direct donorId query
      const allRequests: FoodRequest[] =
        await FirestoreService.getRequestsForDonor(user.id);
      console.log("[DEBUG] All requests for donor (by donorId):", allRequests);
      // Derive pending requests from listing.requestedBy if request docs are missing
      const requestsIndex = new Set(
        allRequests.map((r) => `${r.listingId}::${r.requesterId}`)
      );
      const derived: FoodRequest[] = [];
      const requesterIds = new Set<string>();
      donorListings.forEach((listing) => {
        (listing.requestedBy || []).forEach((rid) => {
          const key = `${listing.id}::${rid}`;
          if (!requestsIndex.has(key)) {
            requesterIds.add(rid);
            derived.push({
              id: `synthetic-${listing.id}-${rid}`,
              listingId: listing.id,
              requesterId: rid,
              requesterName: rid,
              donorId: user.id,
              donorName: user.name,
              status: "pending",
              createdAt: new Date(),
            } as FoodRequest);
          }
        });
      });

      if (derived.length) {
        const idToName = new Map<string, string>();
        await Promise.all(
          Array.from(requesterIds).map(async (rid) => {
            try {
              const u = await FirestoreService.getUser(rid);
              if (u?.name) idToName.set(rid, u.name);
            } catch {}
          })
        );
        derived.forEach((d) => {
          const name = idToName.get(d.requesterId);
          if (name) d.requesterName = name;
        });
      }

      const combined = [...allRequests, ...derived];
      combined.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
      setRequests(combined);
    } catch (error) {
      console.error("[IncomingRequestsScreen] Failed to load requests:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load requests";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (requestId: string) => {
    const doDelete = async () => {
      try {
        await FirestoreService.deleteFoodRequest(requestId);
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        Alert.alert("Deleted", "Request removed");
      } catch (e) {
        Alert.alert("Error", "Failed to delete request");
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Delete request?",
          message: "This cannot be undone.",
          options: ["Cancel", "Delete"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) doDelete();
        }
      );
    } else {
      Alert.alert("Delete request?", "This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  const handleUpdateStatus = async (
    item: FoodRequest,
    status: "accepted" | "rejected"
  ) => {
    try {
      const isSynthetic = item.id.startsWith("synthetic-");
      if (isSynthetic && status === "rejected") {
        // Remove requester from listing.requestedBy when no request doc exists
        const listing = listings.find((l) => l.id === item.listingId);
        if (listing) {
          const nextRequestedBy = (listing.requestedBy || []).filter(
            (rid) => rid !== item.requesterId
          );
          await FirestoreService.updateFoodListing(listing.id, {
            requestedBy: nextRequestedBy,
          });
          setListings((prev) =>
            prev.map((l) =>
              l.id === listing.id ? { ...l, requestedBy: nextRequestedBy } : l
            )
          );
          setRequests((prev) => prev.filter((r) => r.id !== item.id));
          Alert.alert("Success", "Request rejected.");
          return;
        }
      }

      // Default path updates the request document
      await FirestoreService.updateFoodRequest(item.id, { status });
      Alert.alert("Success", `Request ${status}`);
      fetchRequests(); // Refresh list
    } catch (error) {
      Alert.alert("Error", `Failed to update request status`);
    }
  };

  const renderRequest = ({ item }: { item: FoodRequest }) => {
    const listing = listings.find((l) => l.id === item.listingId);
    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        {listing ? (
          <FoodCard
            listing={listing}
            onPress={() => {}}
            onLongPress={() => {
              if (item.status === "accepted" || item.status === "rejected") {
                confirmDelete(item.id);
              }
            }}
            style={{ marginVertical: 0 }}
            actions={
              <View>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                  Request from: {item.requesterName}
                </Text>
                {item.message ? (
                  <Text style={{ color: "#555", marginBottom: 6 }}>
                    "{item.message}"
                  </Text>
                ) : null}
                <Text style={{ color: "#666" }}>Status: {item.status}</Text>
                {item.status === "pending" && (
                  <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#4CAF50",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 4,
                        marginRight: 8,
                      }}
                      onPress={() => handleUpdateStatus(item, "accepted")}
                    >
                      <Text style={{ color: "#fff" }}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#F44336",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 4,
                      }}
                      onPress={() => handleUpdateStatus(item, "rejected")}
                    >
                      <Text style={{ color: "#fff" }}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            }
          />
        ) : (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#EEE",
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
              Request from: {item.requesterName}
            </Text>
            {item.message ? (
              <Text style={{ color: "#555", marginBottom: 6 }}>
                {item.message}
              </Text>
            ) : null}
            <Text style={{ color: "#666", marginBottom: 8 }}>
              Listing unavailable (id: {item.listingId})
            </Text>
            <Text style={{ color: "#666" }}>Status: {item.status}</Text>
          </View>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F8FF" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", margin: 16 }}>
        Incoming Requests
      </Text>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchRequests}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
              No incoming requests found for your listings.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
