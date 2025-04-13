import React from "react";
import { View, ScrollView, Text, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Phone, MessageSquare, Star } from "lucide-react-native";

// Mock data - in real app this would come from your backend
const MOCK_CONTACTS = [
  {
    id: "1",
    name: "John Smith",
    company: "Smith & Co Construction",
    phone: "+61 400 123 456",
    email: "john@smithconst.com",
    avatar: "https://ui-avatars.com/api/?name=John+Smith",
    isStarred: true,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    company: "Wilson Home Renovations",
    phone: "+61 400 789 012",
    email: "sarah@wilsonrenovations.com",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson",
    isStarred: true,
  },
  {
    id: "3",
    name: "Mike Brown",
    company: "Brown's Building Services",
    phone: "+61 400 345 678",
    email: "mike@brownbuilding.com",
    avatar: "https://ui-avatars.com/api/?name=Mike+Brown",
    isStarred: false,
  },
];

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = React.useState(MOCK_CONTACTS);

  const toggleStar = (id: string) => {
    setContacts(
      contacts.map((contact) => (contact.id === id ? { ...contact, isStarred: !contact.isStarred } : contact))
    );
  };

  const handleCall = (phone: string) => {
    console.log(`Calling ${phone}`);
    // Implement call functionality
  };

  const handleMessage = (id: string) => {
    console.log(`Messaging contact ${id}`);
    // Navigate to message screen
  };

  // Sort contacts: starred first, then alphabetically
  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingBottom: insets.bottom,
      }}
    >
      {sortedContacts.map((contact) => (
        <View key={contact.id} className="bg-white p-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-semibold text-base">{contact.name}</Text>
                <Pressable className="ml-2" onPress={() => toggleStar(contact.id)}>
                  <Star size={16} color="#0a7ea4" fill={contact.isStarred ? "#0a7ea4" : "none"} />
                </Pressable>
              </View>
              <Text className="text-gray-500">{contact.company}</Text>
            </View>
          </View>

          <View className="flex-row mt-3">
            <Pressable className="flex-row items-center" onPress={() => handleCall(contact.phone)}>
              <Phone size={16} color="#0a7ea4" />
              <Text className="ml-1 text-sm text-gray-600">{contact.phone}</Text>
            </Pressable>
            <Pressable className="flex-row items-center ml-4" onPress={() => handleMessage(contact.id)}>
              <MessageSquare size={16} color="#0a7ea4" />
              <Text className="ml-1 text-sm text-gray-600">{contact.email}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
