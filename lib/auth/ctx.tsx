import { createContext, useContext, type PropsWithChildren, useRef } from "react";
import { supabase } from "~/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { Alert, Linking } from "react-native";
import { trackEvent } from "../utils/analytics";

type SubscriptionStatus = {
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  subscription: any;
};

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  subscriptionData: any;
  subscriptionLoading: boolean;
  checkSubscription: () => Promise<SubscriptionStatus>;
  openCustomerPortal: () => Promise<void>;
}>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  session: null,
  isLoading: true,
  hasActiveSubscription: false,
  hasSubscriptionHistory: false,
  subscriptionData: null,
  subscriptionLoading: false,
  checkSubscription: async () => ({
    hasActiveSubscription: false,
    hasSubscriptionHistory: false,
    subscription: null,
  }),
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
  const [hasSubscriptionHistory, setHasSubscriptionHistory] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [inFlightCheck, setInFlightCheck] = useState<Promise<SubscriptionStatus> | null>(null);
  const previousSession = useRef<Session | null>(null);

  const checkSubscription = async (): Promise<SubscriptionStatus> => {
    if (!session?.user?.id) {
      setSubscriptionLoading(false);
      return {
        hasActiveSubscription: false,
        hasSubscriptionHistory: false,
        subscription: null,
      };
    }

    // Deduplicate concurrent calls by returning the same promise
    if (inFlightCheck) {
      return inFlightCheck;
    }

    setSubscriptionLoading(true);

    const promise = (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("stripe-check-subscription", {
          body: { userId: session.user.id },
        });

        if (error) {
          console.error("Error checking subscription:", error);
          setHasActiveSubscription(false);
          setHasSubscriptionHistory(false);
          setSubscriptionData(null);
          return {
            hasActiveSubscription: false,
            hasSubscriptionHistory: false,
            subscription: null,
          };
        }

        const status: SubscriptionStatus = {
          hasActiveSubscription: data?.hasActiveSubscription || false,
          hasSubscriptionHistory: data?.hasSubscriptionHistory || false,
          subscription: data?.subscription || null,
        };

        setHasActiveSubscription(status.hasActiveSubscription);
        setHasSubscriptionHistory(status.hasSubscriptionHistory);
        setSubscriptionData(status.subscription);

        return status;
      } catch (error) {
        console.error("Error checking subscription:", error);
        setHasActiveSubscription(false);
        setHasSubscriptionHistory(false);
        setSubscriptionData(null);
        return {
          hasActiveSubscription: false,
          hasSubscriptionHistory: false,
          subscription: null,
        };
      } finally {
        setSubscriptionLoading(false);
        setInFlightCheck(null);
      }
    })();

    setInFlightCheck(promise);
    return promise;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      previousSession.current = session;
      setIsLoading(false);
      // Don't call checkSubscription here - let the next useEffect handle it
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session && previousSession.current) {
        trackEvent("auth_session_lost", { event });
      }
      previousSession.current = session;
      if (!session) {
        setHasActiveSubscription(false);
        setSubscriptionData(null);
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
      setSubscriptionData(null);
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
        hasSubscriptionHistory,
        subscriptionData,
        subscriptionLoading,
        checkSubscription,
        openCustomerPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
