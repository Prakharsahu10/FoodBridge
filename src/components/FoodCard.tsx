// Reusable card component for displaying food listings
import React from "react";
import { View, Text, TouchableOpacity, Image, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FoodListing } from "../types";
import { TimeUtils } from "../utils/helpers";

interface FoodCardProps {
  listing: FoodListing;
  onPress: () => void;
  onRequestPress?: () => void;
  showRequestButton?: boolean;
  style?: ViewStyle;
  distance?: string;
}

export function FoodCard({
  listing,
  onPress,
  onRequestPress,
  showRequestButton = false,
  style,
  distance,
}: FoodCardProps) {
  // Returns color based on food listing status
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

  // Returns appropriate emoji icon for food type
  const getFoodTypeIcon = (foodType: string) => {
    switch (foodType) {
      case "veg":
        return "🥬";
      case "non-veg":
        return "🍖";
      case "vegan":
        return "🌱";
      default:
        return "🍽️";
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: "white", // bg-white
          borderRadius: 12, // rounded-xl
          shadowColor: "#000", // shadow
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          marginVertical: 8, // my-2
          overflow: "hidden",
        },
        style,
      ]}
      onPress={onPress}
    >
      {/* Food image display */}
      {listing.images && listing.images.length > 0 && (
        <Image
          source={{ uri: listing.images[0] }}
          style={{
            width: "100%", // w-full
            height: 150, // h-36
            resizeMode: "cover",
          }}
        />
      )}

      <View
        style={{
          padding: 15, // p-4
        }}
      >
        {/* Title and status row */}
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
              fontSize: 16, // text-base
              fontWeight: "bold", // font-bold
              color: "#333", // text-gray-800
              flex: 1,
            }}
            numberOfLines={1}
          >
            {listing.title}
          </Text>
          {/* Status badge */}
          <View
            style={{
              paddingHorizontal: 8, // px-2
              paddingVertical: 4, // py-1
              borderRadius: 10, // rounded-lg
              backgroundColor: getStatusColor(listing.status),
            }}
          >
            <Text
              style={{
                color: "white", // text-white
                fontSize: 10, // text-xs
                fontWeight: "bold", // font-bold
              }}
            >
              {listing.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Description text */}
        <Text
          style={{
            fontSize: 14, // text-sm
            color: "#666", // text-gray-600
            marginBottom: 12, // mb-3
            lineHeight: 18, // leading-tight
          }}
          numberOfLines={2}
        >
          {listing.description}
        </Text>

        {/* Food type, quantity, and expiry info row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          {/* Food type indicator */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: 14, marginRight: 4 }}>
              {getFoodTypeIcon(listing.foodType)}
            </Text>
            <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
              {listing.foodType}
            </Text>
          </View>
          {/* Quantity info */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
              Serves {listing.quantity}
            </Text>
          </View>
          {/* Expiry time info */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={{ fontSize: 12, color: "#FF6B35", marginLeft: 4 }}>
              {TimeUtils.formatTimeLeft(listing.expiryTime)}
            </Text>
          </View>
        </View>
        {/* Distance info (if provided) on its own row for better alignment */}
        {distance && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
              {distance}
            </Text>
          </View>
        )}

        {/* Donor info and request button row */}
        <View
          style={{
            flexDirection: "row", // flex-row
            justifyContent: "space-between", // justify-between
            alignItems: "center", // items-center
          }}
        >
          {/* Donor name and rating */}
          <View
            style={{
              flexDirection: "row", // flex-row
              alignItems: "center", // items-center
              flex: 1,
            }}
          >
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text
              style={{
                fontSize: 12, // text-xs
                color: "#666", // text-gray-600
                marginLeft: 4, // ml-1
                flex: 1,
              }}
            >
              {listing.donorName}
            </Text>
            <View
              style={{
                flexDirection: "row", // flex-row
                alignItems: "center", // items-center
              }}
            >
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text
                style={{
                  fontSize: 10, // text-xs
                  color: "#666", // text-gray-600
                  marginLeft: 2, // ml-0.5
                }}
              >
                {listing.donorRating.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Request button for available listings */}
          {showRequestButton && listing.status === "available" && (
            <TouchableOpacity
              style={{
                backgroundColor: "#2E8B57", // bg-green-600
                paddingHorizontal: 12, // px-3
                paddingVertical: 6, // py-1.5
                borderRadius: 15, // rounded-full
              }}
              onPress={(e) => {
                e.stopPropagation();
                onRequestPress?.();
              }}
            >
              <Text
                style={{
                  color: "white", // text-white
                  fontSize: 12, // text-xs
                  fontWeight: "bold", // font-bold
                }}
              >
                Request
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
