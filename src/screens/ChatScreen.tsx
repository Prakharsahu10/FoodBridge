// Chat interface for communication between donors and receivers
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreService } from "../services/api";
import { ChatMessage, NavigationParamList } from "../types";

type ChatScreenRouteProp = RouteProp<NavigationParamList, "Chat">;
type ChatScreenNavigationProp = StackNavigationProp<
  NavigationParamList,
  "Chat"
>;

interface Props {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

export default function ChatScreen({ route }: Props) {
  const { listingId, otherUserId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Subscribe to real-time chat messages for this listing
  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToMessages(
      listingId,
      (newMessages) => {
        setMessages(newMessages);
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return unsubscribe;
  }, [listingId]);

  // Send new chat message to the conversation
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      await FirestoreService.sendMessage({
        listingId,
        senderId: user.id,
        senderName: user.name,
        message: newMessage.trim(),
        type: "text",
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render individual chat message with sender styling
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderId === user?.id;

    return (
      <View
        style={[
          {
            marginVertical: 4, // my-1
            maxWidth: "80%", // max-w-4/5
          },
          isMyMessage
            ? {
                alignSelf: "flex-end", // self-end
              }
            : {
                alignSelf: "flex-start", // self-start
              },
        ]}
      >
        <View
          style={[
            {
              paddingHorizontal: 15, // px-4
              paddingVertical: 10, // py-2.5
              borderRadius: 20, // rounded-2xl
              maxWidth: "100%", // max-w-full
            },
            isMyMessage
              ? {
                  backgroundColor: "#2E8B57", // bg-green-600
                  borderBottomRightRadius: 5, // rounded-br-sm
                }
              : {
                  backgroundColor: "white", // bg-white
                  borderBottomLeftRadius: 5, // rounded-bl-sm
                  shadowColor: "#000", // shadow
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                },
          ]}
        >
          {!isMyMessage && (
            <Text
              style={{
                fontSize: 12, // text-xs
                color: "#666", // text-gray-600
                marginBottom: 4, // mb-1
                fontWeight: "500", // font-medium
              }}
            >
              {item.senderName}
            </Text>
          )}
          <Text
            style={{
              fontSize: 16, // text-base
              lineHeight: 20, // leading-5
              color: isMyMessage ? "white" : "#333", // text-white or text-gray-800
            }}
          >
            {item.message}
          </Text>
          <Text
            style={{
              fontSize: 11, // text-xs
              marginTop: 4, // mt-1
              color: isMyMessage ? "rgba(255, 255, 255, 0.7)" : "#999", // text-white/70 or text-gray-500
              textAlign: isMyMessage ? "right" : "left", // text-right or text-left
            }}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: "#F0F8FF", // bg-blue-50
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={{
          flex: 1,
          paddingHorizontal: 15, // px-4
        }}
        contentContainerStyle={{
          paddingVertical: 20, // py-5
        }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View
        style={{
          backgroundColor: "white", // bg-white
          borderTopWidth: 1, // border-t
          borderTopColor: "#E0E0E0", // border-gray-300
          paddingHorizontal: 15, // px-4
          paddingVertical: 10, // py-2.5
          paddingBottom: Platform.OS === "ios" ? 30 : 10, // pb-7 or pb-2.5
        }}
      >
        <View
          style={{
            flexDirection: "row", // flex-row
            alignItems: "flex-end", // items-end
            backgroundColor: "#F8F8F8", // bg-gray-100
            borderRadius: 25, // rounded-full
            paddingHorizontal: 15, // px-4
            paddingVertical: 8, // py-2
            minHeight: 44, // min-h-11
          }}
        >
          <TextInput
            style={{
              flex: 1,
              fontSize: 16, // text-base
              maxHeight: 100, // max-h-25
              paddingVertical: 8, // py-2
              color: "#333", // text-gray-800
            }}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={{
              marginLeft: 10, // ml-2.5
              padding: 8, // p-2
              opacity: !newMessage.trim() || loading ? 0.5 : 1,
            }}
            onPress={sendMessage}
            disabled={!newMessage.trim() || loading}
          >
            <Ionicons
              name="send"
              size={20}
              color={!newMessage.trim() || loading ? "#CCC" : "#2E8B57"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
