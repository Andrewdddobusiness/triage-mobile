import React from "react";
import { View, Image, Dimensions, TouchableOpacity, Alert, AppState } from "react-native";
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";
import { X } from "lucide-react-native";
import Icon6 from "@expo/vector-icons/FontAwesome6";


import { useGoogleSignIn } from "~/hooks/useGoogleSignIn";

const { width } = Dimensions.get("window");

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const { signInWithGoogle } = useGoogleSignIn();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage(""); // Clear any previous errors

      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error cases
        const errorText = error.message.toLowerCase();

        if (errorText.includes("email not confirmed") || errorText.includes("email confirmation")) {
          setErrorMessage(
            "Please confirm your email address before signing in. Check your inbox for a confirmation link."
          );
        } else if (
          errorText.includes("invalid login") ||
          errorText.includes("incorrect password") ||
          errorText.includes("invalid credentials")
        ) {
          setErrorMessage("Incorrect email or password. Please try again.");
        } else if (errorText.includes("rate limit") || errorText.includes("too many requests")) {
          setErrorMessage("Too many sign-in attempts. Please try again later.");
        } else if (errorText.includes("network") || errorText.includes("connection")) {
          setErrorMessage("Network error. Please check your internet connection and try again.");
        } else {
          setErrorMessage("An unexpected error occurred. Please try again later.");
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(""); // Clear any previous errors

      await signInWithGoogle();
      // signInWithGoogle already handles navigation to /(tabs)
    } catch (error) {
      console.error("Google Sign-in error:", error);
      setErrorMessage("Error signing in with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FAFAFA", // Off white background
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="px-6"
    >
      {/* Logo */}
      <View className="mt-16 mb-8 flex-row justify-center items-center ">
        <Image
          source={require("../assets/images/logo/color/logo-color-1.png")}
          className="w-10 h-10 mr-2"
          resizeMode="contain"
        />
      </View>

      <View className="mb-8 flex-row justify-center items-center ">
        <Text className="text-[#202020] text-3xl font-semibold">Welcome back!</Text>
      </View>

      <View className="absolute top-0 right-0 mt-16 mr-4">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#202020" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {/* Form */}
        <Text className="text-[#202020] text-base mb-4 font-semibold">Enter your email</Text>
        <View className=" mb-4">
          <Input
            placeholder="Your email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage(""); // Clear error when user types
            }}
            className="text-black px-4 py-3 text-base rounded-full"
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>
        <Text className="text-[#202020] text-base mb-4 font-semibold">Password</Text>
        <View className=" mb-2 relative">
          <Input
            placeholder="Your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMessage(""); // Clear error when user types
            }}
            className="text-black px-4 py-3 text-base pr-12 rounded-full"
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 16,
              top: 0,
              bottom: 0,
              justifyContent: "center",
            }}
          >
            <Icon6 name={showPassword ? "eye-slash" : "eye"} size={20} color="rgba(0,0,0,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {errorMessage ? (
          <Text className="text-red-500 text-sm mb-4 px-4">{errorMessage}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* Reset password temporarily disabled on mobile; use web flow if needed */}
        <View className="mb-6" />
        <TouchableOpacity
          disabled={loading}
          className="mb-4"
          style={{
            width: width - 48,
            alignSelf: "center",
            borderRadius: 9999,
            overflow: "hidden",
          }}
          onPress={handleSignIn}
        >
          <LinearGradient
            colors={["#ffb351", "#fe885a", "#ffa2a3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, alignItems: "center" }}
          >
            <Text className="text-white text-lg font-semibold">{loading ? "Signing in..." : "Sign In"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider with OR */}
        <View className="flex flex-row items-center mb-4">
          <View className="flex h-[1px] flex-1 bg-black/50" />
          <Text className="mx-3 text-black/80">or</Text>
          <View className="flex h-[1px] flex-1 bg-black/50" />
        </View>

        {/* Google Sign-In Button */}
        <LinearGradient
          colors={["#ffb351", "#fe885a", "#ffa2a3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 9999, // fully rounded
            padding: 2, // thickness of the border
            width: width - 48,
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={isSubmitting}
            activeOpacity={0.8}
            style={{
              backgroundColor: "white",
              borderRadius: 9999,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              width: "100%",
            }}
          >
            <Image source={require("~/assets/images/icons/google.png")} className="w-8 h-8 rounded-full mr-2" />
            <Text style={{ color: "#fe885a", fontWeight: "bold" }}>Sign in with Google</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Already have an account link */}
        <View className="flex-row justify-center gap-x-1 mt-6">
          <Text className="text-[#202020]">Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/signUp")}>
            <Text className="text-[#fe885a] font-medium">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
