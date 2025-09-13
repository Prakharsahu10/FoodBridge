// Initial loading screen shown while checking authentication state
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function SplashScreen() {
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
          fontSize: 32, // text-3xl
          fontWeight: "bold", // font-bold
          color: "#2E8B57", // text-green-600
          marginBottom: 10, // mb-2.5
        }}
      >
        🍽️ FoodBridge
      </Text>
      <Text
        style={{
          fontSize: 16, // text-base
          color: "#666", // text-gray-600
          textAlign: "center", // text-center
          marginHorizontal: 20, // mx-5
          marginBottom: 30, // mb-8
        }}
      >
        Connecting surplus food with those in need
      </Text>
      <ActivityIndicator
        size="large"
        color="#2E8B57"
        style={{
          marginTop: 20, // mt-5
        }}
      />
    </View>
  );
}
