import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, RefreshControl, Platform, TouchableOpacity, TextInput } from "react-native";
import { useCustomerInquiries } from "~/stores/customerInquiries";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InquiryCard } from "~/components/ui/InquiryCard";
import { FilterDropdown } from "~/components/ui/FilterDropdown";
import { STATUS_FILTERS, IFilterOption, JOB_TYPE_FILTERS } from "~/lib/types/filters";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";
import { router } from "expo-router";

import IconIon from "@expo/vector-icons/Ionicons";
import { AlertTriangle } from "lucide-react-native";
import { trackEvent } from "~/lib/utils/analytics";
import { EmptyState } from "~/components/ui/empty-state";
import { Loader } from "~/components/ui/loader";

export default function InboxScreen() {
  const { inquiries, fetchInquiries, isLoading, error, isOffline } = useCustomerInquiries();
  const { session, hasActiveSubscription } = useSession();
  const insets = useSafeAreaInsets();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<IFilterOption>(STATUS_FILTERS.options[0]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<IFilterOption>(JOB_TYPE_FILTERS.options[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasBusinessNumber, setHasBusinessNumber] = useState<boolean | null>(null);

  // Calculate bottom padding to account for tab bar and safe area
  const bottomPadding = Platform.select({
    ios: 85 + insets.bottom,
    android: 60,
    default: 60,
  });

  useEffect(() => {
    if (session?.user) {
      fetchInquiries();
      fetchBusinessNumber();
    }
  }, [session]);

  const fetchBusinessNumber = async () => {
    try {
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session?.user.id)
        .single();
      if (spError || !serviceProvider?.id) {
        setHasBusinessNumber(false);
        return;
      }
      const { data: phoneNumbers, error: phoneError } = await supabase
        .from("twilio_phone_numbers")
        .select("id")
        .eq("assigned_to", serviceProvider.id)
        .not("assigned_at", "is", null);
      if (phoneError) {
        setHasBusinessNumber(false);
        return;
      }
      setHasBusinessNumber((phoneNumbers || []).length > 0);
    } catch (err) {
      setHasBusinessNumber(false);
    }
  };

  const handleStatusFilterSelect = (option: IFilterOption) => {
    setSelectedStatusFilter(option);
  };

  const handleTypeFilterSelect = (option: IFilterOption) => {
    setSelectedTypeFilter(option);
  };

  // Filter inquiries based on selected status, job type, and search
  const filteredInquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      const statusMatch = selectedStatusFilter.id === "all" || inquiry.status === selectedStatusFilter.id;
      const typeMatch = selectedTypeFilter.id === "all" || inquiry.job_type === selectedTypeFilter.id;
      const searchMatch =
        !query ||
        inquiry.name.toLowerCase().includes(query) ||
        inquiry.phone.toLowerCase().includes(query) ||
        (inquiry.email || "").toLowerCase().includes(query) ||
        (inquiry.job_description || "").toLowerCase().includes(query) ||
        (inquiry.location || "").toLowerCase().includes(query);

      return statusMatch && typeMatch && searchMatch;
    });
  }, [inquiries, selectedStatusFilter, selectedTypeFilter, searchQuery]);

  if (isLoading && inquiries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Loader />
        <Text className="mt-4 text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {isOffline && (
        <View className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <Text className="text-amber-800 font-semibold">You’re offline</Text>
          <Text className="text-amber-700 text-sm">Reconnect and pull to refresh to see new inquiries.</Text>
        </View>
      )}

      {/* Filters + search */}
      <View className="bg-white px-4 py-3">
        <View className="flex-row space-x-4 items-center mb-3">
          <View className="flex-1">
            <FilterDropdown
              options={STATUS_FILTERS.options}
              selectedOption={selectedStatusFilter}
              onSelect={handleStatusFilterSelect}
            />
          </View>
          <View className="flex-1">
            <FilterDropdown
              options={JOB_TYPE_FILTERS.options}
              selectedOption={selectedTypeFilter}
              onSelect={handleTypeFilterSelect}
            />
          </View>
        </View>
        <View className="flex-row items-center px-3 py-2 rounded-full border border-gray-200 bg-gray-50">
          <IconIon name="search" size={18} color="#6b7280" />
          <TextInput
            placeholder="Search name, phone, email, job"
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-2 text-gray-800"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              trackEvent("inbox_search_change");
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconIon name="close" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && filteredInquiries.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 font-semibold mb-2">Couldn’t load inbox.</Text>
          <Text className="text-gray-600 mb-4 text-center">Pull to refresh or tap retry below.</Text>
          <TouchableOpacity
            onPress={() => session?.user && fetchInquiries(true)}
            className="px-4 py-2 rounded-full bg-orange-500"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredInquiries}
          renderItem={({ item }) => <InquiryCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingBottom: bottomPadding,
          }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => session?.user && fetchInquiries(true)} />
          }
          ListEmptyComponent={
            <View className="flex-1 p-4">
              {!hasActiveSubscription ? (
                <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <View className="flex-row items-center mb-2">
                    <AlertTriangle size={18} color="#c2410c" />
                    <Text className="text-amber-800 font-semibold text-lg ml-2">Upgrade required</Text>
                  </View>
                  <Text className="text-amber-700 text-sm mb-3">
                    Upgrade to Pro to start capturing calls and logging inquiries.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/subscription")}
                    className="bg-[#fe885a] rounded-full py-3 px-4 items-center"
                  >
                    <Text className="text-white font-semibold">Upgrade to Pro</Text>
                  </TouchableOpacity>
                </View>
              ) : hasBusinessNumber === false ? (
                <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <View className="flex-row items-center mb-2">
                    <AlertTriangle size={18} color="#c2410c" />
                    <Text className="text-amber-800 font-semibold text-lg ml-2">Finish setup</Text>
                  </View>
                  <Text className="text-amber-700 text-sm mb-3">
                    Set up your assistant and assign a business number to start capturing calls.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/onboarding-assistant/assignPhoneNumber")}
                    className="bg-[#fe885a] rounded-full py-3 px-4 items-center"
                  >
                    <Text className="text-white font-semibold">Set up Assistant</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <EmptyState
                  title="No inquiries yet"
                  description="Share your business number to start capturing calls. Pull to refresh anytime."
                />
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
