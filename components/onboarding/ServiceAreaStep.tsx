import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Props {
  serviceArea: string[];
  setServiceArea: (value: string[]) => void;
  errors: { serviceArea: string };
  setErrors: (errors: any) => void;
  validateField: (name: string, value: string[]) => boolean;
}

export const ServiceAreaStep: React.FC<Props> = ({ serviceArea, setServiceArea, errors, setErrors, validateField }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => `${Date.now()}-${Math.random().toString(36).substring(2)}`);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setNoResults(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const fetchSuggestions = async (input: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://places.googleapis.com/v1/places:autocomplete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY || "",
          "X-Goog-FieldMask": "*",
        },
        body: JSON.stringify({
          input,
          languageCode: "en",
          regionCode: "AU",
          sessionToken,
          includedPrimaryTypes: ["locality", "administrative_area_level_1"],
        }),
      });

      const json = await response.json();

      const predictions = json.suggestions?.map((s: any) => s.placePrediction) || [];
      setSuggestions(predictions);
      setNoResults(predictions.length === 0);
    } catch (err) {
      console.error("Autocomplete API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place: any) => {
    const value = place.text?.text || "";
    if (!serviceArea.includes(value)) {
      const newServiceAreas = [...serviceArea, value];
      setServiceArea(newServiceAreas);
      setErrors((e: any) => ({ ...e, serviceArea: "" }));
      validateField("serviceArea", newServiceAreas);
    }
    setQuery("");
    setSuggestions([]);
    setNoResults(false);
    setSessionToken(`${Date.now()}-${Math.random().toString(36).substring(2)}`);
  };

  const removeServiceArea = (area: string) => {
    const newServiceAreas = serviceArea.filter((a) => a !== area);
    setServiceArea(newServiceAreas);
    validateField("serviceArea", newServiceAreas);
  };

  return (
    <View className="relative mt-2">
      <TextInput
        placeholder="i.e Sydney"
        value={query}
        onChangeText={setQuery}
        className={`h-14 px-4 rounded-full bg-white border ${
          errors.serviceArea ? "border-red-500" : "border-gray-300"
        }`}
      />

      {errors.serviceArea && <Text className="text-xs text-red-500 ml-2 mt-1">{errors.serviceArea}</Text>}

      {/* Display selected service areas */}
      <View className="flex-row flex-wrap gap-2 mt-2">
        {serviceArea.map((area) => (
          <TouchableOpacity
            key={area}
            onPress={() => removeServiceArea(area)}
            className="bg-orange-50 border border-orange-500 rounded-full px-3 py-1 flex-row items-center"
          >
            <Text className="text-orange-700">{area}</Text>
            <Text className="text-orange-700 ml-2">×</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color={"#FFA500"} className="mt-2" />}

      {suggestions.length > 0 ? (
        <View
          style={{
            maxHeight: 240,
            marginTop: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={item.formattedAddress || item.displayName?.text || index.toString()}
                onPress={() => handleSelect(item)}
                className="p-3 border-b border-gray-200 bg-white"
              >
                <Text className="font-semibold">{item.text?.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {noResults && !loading ? (
        <View
          style={{
            marginTop: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            backgroundColor: "white",
            padding: 12,
          }}
        >
          <Text className="text-center text-gray-500">No locations found</Text>
        </View>
      ) : null}
    </View>
  );
};
