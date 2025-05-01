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
          style={{
            width: width - 48,
            alignSelf: "center",
            borderRadius: 9999,
            overflow: "hidden",
            marginBottom: 24,
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
      </View>
    </View>
  );
}
