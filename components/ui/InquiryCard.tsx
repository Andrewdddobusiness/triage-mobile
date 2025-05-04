import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Wrench, Paintbrush, Zap, Hammer, Construction, Home, Scissors, Truck, HelpCircle } from "lucide-react-native";

type InquiryCardProps = {
  item: {
    location?: string;
    id: string;
    name: string;
    status: string;
    inquiry_date: string;
    budget: number | null;
    job_type?: string;
    job_description?: string;
  };
};

// Helper functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "Not specified";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
};

const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    new: { bg: "bg-blue-100", text: "text-blue-800" },
    contacted: { bg: "bg-yellow-100", text: "text-yellow-800" },
    scheduled: { bg: "bg-purple-100", text: "text-purple-800" },
    completed: { bg: "bg-green-100", text: "text-green-800" },
    cancelled: { bg: "bg-red-100", text: "text-red-800" },
  };
  return colors[status] || { bg: "bg-gray-100", text: "text-gray-800" };
};

// Function to get job type icon
const getJobTypeIcon = (jobType?: string) => {
  if (!jobType) return { Icon: HelpCircle, color: "#D1D5DB" };

  const jobTypeLower = jobType.toLowerCase();

  if (jobTypeLower.includes("plumbing") || jobTypeLower.includes("toilet")) {
    return { Icon: Wrench, color: "#0891b2" }; // Cyan for plumbing
  } else if (jobTypeLower.includes("electrical") || jobTypeLower.includes("wiring")) {
    return { Icon: Zap, color: "#f59e0b" }; // Amber for electrical
  } else if (jobTypeLower.includes("painting")) {
    return { Icon: Paintbrush, color: "#8b5cf6" }; // Purple for painting
  } else if (jobTypeLower.includes("carpentry") || jobTypeLower.includes("wood")) {
    return { Icon: Hammer, color: "#b45309" }; // Brown for carpentry
  } else if (jobTypeLower.includes("renovation") || jobTypeLower.includes("remodel")) {
    return { Icon: Construction, color: "#f97316" }; // Orange for renovation
  } else if (jobTypeLower.includes("landscaping") || jobTypeLower.includes("garden")) {
    return { Icon: Scissors, color: "#22c55e" }; // Green for landscaping
  } else if (jobTypeLower.includes("moving") || jobTypeLower.includes("removal")) {
    return { Icon: Truck, color: "#6366f1" }; // Indigo for moving
  } else if (jobTypeLower.includes("cleaning") || jobTypeLower.includes("housekeeping")) {
    return { Icon: Home, color: "#14b8a6" }; // Teal for cleaning
  }

  // Default icon for other job types
  return { Icon: Wrench, color: "#64748b" };
};

export function InquiryCard({ item }: InquiryCardProps) {
  const statusColors = getStatusColor(item.status);
  const { Icon, color } = getJobTypeIcon(item.job_type);

  return (
    <Pressable
      onPress={() => {
        router.push(`/request/${item.id}`);
      }}
      className="bg-white mb-2 mx-4 rounded-lg shadow-sm overflow-hidden"
    >
      <View className="flex-row">
        {/* Left orange accent bar */}
        <View className="w-2 bg-[#fe885a] h-full" />

        <View className="flex-1 p-4">
          {/* Top row: Name and Status */}
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-black">{item.name}</Text>
            <View className={`px-2 py-1 rounded-full ${statusColors.bg}`}>
              <Text className={`${statusColors.text} text-xs font-medium capitalize`}>{item.status}</Text>
            </View>
          </View>

          {/* Budget - Large and prominent */}
          <Text className="text-2xl font-bold text-[#fe885a] mb-1">{formatCurrency(item.budget)}</Text>

          {/* Job type and date */}
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
              <Icon size={20} color={color} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800">{item.job_type || "General Inquiry"}</Text>
              <Text className="text-sm text-gray-500">{formatDate(item.inquiry_date)}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
