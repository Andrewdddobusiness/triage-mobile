import React from "react";
import { View, Alert, AppState } from "react-native";
import { Link, router } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useSession } from "~/lib/auth/ctx";

import { supabase } from "../lib/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function SignUpScreen() {
  const { signUp } = useSession();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      await signUp(email, password);
      Alert.alert("Success", "Please check your email for verification!");
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
          <Text className="text-2xl font-bold text-foreground text-center">Create Account</Text>
          <Text className="text-muted-foreground text-center">Sign up for a new account</Text>
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

          <Button variant="default" className="w-full" onPress={handleSignUp} disabled={loading}>
            <Text className="text-primary-foreground font-medium">{loading ? "Creating account..." : "Sign Up"}</Text>
          </Button>

          <View className="flex-row justify-center gap-x-1">
            <Text className="text-muted-foreground">Already have an account?</Text>
            <Link href="/signIn">
              <Text className="text-primary font-medium">Sign In</Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
