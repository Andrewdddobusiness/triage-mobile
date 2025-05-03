import React from "react";
import { View, Image, Dimensions, TouchableOpacity, Alert, AppState } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";
import { X } from "lucide-react-native";

import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

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
  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { signInWithGoogle } = useGoogleSignIn();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        console.log("hi");
        router.replace("/(tabs)");
      } else {
        console.log("Google SignIn was cancelled");
      }
      setIsSubmitting(false);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("Google SignIn in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Play services are not available");
            break;
        }
      } else {
        console.log("An error occurred");
      }
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
      <View className="mt-16 mb-10 flex-row justify-center items-center ">
        <Image
          source={require("../assets/images/logo/color/logo-color-1.png")}
          className="w-10 h-10 mr-2"
          resizeMode="contain"
        />
        <Text className="text-[#202020] text-3xl font-semibold">Spaak</Text>
      </View>

      <View className="absolute top-0 right-0 mt-16 mr-4">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#202020" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 mx-4">
        {/* Form */}
        <Text className="text-[#202020] text-base mb-4 font-semibold">Enter your email</Text>
        <View className="bg-[#EAEAEA] rounded-xl overflow-hidden mb-4">
          <Input
            placeholder="Your email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            className="text-black px-4 py-3 text-base"
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>
        <Text className="text-[#202020] text-base mb-4 font-semibold">Password</Text>
        <View className="bg-[#EAEAEA] rounded-xl overflow-hidden mb-4">
          <Input
            placeholder="Your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="text-black px-4 py-3 text-base"
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>
        <TouchableOpacity>
          <Text className="text-[#202020] underline mb-6">Don't know your password?</Text>
        </TouchableOpacity>
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
            onPress={signInWithGoogle}
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
      </View>
    </View>
  );
}
