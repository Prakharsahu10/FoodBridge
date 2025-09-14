// User registration screen for creating new accounts
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
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../contexts/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { NavigationParamList } from "../types";

type RegisterScreenNavigationProp = StackNavigationProp<
  NavigationParamList,
  "Register"
>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"donor" | "receiver">("receiver");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // Handle user registration with validation
  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, { name, phone, role });
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
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
        {/* Header Section */}
        <View
          style={{
            alignItems: "center", // items-center
            marginBottom: 30, // mb-8
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
            Join the movement!
          </Text>
        </View>

        {/* Form Section */}
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
            placeholder="Full Name *"
            value={name}
            onChangeText={setName}
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
            placeholder="Email *"
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
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Role Picker */}
          <View
            style={{
              backgroundColor: "white", // bg-white
              borderRadius: 8, // rounded-lg
              marginBottom: 15, // mb-4
              borderWidth: 1, // border
              borderColor: "#E0E0E0", // border-gray-300
              paddingHorizontal: 15, // px-4
              paddingVertical: 5, // py-1
            }}
          >
            <Text
              style={{
                fontSize: 16, // text-base
                color: "#666", // text-gray-600
                marginBottom: 5, // mb-1
              }}
            >
              I am a:
            </Text>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue: "donor" | "receiver") =>
                setRole(itemValue)
              }
              style={{
                height: 50, // h-12
                marginBottom: 5, // mb-1
              }}
            >
              <Picker.Item
                label="Food Receiver (NGO/Individual)"
                value="receiver"
              />
              <Picker.Item
                label="Food Donor (Restaurant/Individual)"
                value="donor"
              />
            </Picker>
          </View>

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
            placeholder="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
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
            placeholder="Confirm Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            onPress={handleRegister}
            disabled={loading}
          >
            <Text
              style={{
                color: "white", // text-white
                fontSize: 16, // text-base
                fontWeight: "bold", // font-bold
              }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: "center", // items-center
              marginTop: 20, // mt-5
            }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text
              style={{
                color: "#2E8B57", // text-green-600
                fontSize: 16, // text-base
              }}
            >
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
