import React from "react";
import { View, Alert, AppState } from "react-native";
import { Link, router } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function SignInScreen() {
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
    <View className="flex-1 justify-center p-4 bg-background">
      <View className="gap-y-6">
        <View className="gap-y-2">
          <Text className="text-2xl font-bold text-foreground text-center">Welcome Back</Text>
          <Text className="text-muted-foreground text-center">Sign in to your account</Text>
        </View>

        <View className="gap-y-4">
          <Input
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

          <Button variant="default" className="w-full" onPress={handleSignIn} disabled={loading}>
            <Text className="text-primary-foreground font-medium">{loading ? "Signing in..." : "Sign In"}</Text>
          </Button>

          <View className="flex-row justify-center space-x-1">
            <Text className="text-muted-foreground">Don't have an account? </Text>
            <Link href="/signUp">
              <Text className="text-primary font-medium">Sign Up</Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
