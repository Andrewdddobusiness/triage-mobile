import { createContext, useContext, type PropsWithChildren } from "react";
import { supabase } from "~/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { Alert, Linking } from "react-native";

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  subscriptionLoading: boolean;
  checkSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  session: null,
  isLoading: true,
  hasActiveSubscription: false,
  subscriptionLoading: false,
  checkSubscription: async () => {},
  openCustomerPortal: async () => {},
});

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const checkSubscription = async () => {
    if (!session?.user?.id) {
      setSubscriptionLoading(false);
      return;
    }

    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-check-subscription", {
        body: { userId: session.user.id },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setHasActiveSubscription(false);
        return;
      }

      setHasActiveSubscription(data?.hasActiveSubscription || false);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasActiveSubscription(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
      // Don't call checkSubscription here - let the next useEffect handle it
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setHasActiveSubscription(false);
        setSubscriptionLoading(false);
      }
      // Don't call checkSubscription here either
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Separate useEffect to handle subscription checking when session changes
  useEffect(() => {
    if (session) {
      checkSubscription();
    } else {
      setHasActiveSubscription(false);
      setSubscriptionLoading(false);
    }
  }, [session]); // This will run whenever session changes

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const openCustomerPortal = async () => {
    if (!session?.user?.id) {
      Alert.alert("Error", "You must be logged in to manage your subscription.");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("stripe-customer-portal", {
        body: { userId: session.user.id },
      });

      if (error) {
        console.error("Error opening customer portal:", error);
        Alert.alert("Error", "Failed to open customer portal. Please try again.");
        return;
      }

      if (data?.url) {
        // Open the Stripe customer portal URL
        await Linking.openURL(data.url);
      } else {
        Alert.alert("Error", "No portal URL received. Please try again.");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      Alert.alert("Error", "Failed to open customer portal. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        session,
        isLoading,
        hasActiveSubscription,
        subscriptionLoading,
        checkSubscription,
        openCustomerPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
