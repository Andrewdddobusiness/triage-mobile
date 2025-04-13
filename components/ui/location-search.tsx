// location-search.tsx
import React, { useState } from "react";
import { View, TextInput, Pressable, Modal, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "./text";
import { Search, X } from "lucide-react-native";

interface LocationSearchProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
}

export function LocationSearch({ isVisible, onClose, onSelectLocation }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [noResults, setNoResults] = useState(false);

  const searchLocations = async (query: string) => {
    setIsSearching(true);
    setNoResults(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockLocations = ["Paris, France", "Hawaii, USA", "Tokyo, Japan", "London, UK", "Sydney, Australia"];
    const results = mockLocations.filter((location) => location.toLowerCase().includes(query.toLowerCase()));
    setSearchResults(results);
    setNoResults(results.length === 0);
    setIsSearching(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      searchLocations(text);
    } else {
      setSearchResults([]);
      setNoResults(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="overFullScreen" // overlay without reloading parent
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View
            style={{
              paddingTop: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Pressable onPress={onClose} style={{ padding: 8 }}>
                <X size={24} />
              </Pressable>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f2f2f2",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Search size={20} color="#888" />
                <TextInput
                  style={{ flex: 1, marginLeft: 8, fontSize: 16 }}
                  placeholder="e.g., Paris, Hawaii, Japan"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus
                />
              </View>
            </View>
          </View>

          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            {isSearching ? (
              <Text style={{ marginTop: 16, color: "#888" }}>Searching...</Text>
            ) : noResults ? (
              <Text style={{ marginTop: 16, color: "#888" }}>
                We couldn't find a close match. Please try a different search.
              </Text>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#ccc" }}
                    onPress={() => onSelectLocation(item)}
                  >
                    <Text>{item}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
