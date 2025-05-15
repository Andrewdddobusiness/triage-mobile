import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Platform, TouchableOpacity } from "react-native";
import { useCustomerInquiries } from "~/stores/customerInquiries";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InquiryCard } from "~/components/ui/InquiryCard";
import { FilterDropdown } from "~/components/ui/FilterDropdown";
import { STATUS_FILTERS, IFilterOption, JOB_TYPE_FILTERS } from "~/lib/types/filters";
import { useSession } from "~/lib/auth/ctx";

import IconIon from "@expo/vector-icons/Ionicons";

export default function InboxScreen() {
  const { inquiries, fetchInquiries, isLoading } = useCustomerInquiries();
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<IFilterOption>(STATUS_FILTERS.options[0]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<IFilterOption>(JOB_TYPE_FILTERS.options[0]);

  // Calculate bottom padding to account for tab bar and safe area
  const bottomPadding = Platform.select({
    ios: 85 + insets.bottom,
    android: 60,
    default: 60,
  });

  useEffect(() => {
    if (session?.user) {
      fetchInquiries(session.user.id);
    }
  }, [session]);

  const handleStatusFilterSelect = (option: IFilterOption) => {
    setSelectedStatusFilter(option);
  };

  const handleTypeFilterSelect = (option: IFilterOption) => {
    setSelectedTypeFilter(option);
  };

  if (isLoading && inquiries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Filter Header */}
      <View className="flex-row bg-white  px-4 py-2 space-x-4">
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
        <TouchableOpacity
          className="p-2 rounded-full border border-gray-300"
          onPress={() => {
            console.log("Search pressed");
          }}
        >
          <IconIon name="search" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={inquiries}
        renderItem={({ item }) => (
          <InquiryCard
            item={{
              ...item,
              job_description: item.job_description || undefined,
              location: item.location || undefined,
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: bottomPadding,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => session?.user && fetchInquiries(session.user.id)} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-gray-500 text-lg">No inquiries found</Text>
          </View>
        }
      />
    </View>
  );
}
