// Screen for donors to create new food donation listings
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services/api";
import { LocationCoords } from "../types";

export default function CreateListingScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foodType, setFoodType] = useState<"veg" | "non-veg" | "vegan">("veg");
  const [quantity, setQuantity] = useState("");
  const [expiryTime, setExpiryTime] = useState(
    new Date(Date.now() + 4 * 60 * 60 * 1000)
  ); // 4 hours from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert("Limit Reached", "You can only add up to 3 images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is needed to set pickup location."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setLocation(coords);

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync(coords);
      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const formattedAddress = `${addr.street || ""} ${addr.city || ""}, ${
          addr.region || ""
        } ${addr.postalCode || ""}`.trim();
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your location");
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !quantity || !location || !user) {
      Alert.alert(
        "Error",
        "Please fill in all required fields and set location"
      );
      return;
    }

    if (parseInt(quantity) <= 0) {
      Alert.alert("Error", "Quantity must be greater than 0");
      return;
    }

    if (expiryTime <= new Date()) {
      Alert.alert("Error", "Expiry time must be in the future");
      return;
    }

    setLoading(true);
    try {
      // Upload images if any
      const uploadedImageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const imageUrl = await FirestoreService.uploadImage(
          images[i],
          `listings/${user.id}/${Date.now()}_${i}.jpg`
        );
        uploadedImageUrls.push(imageUrl);
      }

      // Create listing
      await FirestoreService.createFoodListing({
        donorId: user.id,
        donorName: user.name,
        donorRating: user.rating,
        title: title.trim(),
        description: description.trim(),
        foodType,
        quantity: parseInt(quantity),
        expiryTime,
        pickupLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address || "Location set",
        },
        images: uploadedImageUrls,
        status: "available",
        requestedBy: [],
      });

      Alert.alert("Success", "Your food listing has been created!", [
        { text: "OK", onPress: () => resetForm() },
      ]);
    } catch (error) {
      console.error("Error creating listing:", error);
      Alert.alert("Error", "Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFoodType("veg");
    setQuantity("");
    setExpiryTime(new Date(Date.now() + 4 * 60 * 60 * 1000));
    setImages([]);
    setLocation(null);
    setAddress("");
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setExpiryTime(selectedDate);
    }
  };

  return (
    <ScrollView
      style={{
        // container - flex: 1, backgroundColor: "#F0F8FF"
        flex: 1,
        backgroundColor: "#F0F8FF",
      }}
      contentContainerStyle={{
        // content - padding: 20
        padding: 20,
      }}
    >
      <View
        style={{
          // header - marginBottom: 30, alignItems: "center"
          marginBottom: 30,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            // title - fontSize: 28, fontWeight: "bold", color: "#2E8B57", marginBottom: 10
            fontSize: 28,
            fontWeight: "bold",
            color: "#2E8B57",
            marginBottom: 10,
          }}
        >
          🍽️ Share Your Food
        </Text>
        <Text
          style={{
            // subtitle - fontSize: 16, color: "#666", textAlign: "center", lineHeight: 22
            fontSize: 16,
            color: "#666",
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Help reduce food waste by sharing with those in need
        </Text>
      </View>

      <View
        style={{
          // form - gap: 20
          gap: 20,
        }}
      >
        <Text
          style={{
            // label - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Food Title *
        </Text>
        <TextInput
          style={{
            // input - borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: "white"
            borderWidth: 1,
            borderColor: "#DDD",
            borderRadius: 10,
            padding: 15,
            fontSize: 16,
            backgroundColor: "white",
          }}
          placeholder="e.g., Fresh Homemade Biryani"
          value={title}
          onChangeText={setTitle}
        />

        <Text
          style={{
            // label - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Description *
        </Text>
        <TextInput
          style={[
            {
              // input - borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: "white"
              borderWidth: 1,
              borderColor: "#DDD",
              borderRadius: 10,
              padding: 15,
              fontSize: 16,
              backgroundColor: "white",
            },
            {
              // textArea - height: 100, textAlignVertical: "top"
              height: 100,
              textAlignVertical: "top",
            },
          ]}
          placeholder="Describe the food, ingredients, taste, etc."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text
          style={{
            // label - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Food Type *
        </Text>
        <View
          style={{
            // pickerContainer - borderWidth: 1, borderColor: "#DDD", borderRadius: 10, backgroundColor: "white", overflow: "hidden"
            borderWidth: 1,
            borderColor: "#DDD",
            borderRadius: 10,
            backgroundColor: "white",
            overflow: "hidden",
          }}
        >
          <Picker
            selectedValue={foodType}
            onValueChange={(itemValue: "veg" | "non-veg" | "vegan") =>
              setFoodType(itemValue)
            }
            style={{
              // picker - height: 50
              height: 50,
            }}
          >
            <Picker.Item label="🥬 Vegetarian" value="veg" />
            <Picker.Item label="🍖 Non-Vegetarian" value="non-veg" />
            <Picker.Item label="🌱 Vegan" value="vegan" />
          </Picker>
        </View>

        <Text
          style={{
            // label - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Quantity (approx. people served) *
        </Text>
        <TextInput
          style={{
            // input - borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: "white"
            borderWidth: 1,
            borderColor: "#DDD",
            borderRadius: 10,
            padding: 15,
            fontSize: 16,
            backgroundColor: "white",
          }}
          placeholder="e.g., 10"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <Text
          style={{
            // label - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Expiry Time *
        </Text>
        <TouchableOpacity
          style={{
            // dateInput - flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 15, backgroundColor: "white"
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: "#DDD",
            borderRadius: 10,
            padding: 15,
            backgroundColor: "white",
          }}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={{
              // dateText - fontSize: 16, color: "#333"
              fontSize: 16,
              color: "#333",
            }}
          >
            {expiryTime.toLocaleDateString()} {expiryTime.toLocaleTimeString()}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={expiryTime}
            mode="datetime"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <Text
          style={{
            // label - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Pickup Location *
        </Text>
        <TouchableOpacity
          style={[
            {
              // locationButton - flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 15, backgroundColor: "white"
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#DDD",
              borderRadius: 10,
              padding: 15,
              backgroundColor: "white",
            },
            location && {
              // locationButtonSet - borderColor: "#2E8B57", backgroundColor: "#F0F8FF"
              borderColor: "#2E8B57",
              backgroundColor: "#F0F8FF",
            },
          ]}
          onPress={getCurrentLocation}
        >
          <Ionicons
            name={location ? "checkmark-circle" : "location-outline"}
            size={20}
            color={location ? "#2E8B57" : "#666"}
          />
          <Text
            style={[
              {
                // locationText - flex: 1, marginLeft: 10, fontSize: 16, color: "#666"
                flex: 1,
                marginLeft: 10,
                fontSize: 16,
                color: "#666",
              },
              location && {
                // locationTextSet - color: "#2E8B57", fontWeight: "600"
                color: "#2E8B57",
                fontWeight: "600",
              },
            ]}
          >
            {location ? address || "Location set" : "Set pickup location"}
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            // label - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Photos (optional, max 3)
        </Text>
        <View
          style={{
            // imageSection - gap: 15
            gap: 15,
          }}
        >
          <TouchableOpacity
            style={{
              // addImageButton - flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#DDD", borderStyle: "dashed", borderRadius: 10, padding: 20, backgroundColor: "#F9F9F9"
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#DDD",
              borderStyle: "dashed",
              borderRadius: 10,
              padding: 20,
              backgroundColor: "#F9F9F9",
            }}
            onPress={pickImage}
          >
            <Ionicons name="camera-outline" size={30} color="#666" />
            <Text
              style={{
                // addImageText - marginLeft: 10, fontSize: 16, color: "#666"
                marginLeft: 10,
                fontSize: 16,
                color: "#666",
              }}
            >
              Add Photo
            </Text>
          </TouchableOpacity>

          <View
            style={{
              // imagePreview - flexDirection: "row", flexWrap: "wrap", gap: 10
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {images.map((uri, index) => (
              <View
                key={index}
                style={{
                  // imageContainer - position: "relative"
                  position: "relative",
                }}
              >
                <Image
                  source={{ uri }}
                  style={{
                    // image - width: 100, height: 100, borderRadius: 10
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                  }}
                />
                <TouchableOpacity
                  style={{
                    // removeImageButton - position: "absolute", top: -8, right: -8, backgroundColor: "white", borderRadius: 12
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: "white",
                    borderRadius: 12,
                  }}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            {
              // submitButton - backgroundColor: "#2E8B57", paddingVertical: 18, borderRadius: 12, alignItems: "center", marginTop: 30
              backgroundColor: "#2E8B57",
              paddingVertical: 18,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 30,
            },
            loading && {
              // submitButtonDisabled - backgroundColor: "#A0A0A0"
              backgroundColor: "#A0A0A0",
            },
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text
            style={{
              // submitButtonText - color: "white", fontSize: 18, fontWeight: "bold"
              color: "white",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            {loading ? "Creating Listing..." : "Share Food"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
