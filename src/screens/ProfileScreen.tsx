// User profile screen displaying personal info, stats, and settings
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  TextInput,
  Switch,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { FoodListing } from "../types";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userListings, setUserListings] = useState<FoodListing[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalReceived: 0,
    peopleHelped: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);

  // Profile edit states
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");

  // Notification settings
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    newRequests: true,
    pickupReminders: true,
    communityUpdates: false,
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Mock data for demo
      const mockListings: FoodListing[] = [
        {
          id: "user-listing-1",
          donorId: user.id,
          donorName: user.name,
          donorRating: 4.8,
          title: "Fresh Pasta with Marinara",
          description: "Homemade pasta",
          foodType: "veg",
          quantity: 4,
          expiryTime: new Date(),
          pickupLocation: {
            latitude: 37.7749,
            longitude: -122.4194,
            address: "San Francisco, CA",
          },
          images: [],
          status: "completed",
          requestedBy: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setUserListings(mockListings);

      // Mock stats
      setStats({
        totalDonations: user.role === "donor" ? 15 : 0,
        totalReceived: user.role === "receiver" ? 8 : 0,
        peopleHelped: user.role === "donor" ? 42 : 0,
        averageRating: user.rating || 4.8,
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditProfileModal(true);
  };

  const saveProfile = () => {
    // Mock save functionality
    Alert.alert("Success", "Profile updated successfully!");
    setEditProfileModal(false);
  };

  const handleNotifications = () => {
    setNotificationModal(true);
  };

  const handlePrivacySafety = () => {
    Alert.alert(
      "Privacy & Safety",
      "Privacy Settings:\n\n• Your location is only shared when you create or request food\n• Personal information is kept secure\n• You can block users who violate community guidelines\n• Report inappropriate behavior anytime",
      [
        {
          text: "Report User",
          onPress: () => Alert.alert("Report", "Report feature coming soon!"),
        },
        { text: "OK" },
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert("Help & Support", "How can we help you?", [
      {
        text: "FAQ",
        onPress: () =>
          Alert.alert(
            "FAQ",
            "• How do I donate food?\n• How do I request food?\n• What are safety guidelines?\n• How does pickup work?"
          ),
      },
      {
        text: "Contact Support",
        onPress: () =>
          Alert.alert(
            "Contact",
            "Email: support@foodbridge.com\nPhone: 1-800-FOODBRIDGE"
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleAbout = () => {
    setAboutModal(true);
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

  if (!user) {
    return (
      <View
        style={{
          // container - flex: 1, backgroundColor: "#F0F8FF"
          flex: 1,
          backgroundColor: "#F0F8FF",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        // container - flex: 1, backgroundColor: "#F0F8FF"
        flex: 1,
        backgroundColor: "#F0F8FF",
      }}
    >
      {/* Profile Header */}
      <View
        style={{
          // header - backgroundColor: "white", alignItems: "center", paddingVertical: 30, paddingHorizontal: 20, marginBottom: 15
          backgroundColor: "white",
          alignItems: "center",
          paddingVertical: 30,
          paddingHorizontal: 20,
          marginBottom: 15,
        }}
      >
        <View
          style={{
            // profileImageContainer - marginBottom: 15
            marginBottom: 15,
          }}
        >
          {user.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={{
                // profileImage - width: 100, height: 100, borderRadius: 50
                width: 100,
                height: 100,
                borderRadius: 50,
              }}
            />
          ) : (
            <View
              style={{
                // profileImagePlaceholder - width: 100, height: 100, borderRadius: 50, backgroundColor: "#E0E0E0", justifyContent: "center", alignItems: "center"
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#E0E0E0",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="person" size={50} color="#666" />
            </View>
          )}
        </View>

        <Text
          style={{
            // userName - fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 5
            fontSize: 24,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 5,
          }}
        >
          {user.name}
        </Text>
        <Text
          style={{
            // userEmail - fontSize: 16, color: "#666", marginBottom: 15
            fontSize: 16,
            color: "#666",
            marginBottom: 15,
          }}
        >
          {user.email}
        </Text>

        <View
          style={{
            // roleContainer - marginBottom: 15
            marginBottom: 15,
          }}
        >
          <View
            style={[
              {
                // roleBadge - flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, gap: 5
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                gap: 5,
              },
              {
                backgroundColor: user.role === "donor" ? "#2E8B57" : "#007AFF",
              },
            ]}
          >
            <Ionicons
              name={user.role === "donor" ? "restaurant" : "heart"}
              size={16}
              color="white"
            />
            <Text
              style={{
                // roleText - fontSize: 14, fontWeight: "600"
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {user.role === "donor" ? "Food Donor" : "Food Receiver"}
            </Text>
          </View>
        </View>

        <View
          style={{
            // ratingContainer - flexDirection: "row", alignItems: "center", marginTop: 10
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Ionicons name="star" size={18} color="#FFD700" />
          <Text
            style={{
              // ratingText - fontSize: 16, fontWeight: "600", marginLeft: 5
              fontSize: 16,
              fontWeight: "600",
              marginLeft: 5,
            }}
          >
            {stats.averageRating.toFixed(1)}
          </Text>
          <Text
            style={{
              // ratingCount - fontSize: 14, color: "#666", marginLeft: 5
              fontSize: 14,
              color: "#666",
              marginLeft: 5,
            }}
          >
            (25 reviews)
          </Text>
        </View>
      </View>

      {/* Stats Section */}
      <View
        style={{
          // statsContainer - backgroundColor: "white", marginHorizontal: 20, borderRadius: 12, padding: 20, marginBottom: 15
          backgroundColor: "white",
          marginHorizontal: 20,
          borderRadius: 12,
          padding: 20,
          marginBottom: 15,
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
          Impact Dashboard
        </Text>

        <View
          style={{
            // statsGrid - flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between"
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {user.role === "donor" ? (
            <>
              <View
                style={{
                  // statItem - alignItems: "center", width: "48%", padding: 15, backgroundColor: "#F8F9FA", borderRadius: 8
                  alignItems: "center",
                  width: "48%",
                  padding: 15,
                  backgroundColor: "#F8F9FA",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    // statNumber - fontSize: 24, fontWeight: "bold", color: "#2E8B57"
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#2E8B57",
                  }}
                >
                  {stats.totalDonations}
                </Text>
                <Text
                  style={{
                    // statLabel - fontSize: 14, color: "#666", textAlign: "center"
                    fontSize: 14,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Total Donations
                </Text>
              </View>

              <View
                style={{
                  // statItem - alignItems: "center", width: "48%", padding: 15, backgroundColor: "#F8F9FA", borderRadius: 8
                  alignItems: "center",
                  width: "48%",
                  padding: 15,
                  backgroundColor: "#F8F9FA",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    // statNumber - fontSize: 24, fontWeight: "bold", color: "#2E8B57"
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#2E8B57",
                  }}
                >
                  {stats.peopleHelped}
                </Text>
                <Text
                  style={{
                    // statLabel - fontSize: 14, color: "#666", textAlign: "center"
                    fontSize: 14,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  People Helped
                </Text>
              </View>
            </>
          ) : (
            <>
              <View
                style={{
                  // statItem - alignItems: "center", width: "48%", padding: 15, backgroundColor: "#F8F9FA", borderRadius: 8
                  alignItems: "center",
                  width: "48%",
                  padding: 15,
                  backgroundColor: "#F8F9FA",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    // statNumber - fontSize: 24, fontWeight: "bold", color: "#2E8B57"
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#2E8B57",
                  }}
                >
                  {stats.totalReceived}
                </Text>
                <Text
                  style={{
                    // statLabel - fontSize: 14, color: "#666", textAlign: "center"
                    fontSize: 14,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Meals Received
                </Text>
              </View>

              <View
                style={{
                  // statItem - alignItems: "center", width: "48%", padding: 15, backgroundColor: "#F8F9FA", borderRadius: 8
                  alignItems: "center",
                  width: "48%",
                  padding: 15,
                  backgroundColor: "#F8F9FA",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    // statNumber - fontSize: 24, fontWeight: "bold", color: "#2E8B57"
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#2E8B57",
                  }}
                >
                  12
                </Text>
                <Text
                  style={{
                    // statLabel - fontSize: 14, color: "#666", textAlign: "center"
                    fontSize: 14,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Pickups Completed
                </Text>
              </View>
            </>
          )}
        </View>

        <View
          style={{
            // environmentalImpact - flexDirection: "row", alignItems: "center", marginTop: 20, padding: 15, backgroundColor: "#E8F5E8", borderRadius: 8
            flexDirection: "row",
            alignItems: "center",
            marginTop: 20,
            padding: 15,
            backgroundColor: "#E8F5E8",
            borderRadius: 8,
          }}
        >
          <Ionicons name="leaf" size={24} color="#2E8B57" />
          <View
            style={{
              // impactText - marginLeft: 10, flex: 1
              marginLeft: 10,
              flex: 1,
            }}
          >
            <Text
              style={{
                // impactTitle - fontSize: 16, fontWeight: "600", color: "#2E8B57"
                fontSize: 16,
                fontWeight: "600",
                color: "#2E8B57",
              }}
            >
              Environmental Impact
            </Text>
            <Text
              style={{
                // impactDescription - fontSize: 14, color: "#666", marginTop: 5
                fontSize: 14,
                color: "#666",
                marginTop: 5,
              }}
            >
              You've helped save approximately{" "}
              {Math.round(stats.peopleHelped * 0.5)} kg of food waste!
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      {user.role === "donor" && userListings.length > 0 && (
        <View
          style={{
            // activityContainer - backgroundColor: "white", marginHorizontal: 20, borderRadius: 12, padding: 20, marginBottom: 15
            backgroundColor: "white",
            marginHorizontal: 20,
            borderRadius: 12,
            padding: 20,
            marginBottom: 15,
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
            Recent Donations
          </Text>

          {userListings.slice(0, 5).map((listing) => (
            <View
              key={listing.id}
              style={{
                // activityItem - flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0"
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F0F0F0",
              }}
            >
              <View
                style={{
                  // activityIcon - width: 40, height: 40, borderRadius: 20, backgroundColor: "#F8F9FA", alignItems: "center", justifyContent: "center", marginRight: 12
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#F8F9FA",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="restaurant" size={20} color="#666" />
              </View>

              <View
                style={{
                  // activityContent - flex: 1
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    // activityTitle - fontSize: 16, fontWeight: "600", color: "#333"
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {listing.title}
                </Text>
                <Text
                  style={{
                    // activityDate - fontSize: 14, color: "#666", marginTop: 2
                    fontSize: 14,
                    color: "#666",
                    marginTop: 2,
                  }}
                >
                  {new Date(listing.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View
                style={[
                  {
                    // activityStatus - paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  },
                  { backgroundColor: getStatusColor(listing.status) },
                ]}
              >
                <Text
                  style={{
                    // activityStatusText - fontSize: 12, fontWeight: "600", color: "white"
                    fontSize: 12,
                    fontWeight: "600",
                    color: "white",
                  }}
                >
                  {listing.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Settings */}
      <View
        style={{
          // settingsContainer - backgroundColor: "white", marginHorizontal: 20, borderRadius: 12, marginBottom: 15
          backgroundColor: "white",
          marginHorizontal: 20,
          borderRadius: 12,
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            // sectionTitle - fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15, paddingHorizontal: 20, paddingTop: 20
            fontSize: 18,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 15,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          Settings
        </Text>

        <TouchableOpacity
          style={{
            // settingItem - flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0"
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
          onPress={handleEditProfile}
        >
          <Ionicons name="person-circle-outline" size={24} color="#666" />
          <Text
            style={{
              // settingText - flex: 1, fontSize: 16, color: "#333", marginLeft: 15
              flex: 1,
              fontSize: 16,
              color: "#333",
              marginLeft: 15,
            }}
          >
            Edit Profile
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            // settingItem - flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0"
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
          onPress={handleNotifications}
        >
          <Ionicons name="notifications-outline" size={24} color="#666" />
          <Text
            style={{
              // settingText - flex: 1, fontSize: 16, color: "#333", marginLeft: 15
              flex: 1,
              fontSize: 16,
              color: "#333",
              marginLeft: 15,
            }}
          >
            Notifications
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            // settingItem - flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0"
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
          onPress={handlePrivacySafety}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
          <Text
            style={{
              // settingText - flex: 1, fontSize: 16, color: "#333", marginLeft: 15
              flex: 1,
              fontSize: 16,
              color: "#333",
              marginLeft: 15,
            }}
          >
            Privacy & Safety
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            // settingItem - flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0"
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
          onPress={handleHelpSupport}
        >
          <Ionicons name="help-circle-outline" size={24} color="#666" />
          <Text
            style={{
              // settingText - flex: 1, fontSize: 16, color: "#333", marginLeft: 15
              flex: 1,
              fontSize: 16,
              color: "#333",
              marginLeft: 15,
            }}
          >
            Help & Support
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            // settingItem - flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0"
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
          onPress={handleAbout}
        >
          <Ionicons name="information-circle-outline" size={24} color="#666" />
          <Text
            style={{
              // settingText - flex: 1, fontSize: 16, color: "#333", marginLeft: 15
              flex: 1,
              fontSize: 16,
              color: "#333",
              marginLeft: 15,
            }}
          >
            About FoodBridge
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View
        style={{
          // logoutContainer - marginHorizontal: 20, marginBottom: 30
          marginHorizontal: 20,
          marginBottom: 30,
        }}
      >
        <TouchableOpacity
          style={{
            // logoutButton - flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "white", paddingVertical: 15, borderRadius: 12, borderWidth: 1, borderColor: "#FF4444"
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            paddingVertical: 15,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#FF4444",
          }}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF4444" />
          <Text
            style={{
              // logoutText - fontSize: 16, fontWeight: "600", color: "#FF4444", marginLeft: 10
              fontSize: 16,
              fontWeight: "600",
              color: "#FF4444",
              marginLeft: 10,
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={{
            // modalContainer - flex: 1, backgroundColor: "#F0F8FF"
            flex: 1,
            backgroundColor: "#F0F8FF",
          }}
        >
          <View
            style={{
              // modalHeader - flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E0E0E0"
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              backgroundColor: "white",
              borderBottomWidth: 1,
              borderBottomColor: "#E0E0E0",
            }}
          >
            <Text
              style={{
                // modalTitle - fontSize: 20, fontWeight: "bold", color: "#333"
                fontSize: 20,
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Edit Profile
            </Text>
            <TouchableOpacity onPress={() => setEditProfileModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{
              // modalContent - flex: 1, padding: 20
              flex: 1,
              padding: 20,
            }}
          >
            <View
              style={{
                // inputContainer - marginBottom: 20
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  // inputLabel - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: 8,
                }}
              >
                Full Name
              </Text>
              <TextInput
                style={{
                  // textInput - backgroundColor: "white", padding: 15, borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0", fontSize: 16
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  fontSize: 16,
                }}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
              />
            </View>

            <View
              style={{
                // inputContainer - marginBottom: 20
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  // inputLabel - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: 8,
                }}
              >
                Phone Number
              </Text>
              <TextInput
                style={{
                  // textInput - backgroundColor: "white", padding: 15, borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0", fontSize: 16
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  fontSize: 16,
                }}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View
              style={{
                // inputContainer - marginBottom: 20
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  // inputLabel - fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: 8,
                }}
              >
                Role
              </Text>
              <View
                style={{
                  // roleSelector - backgroundColor: "white", padding: 15, borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0"
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                }}
              >
                <Text
                  style={{
                    // roleText - fontSize: 16, color: "#333", fontWeight: "600"
                    fontSize: 16,
                    color: "#333",
                    fontWeight: "600",
                  }}
                >
                  {user?.role === "donor" ? "Food Donor" : "Food Receiver"}
                </Text>
                <Text
                  style={{
                    // roleNote - fontSize: 14, color: "#666", marginTop: 5
                    fontSize: 14,
                    color: "#666",
                    marginTop: 5,
                  }}
                >
                  Contact support to change your role
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                // saveButton - backgroundColor: "#2E8B57", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20
                backgroundColor: "#2E8B57",
                padding: 15,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 20,
              }}
              onPress={saveProfile}
            >
              <Text
                style={{
                  // saveButtonText - fontSize: 16, fontWeight: "600", color: "white"
                  fontSize: 16,
                  fontWeight: "600",
                  color: "white",
                }}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        visible={notificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={{
            // modalContainer - flex: 1, backgroundColor: "#F0F8FF"
            flex: 1,
            backgroundColor: "#F0F8FF",
          }}
        >
          <View
            style={{
              // modalHeader - flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E0E0E0"
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              backgroundColor: "white",
              borderBottomWidth: 1,
              borderBottomColor: "#E0E0E0",
            }}
          >
            <Text
              style={{
                // modalTitle - fontSize: 20, fontWeight: "bold", color: "#333"
                fontSize: 20,
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Notification Settings
            </Text>
            <TouchableOpacity onPress={() => setNotificationModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{
              // modalContent - flex: 1, padding: 20
              flex: 1,
              padding: 20,
            }}
          >
            <View
              style={{
                // notificationSection - marginBottom: 30
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  // notificationSectionTitle - fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: 15,
                }}
              >
                General
              </Text>

              <View
                style={{
                  // notificationItem - flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 10
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    // notificationText - flex: 1, marginRight: 15
                    flex: 1,
                    marginRight: 15,
                  }}
                >
                  <Text
                    style={{
                      // notificationLabel - fontSize: 16, fontWeight: "600", color: "#333"
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Push Notifications
                  </Text>
                  <Text
                    style={{
                      // notificationDesc - fontSize: 14, color: "#666", marginTop: 2
                      fontSize: 14,
                      color: "#666",
                      marginTop: 2,
                    }}
                  >
                    Receive notifications on your device
                  </Text>
                </View>
                <Switch
                  value={notifications.pushNotifications}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      pushNotifications: value,
                    })
                  }
                />
              </View>

              <View
                style={{
                  // notificationItem - flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 10
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    // notificationText - flex: 1, marginRight: 15
                    flex: 1,
                    marginRight: 15,
                  }}
                >
                  <Text
                    style={{
                      // notificationLabel - fontSize: 16, fontWeight: "600", color: "#333"
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Email Notifications
                  </Text>
                  <Text
                    style={{
                      // notificationDesc - fontSize: 14, color: "#666", marginTop: 2
                      fontSize: 14,
                      color: "#666",
                      marginTop: 2,
                    }}
                  >
                    Get updates via email
                  </Text>
                </View>
                <Switch
                  value={notifications.emailNotifications}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: value,
                    })
                  }
                />
              </View>

              <View
                style={{
                  // notificationItem - flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 10
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    // notificationText - flex: 1, marginRight: 15
                    flex: 1,
                    marginRight: 15,
                  }}
                >
                  <Text
                    style={{
                      // notificationLabel - fontSize: 16, fontWeight: "600", color: "#333"
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    SMS Notifications
                  </Text>
                  <Text
                    style={{
                      // notificationDesc - fontSize: 14, color: "#666", marginTop: 2
                      fontSize: 14,
                      color: "#666",
                      marginTop: 2,
                    }}
                  >
                    Receive text messages
                  </Text>
                </View>
                <Switch
                  value={notifications.smsNotifications}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      smsNotifications: value,
                    })
                  }
                />
              </View>
            </View>

            <View
              style={{
                // notificationSection - marginBottom: 30
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  // notificationSectionTitle - fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: 15,
                }}
              >
                Food Activity
              </Text>

              <View
                style={{
                  // notificationItem - flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 10
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    // notificationText - flex: 1, marginRight: 15
                    flex: 1,
                    marginRight: 15,
                  }}
                >
                  <Text
                    style={{
                      // notificationLabel - fontSize: 16, fontWeight: "600", color: "#333"
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    New Requests
                  </Text>
                  <Text
                    style={{
                      // notificationDesc - fontSize: 14, color: "#666", marginTop: 2
                      fontSize: 14,
                      color: "#666",
                      marginTop: 2,
                    }}
                  >
                    When someone requests your food
                  </Text>
                </View>
                <Switch
                  value={notifications.newRequests}
                  onValueChange={(value) =>
                    setNotifications({ ...notifications, newRequests: value })
                  }
                />
              </View>

              <View
                style={{
                  // notificationItem - flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 10
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    // notificationText - flex: 1, marginRight: 15
                    flex: 1,
                    marginRight: 15,
                  }}
                >
                  <Text
                    style={{
                      // notificationLabel - fontSize: 16, fontWeight: "600", color: "#333"
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Pickup Reminders
                  </Text>
                  <Text
                    style={{
                      // notificationDesc - fontSize: 14, color: "#666", marginTop: 2
                      fontSize: 14,
                      color: "#666",
                      marginTop: 2,
                    }}
                  >
                    Reminders for scheduled pickups
                  </Text>
                </View>
                <Switch
                  value={notifications.pickupReminders}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      pickupReminders: value,
                    })
                  }
                />
              </View>

              <View
                style={{
                  // notificationItem - flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 10
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    // notificationText - flex: 1, marginRight: 15
                    flex: 1,
                    marginRight: 15,
                  }}
                >
                  <Text
                    style={{
                      // notificationLabel - fontSize: 16, fontWeight: "600", color: "#333"
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Community Updates
                  </Text>
                  <Text
                    style={{
                      // notificationDesc - fontSize: 14, color: "#666", marginTop: 2
                      fontSize: 14,
                      color: "#666",
                      marginTop: 2,
                    }}
                  >
                    News and updates from FoodBridge
                  </Text>
                </View>
                <Switch
                  value={notifications.communityUpdates}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      communityUpdates: value,
                    })
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={{
            // modalContainer - flex: 1, backgroundColor: "#F0F8FF"
            flex: 1,
            backgroundColor: "#F0F8FF",
          }}
        >
          <View
            style={{
              // modalHeader - flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E0E0E0"
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              backgroundColor: "white",
              borderBottomWidth: 1,
              borderBottomColor: "#E0E0E0",
            }}
          >
            <Text
              style={{
                // modalTitle - fontSize: 20, fontWeight: "bold", color: "#333"
                fontSize: 20,
                fontWeight: "bold",
                color: "#333",
              }}
            >
              About FoodBridge
            </Text>
            <TouchableOpacity onPress={() => setAboutModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{
              // modalContent - flex: 1, padding: 20
              flex: 1,
              padding: 20,
            }}
          >
            <View
              style={{
                // aboutSection - alignItems: "center", marginBottom: 30
                alignItems: "center",
                marginBottom: 30,
              }}
            >
              <Ionicons
                name="restaurant"
                size={48}
                color="#2E8B57"
                style={{
                  // aboutIcon - marginBottom: 15
                  marginBottom: 15,
                }}
              />
              <Text
                style={{
                  // aboutTitle - fontSize: 24, fontWeight: "bold", color: "#333", textAlign: "center"
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                FoodBridge v1.0.0
              </Text>
              <Text
                style={{
                  // aboutSubtitle - fontSize: 16, color: "#666", textAlign: "center", marginTop: 5
                  fontSize: 16,
                  color: "#666",
                  textAlign: "center",
                  marginTop: 5,
                }}
              >
                Connecting Communities Through Food
              </Text>
            </View>

            <View
              style={{
                // aboutContent - backgroundColor: "white", borderRadius: 12, padding: 20
                backgroundColor: "white",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <Text
                style={{
                  // aboutText - fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 20
                  fontSize: 16,
                  color: "#333",
                  lineHeight: 24,
                  marginBottom: 20,
                }}
              >
                FoodBridge is a community-driven platform that connects food
                donors with those in need, reducing food waste while addressing
                hunger in our communities.
              </Text>

              <View
                style={{
                  // aboutStats - flexDirection: "row", justifyContent: "space-around", marginBottom: 30, paddingVertical: 20, backgroundColor: "#F8F9FA", borderRadius: 8
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginBottom: 30,
                  paddingVertical: 20,
                  backgroundColor: "#F8F9FA",
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    // aboutStat - alignItems: "center"
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      // aboutStatNumber - fontSize: 20, fontWeight: "bold", color: "#2E8B57"
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#2E8B57",
                    }}
                  >
                    10,000+
                  </Text>
                  <Text
                    style={{
                      // aboutStatLabel - fontSize: 12, color: "#666", textAlign: "center"
                      fontSize: 12,
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    Meals Shared
                  </Text>
                </View>
                <View
                  style={{
                    // aboutStat - alignItems: "center"
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      // aboutStatNumber - fontSize: 20, fontWeight: "bold", color: "#2E8B57"
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#2E8B57",
                    }}
                  >
                    5,000+
                  </Text>
                  <Text
                    style={{
                      // aboutStatLabel - fontSize: 12, color: "#666", textAlign: "center"
                      fontSize: 12,
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    Active Users
                  </Text>
                </View>
                <View
                  style={{
                    // aboutStat - alignItems: "center"
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      // aboutStatNumber - fontSize: 20, fontWeight: "bold", color: "#2E8B57"
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#2E8B57",
                    }}
                  >
                    2,500kg
                  </Text>
                  <Text
                    style={{
                      // aboutStatLabel - fontSize: 12, color: "#666", textAlign: "center"
                      fontSize: 12,
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    Food Saved
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  // aboutSectionTitle - fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: 10,
                }}
              >
                Our Mission
              </Text>
              <Text
                style={{
                  // aboutText - fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 20
                  fontSize: 16,
                  color: "#333",
                  lineHeight: 24,
                  marginBottom: 20,
                }}
              >
                To create a sustainable food sharing ecosystem that eliminates
                waste and ensures no one goes hungry in our communities.
              </Text>

              <Text
                style={{
                  // aboutSectionTitle - fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: 10,
                }}
              >
                Contact Us
              </Text>
              <TouchableOpacity
                style={{
                  // contactItem - flexDirection: "row", alignItems: "center", paddingVertical: 10
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
                onPress={() => Linking.openURL("mailto:support@foodbridge.com")}
              >
                <Ionicons name="mail" size={20} color="#2E8B57" />
                <Text
                  style={{
                    // contactText - fontSize: 16, color: "#2E8B57", marginLeft: 10
                    fontSize: 16,
                    color: "#2E8B57",
                    marginLeft: 10,
                  }}
                >
                  support@foodbridge.com
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  // contactItem - flexDirection: "row", alignItems: "center", paddingVertical: 10
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
                onPress={() => Linking.openURL("https://foodbridge.com")}
              >
                <Ionicons name="globe" size={20} color="#2E8B57" />
                <Text
                  style={{
                    // contactText - fontSize: 16, color: "#2E8B57", marginLeft: 10
                    fontSize: 16,
                    color: "#2E8B57",
                    marginLeft: 10,
                  }}
                >
                  www.foodbridge.com
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  // aboutFooter - marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#E0E0E0"
                  marginTop: 30,
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: "#E0E0E0",
                }}
              >
                <Text
                  style={{
                    // aboutCopyright - fontSize: 14, color: "#666", textAlign: "center"
                    fontSize: 14,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  © 2025 FoodBridge. All rights reserved.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}
