import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { useSession } from "~/lib/auth/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { userService } from "~/lib/services/userService";
import { supabase } from "~/lib/supabase";
import { router } from "expo-router";
import { palette, radii, shadows } from "~/lib/theme";
import { useFocusEffect } from "@react-navigation/native";

type ProfileData = {
  name: string;
  businessName: string;
  businessEmail: string;
  servicesOffered: string[];
  specialties: string[];
  serviceAreas: string[];
};

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      backgroundColor: palette.surface,
      borderRadius: radii.card,
      borderWidth: 1,
      borderColor: palette.border,
      marginHorizontal: 16,
      marginBottom: 12,
      ...shadows.card,
    }}
  >
    {children}
  </View>
);

const Row = ({
  title,
  value,
  onPress,
  hint,
}: {
  title: string;
  value: string;
  onPress?: () => void;
  hint?: string;
}) => (
  <TouchableOpacity
    className="flex-row items-center justify-between px-4 py-4 border-t border-gray-100"
    activeOpacity={0.85}
    onPress={onPress}
  >
    <View>
      <Text className="text-gray-500 text-sm">{title}</Text>
      <Text className="text-[#495057] text-base">{value}</Text>
      {hint ? <Text className="text-xs text-gray-500 mt-1">{hint}</Text> : null}
    </View>
    {onPress ? <ChevronRight size={20} color="#adb5bd" /> : null}
  </TouchableOpacity>
);

export default function AccountScreen() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    businessName: "",
    businessEmail: "",
    servicesOffered: [],
    specialties: [],
    serviceAreas: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchUserData = useCallback(async () => {
    if (session?.user) {
      try {
        const profileData = await userService.getUserProfile(session.user.id);
        const businessEmail = await userService.getBusinessEmail(session.user.id);

        const { data: serviceProvider } = await supabase
          .from("service_providers")
          .select("business_name, services_offered, specialty, service_area")
          .eq("auth_user_id", session.user.id)
          .single();

        const businessName = serviceProvider?.business_name || "";
        const servicesOffered = (serviceProvider?.services_offered as string[]) || [];
        const specialties = (serviceProvider?.specialty as string[]) || [];
        const serviceAreas = (serviceProvider?.service_area as string[]) || [];

        const emailValue = Array.isArray(businessEmail)
          ? businessEmail[0] || ""
          : typeof businessEmail === "string"
            ? businessEmail
            : "";

        setProfile({
          name: profileData.name || "",
          businessName,
          businessEmail: emailValue,
          servicesOffered,
          specialties,
          serviceAreas,
        });
      } catch (error) {
        setErrorMessage("Failed to load account information");
      }
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.surfaceMuted, paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#495057" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-[#495057]">Account & Business Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={palette.primary} />
            <Text className="text-gray-500 mt-3">Loading account information...</Text>
          </View>
        ) : (
          <>
            {/* Error message */}
            {errorMessage ? (
              <View className="mb-4 p-3 bg-red-100 rounded-full mx-4">
                <Text className="text-red-500">{errorMessage}</Text>
              </View>
            ) : null}

            {/* Account snapshot */}
            <View style={{ marginTop: 12 }}>
              <SectionCard>
              <View className="p-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">Account snapshot</Text>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-gray-900">{profile.name || "Your name"}</Text>
                  <Text className="text-gray-600">{profile.businessEmail || session?.user?.email}</Text>
                    {session?.user?.created_at ? (
                      <Text className="text-xs text-gray-500 mt-1">
                        Member since {new Date(session.user.created_at).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
              </SectionCard>
            </View>

            {/* Business profile */}
            <SectionCard>
              <Text className="text-base font-semibold text-gray-900 px-4 pt-4 pb-2">Business profile</Text>
              <Row
                title="Owner / contact name"
                value={profile.name || "Add owner name"}
                onPress={() =>
                  router.push({
                    pathname: "/account/edit-field",
                    params: {
                      field: "ownerName",
                      title: "Owner / contact name",
                      value: profile.name || "",
                    },
                  })
                }
              />
              <Row
                title="Business name"
                value={profile.businessName || "Add business name"}
                hint="Shown on greetings and invoices"
                onPress={() =>
                  router.push({
                    pathname: "/account/edit-field",
                    params: {
                      field: "businessName",
                      title: "Business name",
                      value: profile.businessName || "",
                    },
                  })
                }
              />
              <Row
                title="Business email"
                value={profile.businessEmail || "you@business.com"}
                onPress={() =>
                  router.push({
                    pathname: "/account/edit-field",
                    params: {
                      field: "businessEmail",
                      title: "Business email",
                      value: profile.businessEmail || "",
                    },
                  })
                }
              />
              <Row
                title="Services offered"
                value={profile.servicesOffered.length ? profile.servicesOffered.join(", ") : "Select options"}
                onPress={() =>
                  router.push({
                    pathname: "/account/edit-field",
                    params: {
                      field: "servicesOffered",
                      title: "Services offered",
                      value: profile.servicesOffered.join(", "),
                    },
                  })
                }
              />
              <Row
                title="Trade specialties"
                value={profile.specialties.length ? profile.specialties.join(", ") : "Select options"}
                onPress={() =>
                  router.push({
                    pathname: "/account/edit-field",
                    params: {
                      field: "specialties",
                      title: "Trade specialties",
                      value: profile.specialties.join(", "),
                    },
                  })
                }
              />
              <Row
                title="Service areas"
                value={profile.serviceAreas.length ? profile.serviceAreas.join(", ") : "Add suburbs/regions"}
                onPress={() =>
                  router.push({
                    pathname: "/account/edit-field",
                    params: {
                      field: "serviceAreas",
                      title: "Service areas",
                      value: profile.serviceAreas.join(", "),
                    },
                  })
                }
              />
            </SectionCard>

            <View style={{ height: insets.bottom + 40 }} />
          </>
        )}
      </ScrollView>

    </View>
  );
}
