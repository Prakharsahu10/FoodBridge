// Main app entry point for FoodBridge
import "react-native-gesture-handler"; // Required for gesture handling
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

/**
 * Root App component wrapping the entire application
 * Provides authentication context, safe area context, and navigation structure
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar hidden={true} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
