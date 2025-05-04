import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Platform, TouchableOpacity } from "react-native";
import { useCustomerInquiries } from "~/app/stores/customerInquiries";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InquiryCard } from "~/components/ui/InquiryCard";
import { FilterDropdown } from "~/components/ui/FilterDropdown";
import { STATUS_FILTERS, JOB_TYPE_FILTERS, FilterOption } from "~/types/filters";
import { Search } from "lucide-react-native";

export default function InboxScreen() {
  const { inquiries, fetchInquiries, isLoading } = useCustomerInquiries();
  const insets = useSafeAreaInsets();

  // Initialize with the first option from each filter
  const [statusFilter, setStatusFilter] = useState<FilterOption>(STATUS_FILTERS.options[0]);
  const [jobTypeFilter, setJobTypeFilter] = useState<FilterOption>(JOB_TYPE_FILTERS.options[0]);

  // Calculate bottom padding to account for tab bar and safe area
  const bottomPadding = Platform.select({
    ios: 85 + insets.bottom, // Tab bar height (85) + safe area
    android: 60, // Android tab bar height
    default: 60,
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Apply filters to inquiries
  const filteredInquiries = inquiries.filter((item) => {
    // Only apply status filter if not "All Jobs"
    const passesStatusFilter =
      statusFilter.id === "all" ||
      (statusFilter.id === "new" && item.status === "new") ||
      (statusFilter.id === "contacted" && item.status === "contacted") ||
      (statusFilter.id === "completed" && item.status === "completed");

    // Only apply job type filter if not "All Types"
    const passesJobTypeFilter = jobTypeFilter.id === "all" || item.job_type === jobTypeFilter.id;

    return passesStatusFilter && passesJobTypeFilter;
  });

  if (isLoading && inquiries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Filters and Search Row */}
      <View className="bg-white border-b border-gray-200 p-4">
        <View className="flex-row items-center">
          {/* Status Filter - takes 40% of the space */}
          <View className="flex-[4]">
            <FilterDropdown options={STATUS_FILTERS.options} selectedOption={statusFilter} onSelect={setStatusFilter} />
          </View>

          {/* Job Type Filter - takes 40% of the space */}
          <View className="flex-[4] mx-2">
            <FilterDropdown
              options={JOB_TYPE_FILTERS.options}
              selectedOption={jobTypeFilter}
              onSelect={setJobTypeFilter}
            />
          </View>

          {/* Search Button - takes 20% of the space */}
          <View className="flex-[1]">
            <TouchableOpacity className="p-2 bg-white border border-gray-300 rounded-full items-center justify-center">
              <Search size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredInquiries}
        renderItem={({ item }) => (
          <InquiryCard item={{ ...item, job_description: item.job_description || undefined }} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: bottomPadding,
        }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchInquiries} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-gray-500 text-lg">No inquiries found</Text>
          </View>
        }
      />
    </View>
  );
}
