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
    <LinearGradient
      colors={["#ffb351", "#fe885a", "#ffa2a3"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="px-6"
    >
      {/* Logo */}
      <View className="mt-16 mb-10 flex-row justify-center items-center">
        <Image
          source={require("../assets/images/logo/white/logo-white-1.png")}
          className="w-10 h-10 mr-2"
          resizeMode="contain"
        />
        <Text className="text-white text-3xl font-semibold">Podium</Text>
      </View>

      <View className="absolute top-0 right-0 mt-16 mr-4">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 mx-4">
        {/* Form */}
        <View className="flex-1 w-full">
          <Text className="text-white text-base mb-4 font-semibold">Enter your email</Text>

          <View className="bg-white/20 rounded-xl overflow-hidden mb-4">
            <Input
              placeholder="Your email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              className="text-black px-4 py-3 text-base"
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          </View>

          <Text className="text-white text-base mb-4 font-semibold">Password</Text>
          <View className="bg-white/20 rounded-xl overflow-hidden mb-4">
            <Input
              placeholder="Your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="text-black px-4 py-3 text-base"
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          </View>

          <TouchableOpacity>
            <Text className="text-white underline mb-6">Don't know your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-full py-4 items-center mb-6"
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text className="text-orange-400 text-lg font-semibold">{loading ? "Signing in..." : "Next"}</Text>
          </TouchableOpacity>
        </View>

        {/* <View className="flex-row items-center my-5">
          <View className="flex-1 h-px bg-white/30" />
          <Text className="text-white px-3">or</Text>
          <View className="flex-1 h-px bg-white/30" />
        </View> */}

        {/* Google button */}
        {/* <TouchableOpacity className="bg-white rounded-full flex-row items-center justify-center py-3 px-5 mb-4">
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
            }}
            className="w-6 h-6 mr-3"
          />
          <Text className="text-[#333] text-base font-medium">Sign in with Google</Text>
        </TouchableOpacity> */}

        {/* Apple button */}
        {/* <TouchableOpacity className="bg-white rounded-full flex-row items-center justify-center py-3 px-5">
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            }}
            className="w-6 h-6 mr-3"
          />
          <Text className="text-[#333] text-base font-medium">Sign in with Apple</Text>
        </TouchableOpacity> */}
      </View>
    </LinearGradient>
  );
}
