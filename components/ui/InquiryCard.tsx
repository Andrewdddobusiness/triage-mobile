import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Wrench, Paintbrush, Zap, Hammer, Construction, Home, Scissors, Truck, HelpCircle } from "lucide-react-native";
import { palette, radii, shadows } from "~/lib/theme";

type InquiryCardProps = {
  item: {
    id: string;
    name: string;
    status: string;
    inquiry_date: string;
    budget: number | null;
    job_type?: string;
    job_description?: string;
    location?: string;
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
    new: { bg: "#e0f2fe", text: "#075985" },
    contacted: { bg: "#fef9c3", text: "#854d0e" },
    scheduled: { bg: "#ede9fe", text: "#5b21b6" },
    completed: { bg: "#dcfce7", text: "#166534" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
  };
  return colors[status] || { bg: palette.surfaceMuted, text: palette.text };
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
      accessibilityRole="button"
      accessibilityLabel={`Inquiry from ${item.name}, status ${item.status}`}
      style={({ pressed }) => [
        {
          backgroundColor: palette.surface,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: palette.border,
          overflow: "hidden",
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
        shadows.card,
      ]}
    >
      <View className="flex-row">
        {/* Left accent bar */}
        <View style={{ width: 2, backgroundColor: palette.primary, height: "100%" }} />

        <View className="flex-1 p-4">
          {/* Top row: Name and Status */}
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold" style={{ color: palette.text }}>
              {item.name}
            </Text>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: radii.pill,
                backgroundColor: statusColors.bg,
              }}
            >
              <Text className="text-xs font-medium capitalize" style={{ color: statusColors.text }}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Budget - Large and prominent */}
          <Text className="text-2xl font-bold mb-1" style={{ color: palette.primary }}>
            {formatCurrency(item.budget)}
          </Text>

          {/* Job type and date */}
          <View className="flex-row items-center">
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: palette.surfaceMuted,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              <Icon size={20} color={color} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium" style={{ color: palette.text }}>
                {item.job_type || "General Inquiry"}
              </Text>
              <Text className="text-sm" style={{ color: palette.textMuted }}>
                {formatDate(item.inquiry_date)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
