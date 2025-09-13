// User authentication login screen
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { NavigationParamList } from "../types";

type LoginScreenNavigationProp = StackNavigationProp<
  NavigationParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Handle user login attempt
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: "#F0F8FF", // bg-blue-50
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center", // justify-center
          padding: 20, // p-5
        }}
      >
        {/* App branding header */}
        <View
          style={{
            alignItems: "center", // items-center
            marginBottom: 40, // mb-10
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
              fontSize: 18, // text-lg
              color: "#666", // text-gray-600
            }}
          >
            Welcome back!
          </Text>
        </View>

        {/* Login form */}
        <View
          style={{
            width: "100%", // w-full
          }}
        >
          <TextInput
            style={{
              backgroundColor: "white", // bg-white
              paddingHorizontal: 15, // px-4
              paddingVertical: 12, // py-3
              borderRadius: 8, // rounded-lg
              marginBottom: 15, // mb-4
              fontSize: 16, // text-base
              borderWidth: 1, // border
              borderColor: "#E0E0E0", // border-gray-300
            }}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={{
              backgroundColor: "white", // bg-white
              paddingHorizontal: 15, // px-4
              paddingVertical: 12, // py-3
              borderRadius: 8, // rounded-lg
              marginBottom: 15, // mb-4
              fontSize: 16, // text-base
              borderWidth: 1, // border
              borderColor: "#E0E0E0", // border-gray-300
            }}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={{
              backgroundColor: loading ? "#A0A0A0" : "#2E8B57", // bg-green-600 or bg-gray-400
              paddingVertical: 15, // py-4
              borderRadius: 8, // rounded-lg
              alignItems: "center", // items-center
              marginTop: 10, // mt-2.5
            }}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text
              style={{
                color: "white", // text-white
                fontSize: 16, // text-base
                fontWeight: "bold", // font-bold
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          {/* Navigation to registration */}
          <TouchableOpacity
            style={{
              alignItems: "center", // items-center
              marginTop: 20, // mt-5
            }}
            onPress={() => navigation.navigate("Register")}
          >
            <Text
              style={{
                color: "#2E8B57", // text-green-600
                fontSize: 16, // text-base
              }}
            >
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
