import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { useSession } from "~/lib/auth/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileActionButton } from "~/components/ui/profile-action-button";
import {
  Settings,
  HelpCircle,
  MessageCircle,
  Pencil,
  LogOut,
  User,
  Copy,
  Check,
  Crown,
  RefreshCw,
  Calendar,
  AlertCircle,
} from "lucide-react-native";
import { userService } from "~/lib/services/userService";
import { supabase } from "~/lib/supabase";
import { trackEvent } from "~/lib/utils/analytics";

import IconF from "@expo/vector-icons/FontAwesome";
import IconEn from "@expo/vector-icons/Entypo";
import IconIon from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { palette, radii, shadows } from "~/lib/theme";
import { copySensitiveToClipboard } from "~/lib/utils/piiClipboard";
import { maskPhone } from "~/lib/utils/pii";
import { UpsellModal } from "~/components/ui/UpsellModal";

export default function ProfileScreen() {
  const {
    signOut,
    session,
    hasActiveSubscription,
    subscriptionData,
    subscriptionLoading,
    checkSubscription,
    openCustomerPortal,
  } = useSession();
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [businessNumber, setBusinessNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [supportLinkError, setSupportLinkError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<string | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  // Get user data from session
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const profile = await userService.getUserProfile(session.user.id);
          setUserProfile(profile);
          const { data: deletionReq } = await supabase
            .from("account_deletion_requests")
            .select("status")
            .eq("auth_user_id", session.user.id)
            .order("requested_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          setDeletionStatus(deletionReq?.status || null);

          // Fetch the assigned business phone number
          const { data: serviceProvider, error: spError } = await supabase
            .from("service_providers")
            .select("id")
            .eq("auth_user_id", session.user.id)
            .single();

          if (spError) throw spError;

          const { data: phoneNumbers, error: phoneError } = await supabase
            .from("twilio_phone_numbers")
            .select("phone_number")
            .eq("assigned_to", serviceProvider.id)
            .not("assigned_at", "is", null)
            .single();

          if (!phoneError && phoneNumbers) {
            setBusinessNumber(phoneNumbers.phone_number);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [session]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [copied]);

  // Copy phone number to clipboard
  const copyToClipboard = async () => {
    if (businessNumber) {
      const didCopy = await copySensitiveToClipboard(businessNumber, "Business phone number");
      if (didCopy) {
        setCopied(true);
        trackEvent("profile_business_number_copied");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBillingStatus = () => {
    if (!subscriptionData) return "No Plan";

    switch (subscriptionData.status) {
      case "active":
        return subscriptionData.cancel_at_period_end ? "Canceling" : "Active";
      case "trialing":
        return "Trialing";
      case "past_due":
        return "Past Due";
      case "canceled":
        return "Canceled";
      default:
        return subscriptionData.status;
    }
  };

  const getStatusColor = () => {
    if (!subscriptionData) return "text-gray-500";

    switch (subscriptionData.status) {
      case "active":
        return subscriptionData.cancel_at_period_end ? "text-orange-500" : "text-green-500";
      case "trialing":
        return "text-blue-500";
      case "past_due":
        return "text-red-500";
      case "canceled":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 80,
        backgroundColor: palette.surfaceMuted,
      }}
    >
      {/* Profile Header */}
      <View
        className="items-center"
        style={[
          {
            backgroundColor: palette.surface,
            padding: 24,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: radii.card,
            borderWidth: 1,
            borderColor: palette.border,
          },
          shadows.card,
        ]}
      >
        {/* Profile Image with Edit Button */}
        <View className="relative">
          <View
            className="items-center justify-center"
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: palette.surfaceMuted,
              borderWidth: 1,
              borderColor: palette.border,
            }}
          >
            <User size={36} color="#adb5bd" />
          </View>
        </View>

        {/* User Info */}
        <Text className="text-xl font-semibold mt-4" style={{ color: palette.text }}>
          {userProfile.name}
        </Text>

        {/* Subscription Plan */}
        {hasActiveSubscription ? (
          <View
            className="flex-row items-center"
            style={{
              marginTop: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: radii.pill,
              backgroundColor: "#fe885a1a",
            }}
          >
            <Crown size={14} color={palette.primary} />
            <Text className="text-sm font-medium ml-1" style={{ color: palette.primary }}>
              Pro Plan
            </Text>
          </View>
        ) : (
          <Text className="text-sm font-medium mt-1" style={{ color: palette.textMuted }}>
            No active plan
          </Text>
        )}

        {/* Business Phone Number */}
        {businessNumber ? (
          <View className="mt-3 items-center">
            <Text className="text-sm mb-1" style={{ color: palette.textMuted }}>
              Provided Business Number
            </Text>
            <View className="flex-row items-center">
              <Text className="text-base font-medium" style={{ color: palette.primary }}>
                {maskPhone(businessNumber)}
              </Text>
              <Pressable
                onPress={copyToClipboard}
                className="ml-2"
                style={{ padding: 6, borderRadius: radii.button, backgroundColor: palette.surfaceMuted }}
              >
                {copied ? <Check size={18} color={palette.success} /> : <Copy size={18} color={palette.primary} />}
              </Pressable>
            </View>
            <Text className="text-xs mt-1" style={{ color: palette.textMuted }}>
              Full number hidden; copy to use it safely.
            </Text>
          </View>
        ) : (
          <View className="mt-3 items-center">
            <Text className="text-sm" style={{ color: palette.textMuted }}>
              No business number assigned
            </Text>
          </View>
        )}
      </View>

      {/* Actions List */}
      <View className="mt-4 space-y-3 px-4">
        <ProfileActionButton
          label="Subscription"
          icon={<Crown size={20} color="#adb5bd" />}
          onPress={() => router.push("/subscription")}
        />
        {!hasActiveSubscription && (
          <ProfileActionButton
            label="Upgrade to Pro"
            icon={<IconEn name={"price-tag"} size={20} color="#fe885a" />}
            onPress={() => setShowUpsell(true)}
          />
        )}
        <ProfileActionButton
          label="Account"
          icon={<IconIon name={"person"} size={20} color="#adb5bd" />}
          onPress={() => router.push("/account")}
        />
        <ProfileActionButton
          label="Help & Info"
          icon={<IconEn name={"help-with-circle"} size={20} color="#adb5bd" />}
          onPress={() => router.push("/help")}
        />
        <ProfileActionButton
          label={deletionStatus ? `Delete Account (${deletionStatus})` : "Delete Account"}
          icon={<IconF name="trash" size={20} color="#ef4444" />}
          onPress={async () => {
            if (deletionStatus && deletionStatus !== "failed") {
              Alert.alert("Deletion in progress", "Your account deletion request is already being processed.");
              return;
            }
            Alert.alert(
              "Delete account",
              "This will permanently delete your account and linked data. This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    if (!session?.user) return;
                    try {
                      setDeleting(true);
                      const { error } = await supabase.functions.invoke("request-account-deletion", {
                        body: { authUserId: session.user.id },
                      });
                      if (error) throw error;
                      Alert.alert("Deletion requested", "We’re processing your deletion request. You’ll be signed out.", [
                        {
                          text: "OK",
                          onPress: () => signOut(),
                        },
                      ]);
                    } catch (err) {
                      Alert.alert("Could not request deletion", "Please try again or contact support.");
                      console.error(err);
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ]
            );
          }}
          variant="destructive"
        />
        <ProfileActionButton
          label="Sign Out"
          icon={<IconF name="sign-out" size={20} color="#ef4444" />}
          onPress={signOut}
          variant="destructive"
        />
      </View>
      <UpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        onUpgrade={() => {
          setShowUpsell(false);
          router.push("/onboarding-assistant/payment");
        }}
        message="Unlock AI assistant, calling, and notifications with Spaak Pro for 59 AUD/month. Cancel anytime."
        primaryCtaLabel="Get Pro for 59 AUD/mo"
      />
    </ScrollView>
  );
}
