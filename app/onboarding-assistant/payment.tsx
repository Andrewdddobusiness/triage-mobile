import { View, Button } from "react-native";
import { Text } from "~/components/ui/text";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { useSession } from "~/lib/auth/ctx";
import { router } from "expo-router";

export default function PaymentScreen() {
  const { session, checkSubscription } = useSession();

  const handleSubscribe = async () => {
    if (!session?.user?.email) {
      console.error('No user email found');
      return;
    }

    try {
      // Update this URL to your actual backend URL
      const response = await fetch("YOUR_BACKEND_URL/create-subscription-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      const { url } = await response.json();
      Linking.openURL(url); // Open Stripe Checkout
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener("url", async ({ url }) => {
      if (url.includes("payment-success")) {
        console.log("✅ Subscription successful");
        // Refresh subscription status
        await checkSubscription();
        // Navigate to main app
        router.replace("/(tabs)");
      } else if (url.includes("payment-cancelled")) {
        console.log("❌ Subscription cancelled");
        // Stay on payment page
      }
    });

    return () => subscription.remove();
  }, [checkSubscription]);

  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-2xl font-bold mb-4">Subscribe to Spaak Pro</Text>
      <Text className="text-center mb-8 text-muted-foreground">
        Get access to all premium features including AI assistant setup, 
        phone number management, and advanced analytics.
      </Text>
      <Button title="Subscribe Now" onPress={handleSubscribe} />
    </View>
  );
}
