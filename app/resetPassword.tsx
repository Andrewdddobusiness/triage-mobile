import React, { useState } from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { supabase } from "~/lib/supabase";
import { X } from "lucide-react-native";

const { width } = Dimensions.get("window");
const WEB_RESET_REDIRECT =
  process.env.EXPO_PUBLIC_WEB_RESET_URL || "https://triage-web.vercel.app/auth/callback?redirect_to=/dashboard";

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Please enter the email you used to sign up.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: WEB_RESET_REDIRECT,
      });
      if (resetError) {
        throw resetError;
      }
      setMessage("If an account exists for this email, a reset link has been sent.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError("Couldn't send reset email. Please double-check your address and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FAFAFA",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="px-6"
    >
      <View className="absolute top-0 right-0 mt-16 mr-4">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#202020" />
        </TouchableOpacity>
      </View>

      <View className="mt-16 mb-4">
        <Text className="text-[#202020] text-3xl font-semibold">Reset your password</Text>
        <Text className="text-[#202020] text-base mt-2">
          Enter the email you use for Triage and we'll send a reset link.
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-[#202020] text-base mb-4 font-semibold">Email</Text>
        <View className="mb-4">
          <Input
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
              setMessage("");
            }}
            className="text-black px-4 py-3 text-base rounded-full"
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>

        {error ? <Text className="text-red-500 text-sm mb-3 px-1">{error}</Text> : null}
        {message ? <Text className="text-green-600 text-sm mb-3 px-1">{message}</Text> : null}

        <TouchableOpacity
          disabled={loading}
          className="mt-2"
          style={{
            width: width - 48,
            alignSelf: "center",
            borderRadius: 9999,
            overflow: "hidden",
            opacity: loading ? 0.8 : 1,
          }}
          onPress={handleReset}
        >
          <LinearGradient
            colors={["#ffb351", "#fe885a", "#ffa2a3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, alignItems: "center" }}
          >
            <Text className="text-white text-lg font-semibold">{loading ? "Sending..." : "Send reset link"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View className="flex-row justify-center gap-x-1 mt-6">
          <Text className="text-[#202020]">Remembered your password?</Text>
          <TouchableOpacity onPress={() => router.replace("/signIn")}>
            <Text className="text-[#fe885a] font-medium">Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
